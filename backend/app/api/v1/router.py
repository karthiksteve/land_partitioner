from fastapi import APIRouter

from app.api.v1 import auth, documents, parcels

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(parcels.router, prefix="/parcels", tags=["Parcels"])
api_router.include_router(documents.router, prefix="", tags=["Documents"])
