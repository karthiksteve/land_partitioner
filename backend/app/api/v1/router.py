from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.parcels import router as parcels_router
from app.api.v1.partition import router as partition_router
from app.api.v1.reports import router as reports_router
from app.api.v1.admin import router as admin_router

router = APIRouter(prefix="/api/v1")

router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
router.include_router(parcels_router, prefix="/parcels", tags=["Parcels"])
router.include_router(partition_router, prefix="/partition", tags=["Partition"])
router.include_router(reports_router, prefix="/reports", tags=["Reports"])
router.include_router(admin_router, prefix="/admin", tags=["Admin"])
