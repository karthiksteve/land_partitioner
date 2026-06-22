import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_admin_user, get_db
from app.models.audit import AuditLog
from app.models.user import User
from app.models.parcel import Parcel
from app.models.partition import PartitionPlan
from app.models.score import Score

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    stmt = select(User).order_by(User.created_at.desc())
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    stmt = stmt.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    users = result.scalars().all()

    return {
        "items": [
            {
                "id": u.id,
                "email": u.email,
                "username": u.username,
                "full_name": u.full_name,
                "phone": u.phone,
                "role": u.role.value if hasattr(u.role, "value") else u.role,
                "is_active": u.is_active,
                "is_superuser": u.is_superuser,
                "created_at": u.created_at,
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.put("/users/{user_id}/role")
async def change_user_role(
    user_id: UUID,
    role: str = Query(..., description="New role"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    valid_roles = ["admin", "revenue_officer", "surveyor", "citizen"]
    if role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {valid_roles}",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    from app.models.user import UserRole
    user.role = role
    db.add(user)
    await db.flush()
    await db.refresh(user)

    return {
        "id": user.id,
        "username": user.username,
        "role": user.role.value if hasattr(user.role, "value") else user.role,
        "message": f"Role updated to {role}",
    }


@router.get("/audit-logs")
async def get_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    entity_type: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    stmt = select(AuditLog).order_by(AuditLog.timestamp.desc())
    if entity_type:
        stmt = stmt.where(AuditLog.entity_type == entity_type)
    if action:
        stmt = stmt.where(AuditLog.action == action)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    stmt = stmt.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    logs = result.scalars().all()

    return {
        "items": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "old_values": log.old_values,
                "new_values": log.new_values,
                "ip_address": log.ip_address,
                "timestamp": log.timestamp,
            }
            for log in logs
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    users_count = await db.execute(select(func.count(User.id)))
    parcels_count = await db.execute(select(func.count(Parcel.id)).where(Parcel.is_active == True))
    plans_count = await db.execute(select(func.count(PartitionPlan.id)).where(PartitionPlan.is_active == True))
    approved_plans = await db.execute(
        select(func.count(PartitionPlan.id)).where(
            PartitionPlan.status == "approved",
            PartitionPlan.is_active == True,
        )
    )

    avg_score = await db.execute(select(func.avg(Score.overall_score)))
    avg = avg_score.scalar() or 0

    return {
        "total_users": users_count.scalar() or 0,
        "total_parcels": parcels_count.scalar() or 0,
        "total_partition_plans": plans_count.scalar() or 0,
        "approved_plans": approved_plans.scalar() or 0,
        "average_plan_score": round(float(avg), 2),
    }
