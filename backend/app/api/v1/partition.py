import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import shape as shapely_shape
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db, RoleChecker
from app.models.owner import Owner
from app.models.parcel import Parcel
from app.models.partition import PartitionPlan, PlanType, PlanStatus
from app.models.partition_parcel import PartitionParcel
from app.models.score import Score
from app.models.user import User
from app.schemas.partition import (
    PartitionCreate, PartitionGenerateRequest, PartitionListResponse,
    PartitionResponse, PartitionParcelResponse, PlanComparisonResponse,
)
from app.services.gis.geometry_engine import (
    geojson_to_shapely, shapely_to_geojson, calculate_area,
)
from app.services.partition.partition_engine import generate_partition
from app.services.legal.scoring_engine import ScoreManager
from app.services.legal.compliance_checker import Rule109ComplianceChecker
from app.services.ai.recommendation_engine import generate_recommendation_summary

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/generate")
async def generate_partition_plans(
    request: PartitionGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Parcel).where(Parcel.id == request.parcel_id, Parcel.is_active == True))
    parcel = result.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    owners_result = await db.execute(select(Owner).where(Owner.parcel_id == request.parcel_id))
    owners = owners_result.scalars().all()
    if not owners:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No owners found for this parcel")

    owner_list = [
        {
            "id": str(o.id),
            "owner_name": o.owner_name,
            "share_percentage": o.share_percentage,
            "existing_possession": o.existing_possession,
            "road_frontage_score": 50.0,
        }
        for o in owners
    ]

    plans_created = []
    for plan_type in ["compactness", "possession", "commercial"]:
        plan_result = generate_partition(
            {"geometry": shapely_to_geojson(to_shape(parcel.geometry))} if parcel.geometry else {},
            owner_list,
            mode=plan_type,
        )

        plan = PartitionPlan(
            parcel_id=request.parcel_id,
            plan_name=f"{plan_type.capitalize()} Plan - {parcel.village or 'Parcel'}",
            plan_type=plan_type,
            description=f"Rule 109 optimized {plan_type} partition plan",
            parameters={"mode": request.mode, "num_owners": len(owner_list)},
            created_by=current_user.id,
            status=PlanStatus.GENERATED,
        )
        db.add(plan)
        await db.flush()

        score_manager = ScoreManager()
        scores = score_manager.compute_all(
            plan_result.get("allotments", []),
            owner_list,
            {"roads": [], "commercial_zones": [], "original_parcel": {}, "possessions": [], "settlements": []},
        )

        score_record = Score(
            partition_plan_id=plan.id,
            share_compliance=scores.get("share_compliance", 0),
            compactness=scores.get("compactness", 0),
            road_frontage=scores.get("road_frontage", 0),
            commercial_fairness=scores.get("commercial_fairness", 0),
            field_preservation=scores.get("field_preservation", 0),
            possession_preservation=scores.get("possession_preservation", 0),
            family_settlement=scores.get("family_settlement", 0),
            overall_score=scores.get("overall_score", 0),
            details=scores.get("details", {}),
        )
        db.add(score_record)

        for i, allotment in enumerate(plan_result.get("allotments", [])):
            alloc_geom = allotment.get("geometry")
            db_geom = None
            if alloc_geom:
                g = geojson_to_shapely(alloc_geom) if isinstance(alloc_geom, dict) else alloc_geom
                db_geom = from_shape(g, srid=4326)

            pp = PartitionParcel(
                partition_plan_id=plan.id,
                owner_id=UUID(allotment["owner_id"]) if allotment.get("owner_id") else None,
                allocated_area=allotment.get("actual_area", 0),
                allocated_geometry=db_geom,
                compactness_score=allotment.get("compactness_score", 0),
                road_frontage_length=allotment.get("road_frontage_length", 0),
                commercial_value_score=allotment.get("commercial_value_score", 0),
                possession_score=allotment.get("possession_score", 0),
                allotment_order=i + 1,
            )
            db.add(pp)

        await db.flush()
        await db.refresh(plan)
        plans_created.append({"plan": plan, "scores": scores})

    await db.commit()
    return {"message": "All 3 partition plans generated", "parcel_id": str(request.parcel_id)}


@router.get("/plans", response_model=PartitionListResponse)
async def list_plans(
    parcel_id: Optional[UUID] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(PartitionPlan).where(PartitionPlan.is_active == True)
    if parcel_id:
        stmt = stmt.where(PartitionPlan.parcel_id == parcel_id)
    count_stmt = select(__import__("sqlalchemy").func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    stmt = stmt.order_by(PartitionPlan.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    plans = result.scalars().all()

    items = []
    for plan in plans:
        items.append(await _plan_to_dict(plan, db))
    return PartitionListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/plans/{plan_id}", response_model=PartitionResponse)
async def get_plan(
    plan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(PartitionPlan).where(PartitionPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return await _plan_to_dict(plan, db)


@router.get("/plans/{plan_id}/comparison", response_model=PlanComparisonResponse)
async def compare_plans(
    plan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(PartitionPlan).where(PartitionPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    sibling_result = await db.execute(
        select(PartitionPlan).where(
            PartitionPlan.parcel_id == plan.parcel_id,
            PartitionPlan.is_active == True,
        )
    )
    all_plans = sibling_result.scalars().all()

    plans_dict = {}
    for p in all_plans:
        plans_dict[p.plan_type] = await _plan_to_dict(p, db)

    recommendation_result = generate_recommendation_summary(
        [{"id": str(p.id), "plan_name": p.plan_name, "plan_type": p.plan_type,
          "scores": next(
              ({"overall_score": s.overall_score, "share_compliance": s.share_compliance,
                "compactness": s.compactness, "road_frontage": s.road_frontage}
               for s in p.scores), {"overall_score": 0}),
          "compliance": {}}
         for p in all_plans]
    )

    return PlanComparisonResponse(
        parcel_id=plan.parcel_id,
        compactness_plan=plans_dict.get("compactness"),
        possession_plan=plans_dict.get("possession"),
        commercial_plan=plans_dict.get("commercial"),
        recommended=recommendation_result.get("recommended_plan_type"),
    )


@router.get("/plans/{plan_id}/allotments")
async def get_allotments(
    plan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PartitionParcel)
        .where(PartitionParcel.partition_plan_id == plan_id)
        .order_by(PartitionParcel.allotment_order)
    )
    allotments = result.scalars().all()

    return {
        "items": [
            {
                "id": a.id,
                "partition_plan_id": a.partition_plan_id,
                "owner_id": a.owner_id,
                "owner_name": a.owner_rel.owner_name if a.owner_rel else None,
                "allocated_area": a.allocated_area,
                "allocated_geometry": shapely_to_geojson(to_shape(a.allocated_geometry)) if a.allocated_geometry else None,
                "compactness_score": a.compactness_score,
                "road_frontage_length": a.road_frontage_length,
                "commercial_value_score": a.commercial_value_score,
                "possession_score": a.possession_score,
                "allotment_order": a.allotment_order,
                "notes": a.notes,
            }
            for a in allotments
        ],
        "total": len(allotments),
    }


@router.get("/plans/{plan_id}/allotments/{allotment_id}/explain")
async def explain_allotment(
    plan_id: UUID,
    allotment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PartitionParcel).where(
            PartitionParcel.id == allotment_id,
            PartitionParcel.partition_plan_id == plan_id,
        )
    )
    allotment = result.scalar_one_or_none()
    if not allotment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Allotment not found")

    owner_info = {"owner_name": allotment.owner_rel.owner_name if allotment.owner_rel else "Unknown",
                  "share_percentage": allotment.owner_rel.share_percentage if allotment.owner_rel else 0}

    from app.services.ai.explanation_engine import explain_allotment as explain_allotment_engine
    explanation = explain_allotment_engine(
        {"actual_area": allotment.allocated_area, "compactness_score": allotment.compactness_score},
        owner_info,
    )
    return {"allotment_id": allotment_id, "explanation": explanation}


@router.post("/plans/{plan_id}/approve")
async def approve_plan(
    plan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "revenue_officer"])),
):
    result = await db.execute(select(PartitionPlan).where(PartitionPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    plan.status = PlanStatus.APPROVED
    db.add(plan)
    await db.flush()
    return {"message": "Plan approved", "plan_id": str(plan_id), "status": "approved"}


@router.post("/plans/{plan_id}/reject")
async def reject_plan(
    plan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "revenue_officer"])),
):
    result = await db.execute(select(PartitionPlan).where(PartitionPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    plan.status = PlanStatus.REJECTED
    db.add(plan)
    await db.flush()
    return {"message": "Plan rejected", "plan_id": str(plan_id), "status": "rejected"}


@router.get("/recommendations")
async def get_recommendations(
    parcel_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PartitionPlan).where(
            PartitionPlan.parcel_id == parcel_id,
            PartitionPlan.is_active == True,
        )
    )
    plans = result.scalars().all()

    plans_with_scores = []
    for plan in plans:
        score_result = await db.execute(select(Score).where(Score.partition_plan_id == plan.id))
        score = score_result.scalar_one_or_none()
        plans_with_scores.append({
            "id": plan.id,
            "plan_name": plan.plan_name,
            "plan_type": plan.plan_type,
            "scores": {
                "overall_score": score.overall_score if score else 0,
                "share_compliance": score.share_compliance if score else 0,
                "compactness": score.compactness if score else 0,
                "road_frontage": score.road_frontage if score else 0,
            },
            "compliance": {},
        })

    recommendation = generate_recommendation_summary(plans_with_scores)
    return recommendation


async def _plan_to_dict(plan: PartitionPlan, db: AsyncSession) -> Dict[str, Any]:
    allotments_result = await db.execute(
        select(PartitionParcel).where(PartitionParcel.partition_plan_id == plan.id)
    )
    allotments = allotments_result.scalars().all()

    scores_result = await db.execute(select(Score).where(Score.partition_plan_id == plan.id))
    scores = scores_result.scalars().all()

    return {
        "id": plan.id,
        "parcel_id": plan.parcel_id,
        "plan_name": plan.plan_name,
        "plan_type": plan.plan_type.value if hasattr(plan.plan_type, "value") else plan.plan_type,
        "description": plan.description,
        "parameters": plan.parameters,
        "status": plan.status.value if hasattr(plan.status, "value") else plan.status,
        "is_active": plan.is_active,
        "created_by": plan.created_by,
        "allotments": [
            {
                "id": a.id,
                "partition_plan_id": a.partition_plan_id,
                "owner_id": a.owner_id,
                "owner_name": a.owner_rel.owner_name if a.owner_rel else None,
                "allocated_area": a.allocated_area,
                "allocated_geometry": shapely_to_geojson(to_shape(a.allocated_geometry)) if a.allocated_geometry else None,
                "compactness_score": a.compactness_score,
                "road_frontage_length": a.road_frontage_length,
                "commercial_value_score": a.commercial_value_score,
                "possession_score": a.possession_score,
                "allotment_order": a.allotment_order,
                "notes": a.notes,
            }
            for a in allotments
        ],
        "scores": [
            {
                "share_compliance": s.share_compliance,
                "compactness": s.compactness,
                "road_frontage": s.road_frontage,
                "commercial_fairness": s.commercial_fairness,
                "field_preservation": s.field_preservation,
                "possession_preservation": s.possession_preservation,
                "family_settlement": s.family_settlement,
                "overall_score": s.overall_score,
            }
            for s in scores
        ],
        "created_at": plan.created_at,
        "updated_at": plan.updated_at,
    }
