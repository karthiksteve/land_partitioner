import json
import logging
from typing import Any, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.kurra import KurraReport
from app.models.decree import Decree, DecreeType, DecreeStatus
from app.models.partition import PartitionPlan
from app.models.partition_parcel import PartitionParcel
from app.models.score import Score
from app.models.owner import Owner
from app.models.parcel import Parcel
from app.models.user import User
from app.schemas.kurra import KurraGenerateRequest, KurraResponse
from app.schemas.decree import DecreeGenerateRequest, DecreeResponse
from app.services.reports.kurra_report import generate_kurra_report, _generate_kurra_pdf
from app.services.reports.decree_report import (
    generate_preliminary_decree, generate_final_decree, _generate_decree_pdf,
)
from app.services.reports.report_generator import generate_comparison_report, export_to_geojson, export_to_kml, export_to_csv

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/kurra/{plan_id}")
async def generate_kurra(
    plan_id: UUID,
    format: str = Query("pdf"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan_result = await db.execute(select(PartitionPlan).where(PartitionPlan.id == plan_id))
    plan = plan_result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    parcel_result = await db.execute(select(Parcel).where(Parcel.id == plan.parcel_id))
    parcel = parcel_result.scalar_one_or_none()

    owners_result = await db.execute(select(Owner).where(Owner.parcel_id == plan.parcel_id))
    owners = owners_result.scalars().all()

    allotments_result = await db.execute(
        select(PartitionParcel).where(PartitionParcel.partition_plan_id == plan_id)
    )
    allotments = allotments_result.scalars().all()

    scores_result = await db.execute(select(Score).where(Score.partition_plan_id == plan_id))
    score = scores_result.scalar_one_or_none()

    plan_dict = {
        "plan_name": plan.plan_name,
        "plan_type": plan.plan_type.value if hasattr(plan.plan_type, "value") else plan.plan_type,
        "parcel": {
            "pniu": parcel.pniu if parcel else None,
            "plot_number": parcel.plot_number if parcel else None,
            "survey_number": parcel.survey_number if parcel else None,
            "khata_number": parcel.khata_number if parcel else None,
            "village": parcel.village if parcel else None,
            "tehsil": parcel.tehsil if parcel else None,
            "district": parcel.district if parcel else None,
            "state": parcel.state if parcel else None,
            "total_area": parcel.total_area if parcel else 0,
            "land_type": parcel.land_type.value if parcel and hasattr(parcel.land_type, "value") else (parcel.land_type if parcel else None),
            "soil_type": parcel.soil_type if parcel else None,
            "irrigation_available": parcel.irrigation_available if parcel else False,
        },
        "owners": [
            {"owner_name": o.owner_name, "share_percentage": o.share_percentage,
             "existing_possession": o.existing_possession}
            for o in owners
        ],
        "allotments": [
            {
                "owner_id": str(a.owner_id) if a.owner_id else None,
                "owner_name": a.owner_rel.owner_name if a.owner_rel else None,
                "expected_area": a.allocated_area,
                "actual_area": a.allocated_area,
                "compactness_score": a.compactness_score,
                "share_percentage": a.owner_rel.share_percentage if a.owner_rel else 0,
                "road_frontage_length": a.road_frontage_length,
                "commercial_value_score": a.commercial_value_score,
                "possession_score": a.possession_score,
            }
            for a in allotments
        ],
        "scores": {
            "overall_score": score.overall_score if score else 0,
            "share_compliance": score.share_compliance if score else 0,
            "compactness": score.compactness if score else 0,
            "road_frontage": score.road_frontage if score else 0,
            "commercial_fairness": score.commercial_fairness if score else 0,
            "field_preservation": score.field_preservation if score else 0,
            "possession_preservation": score.possession_preservation if score else 0,
            "family_settlement": score.family_settlement if score else 0,
        },
        "possessions": [],
        "roads": [],
        "settlements": [],
    }

    report_data = generate_kurra_report(plan_dict)
    pdf_bytes = _generate_kurra_pdf(report_data)

    kurra = KurraReport(
        partition_plan_id=plan_id,
        report_data=report_data,
        generated_by=current_user.id,
        file_format=format,
    )
    db.add(kurra)
    await db.flush()
    await db.refresh(kurra)

    if format == "pdf":
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=kurra_report_{plan_id}.pdf"},
        )

    return KurraResponse(
        id=kurra.id,
        partition_plan_id=plan_id,
        report_data=report_data,
        pdf_path=None,
        file_format=format,
        generated_at=kurra.generated_at,
    )


@router.post("/preliminary-decree/{plan_id}")
async def generate_preliminary_decree_endpoint(
    plan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan_result = await db.execute(select(PartitionPlan).where(PartitionPlan.id == plan_id))
    plan = plan_result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    plan_dict = await _build_plan_dict(plan_id, db)
    decree_data = generate_preliminary_decree(plan_dict)

    decree = Decree(
        partition_plan_id=plan_id,
        decree_type=DecreeType.PRELIMINARY,
        decree_data=decree_data,
        legal_references={"sections": ["116", "117", "118"], "rules": ["109(a)-(g)"]},
        generated_by=current_user.id,
        status=DecreeStatus.DRAFT,
    )
    db.add(decree)
    await db.flush()
    await db.refresh(decree)

    return DecreeResponse(
        id=decree.id,
        partition_plan_id=plan_id,
        decree_type="preliminary",
        decree_data=decree_data,
        legal_references=decree.legal_references,
        pdf_path=None,
        status="draft",
        generated_at=decree.generated_at,
    )


@router.post("/final-decree/{plan_id}")
async def generate_final_decree_endpoint(
    plan_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan_result = await db.execute(select(PartitionPlan).where(PartitionPlan.id == plan_id))
    plan = plan_result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    plan_dict = await _build_plan_dict(plan_id, db)
    decree_data = generate_final_decree(plan_dict)
    pdf_bytes = _generate_decree_pdf(decree_data)

    decree = Decree(
        partition_plan_id=plan_id,
        decree_type=DecreeType.FINAL,
        decree_data=decree_data,
        legal_references={"sections": ["116", "117", "118", "119"], "rules": ["109(a)-(g)"]},
        generated_by=current_user.id,
        status=DecreeStatus.ISSUED,
    )
    db.add(decree)
    await db.flush()
    await db.refresh(decree)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=final_decree_{plan_id}.pdf"},
    )


@router.get("/{report_id}/download")
async def download_report(
    report_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    kurra_result = await db.execute(select(KurraReport).where(KurraReport.id == report_id))
    kurra = kurra_result.scalar_one_or_none()
    if kurra:
        pdf_bytes = _generate_kurra_pdf(kurra.report_data or {})
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=kurra_report_{report_id}.pdf"},
        )

    decree_result = await db.execute(select(Decree).where(Decree.id == report_id))
    decree = decree_result.scalar_one_or_none()
    if decree:
        pdf_bytes = _generate_decree_pdf(decree.decree_data or {})
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=decree_{report_id}.pdf"},
        )

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")


@router.get("/comparison")
async def get_comparison_report(
    plan_ids: str = Query(..., description="Comma-separated plan IDs"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ids = [UUID(pid.strip()) for pid in plan_ids.split(",")]
    plans_data = []
    for pid in ids:
        plan_dict = await _build_plan_dict(pid, db)
        if plan_dict:
            plans_data.append(plan_dict)

    comparison = generate_comparison_report(plans_data)
    return comparison


@router.post("/export/{plan_id}")
async def export_plan(
    plan_id: UUID,
    format: str = Query("geojson"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    allotments_result = await db.execute(
        select(PartitionParcel).where(PartitionParcel.partition_plan_id == plan_id)
    )
    allotments = allotments_result.scalars().all()

    features = []
    for a in allotments:
        if a.allocated_geometry:
            from geoalchemy2.shape import to_shape
            geom = to_shape(a.allocated_geometry)
            geojson_geom = __import__("shapely.geometry").geometry.mapping(geom)
            features.append({
                "type": "Feature",
                "properties": {
                    "owner_name": a.owner_rel.owner_name if a.owner_rel else None,
                    "area": a.allocated_area,
                    "compactness": a.compactness_score,
                },
                "geometry": geojson_geom,
            })

    fc = {"type": "FeatureCollection", "features": features}

    if format == "geojson":
        return fc
    elif format == "kml":
        kml = await export_to_kml(fc)
        return Response(content=kml, media_type="application/vnd.google-earth.kml+xml",
                        headers={"Content-Disposition": f"attachment; filename=plan_{plan_id}.kml"})
    elif format == "csv":
        csv_data = await export_to_csv([a["properties"] for a in features])
        return Response(content=csv_data, media_type="text/csv",
                        headers={"Content-Disposition": f"attachment; filename=plan_{plan_id}.csv"})
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")


async def _build_plan_dict(plan_id: UUID, db: AsyncSession) -> dict:
    plan_result = await db.execute(select(PartitionPlan).where(PartitionPlan.id == plan_id))
    plan = plan_result.scalar_one_or_none()
    if not plan:
        return {}

    parcel_result = await db.execute(select(Parcel).where(Parcel.id == plan.parcel_id))
    parcel = parcel_result.scalar_one_or_none()

    owners_result = await db.execute(select(Owner).where(Owner.parcel_id == plan.parcel_id))
    owners = owners_result.scalars().all()

    allotments_result = await db.execute(
        select(PartitionParcel).where(PartitionParcel.partition_plan_id == plan_id)
    )
    allotments = allotments_result.scalars().all()

    scores_result = await db.execute(select(Score).where(Score.partition_plan_id == plan_id))
    score = scores_result.scalar_one_or_none()

    return {
        "id": plan.id,
        "plan_name": plan.plan_name,
        "plan_type": plan.plan_type.value if hasattr(plan.plan_type, "value") else plan.plan_type,
        "status": plan.status.value if hasattr(plan.status, "value") else plan.status,
        "parcel": {
            "pniu": parcel.pniu if parcel else None,
            "village": parcel.village if parcel else None,
            "tehsil": parcel.tehsil if parcel else None,
            "district": parcel.district if parcel else None,
            "total_area": parcel.total_area if parcel else 0,
            "land_type": parcel.land_type.value if parcel and hasattr(parcel.land_type, "value") else (parcel.land_type if parcel else None),
        },
        "owners": [
            {"owner_name": o.owner_name, "share_percentage": o.share_percentage,
             "existing_possession": o.existing_possession}
            for o in owners
        ],
        "allotments": [
            {
                "owner_name": a.owner_rel.owner_name if a.owner_rel else None,
                "actual_area": a.allocated_area,
                "expected_area": a.allocated_area,
                "compactness_score": a.compactness_score,
                "share_percentage": a.owner_rel.share_percentage if a.owner_rel else 0,
                "road_frontage_length": a.road_frontage_length,
            }
            for a in allotments
        ],
        "scores": {
            "overall_score": score.overall_score if score else 0,
            "share_compliance": score.share_compliance if score else 0,
            "compactness": score.compactness if score else 0,
            "road_frontage": score.road_frontage if score else 0,
            "commercial_fairness": score.commercial_fairness if score else 0,
        },
    }
