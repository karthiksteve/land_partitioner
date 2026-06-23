import logging
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from geoalchemy2.shape import to_shape
from shapely.geometry import mapping
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_current_user, get_db
from app.models.parcel import Parcel, LandSource
from app.models.user import User
from app.schemas.parcel import (
    ParcelGeometryResponse,
    ParcelListResponse,
    ParcelResponse,
    ParcelSearchRequest,
)
from app.services.bhunaksha.adapter import BhuNakshaAdapter

logger = logging.getLogger(__name__)
router = APIRouter()
adapter = BhuNakshaAdapter()


def _geometry_to_geojson(geometry) -> dict:
    if geometry is None:
        return None
    try:
        shape = to_shape(geometry)
        return mapping(shape)
    except Exception:
        return None


def _compute_center(geometry_geojson: dict) -> dict:
    if not geometry_geojson:
        return {"lat": 25.5, "lng": 86.0}
    try:
        coords = geometry_geojson["coordinates"][0]
        lats = [c[1] for c in coords]
        lngs = [c[0] for c in coords]
        return {"lat": round(sum(lats) / len(lats), 6), "lng": round(sum(lngs) / len(lngs), 6)}
    except (KeyError, IndexError, TypeError, ZeroDivisionError):
        return {"lat": 25.5, "lng": 86.0}


@router.post("/search", response_model=ParcelResponse, status_code=status.HTTP_201_CREATED)
async def search_parcel(
    body: ParcelSearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Parcel).where(
            Parcel.district == body.district,
            Parcel.circle == body.circle,
            Parcel.mouza == body.mouza,
            Parcel.plot_number == body.plot_number,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return existing

    try:
        plot_data = await adapter.search_parcel(
            district=body.district,
            circle=body.circle,
            mouza=body.mouza,
            plot_number=body.plot_number,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch parcel data: {exc}",
        )

    parcel = Parcel(
        id=uuid.uuid4(),
        pniu=plot_data["pniu"],
        plot_number=plot_data["plot_number"],
        khata_number=plot_data.get("khata_number"),
        survey_number=plot_data.get("survey_number"),
        village=plot_data["village"],
        mouza=plot_data.get("mouza"),
        circle=plot_data["circle"],
        district=plot_data["district"],
        state=plot_data.get("state", "Bihar"),
        total_area=plot_data.get("total_area"),
        area_unit=plot_data.get("area_unit", "sqm"),
        land_type=plot_data.get("land_type"),
        boundary_length=plot_data.get("boundary_length"),
        vertices=plot_data.get("vertices"),
        source=LandSource(plot_data.get("source", "bhunaksha")),
    )
    db.add(parcel)
    await db.flush()
    await db.refresh(parcel)
    return ParcelResponse(
        id=str(parcel.id),
        pniu=parcel.pniu,
        plot_number=parcel.plot_number,
        khata_number=parcel.khata_number,
        survey_number=parcel.survey_number,
        village=parcel.village,
        mouza=parcel.mouza,
        circle=parcel.circle,
        district=parcel.district,
        state=parcel.state,
        total_area=parcel.total_area,
        area_unit=parcel.area_unit,
        land_type=parcel.land_type,
        geometry=plot_data.get("geometry"),
        boundary_length=parcel.boundary_length,
        vertices=parcel.vertices,
        source=parcel.source.value,
        is_active=parcel.is_active,
        created_at=parcel.created_at,
        updated_at=parcel.updated_at,
    )


@router.get("", response_model=ParcelListResponse)
async def list_parcels(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Parcel).offset(skip).limit(limit).order_by(Parcel.created_at.desc())
    )
    parcels = result.scalars().all()
    count_result = await db.execute(select(Parcel))
    total = len(count_result.scalars().all())
    return ParcelListResponse(
        total=total,
        items=[ParcelResponse(
            id=str(p.id), pniu=p.pniu, plot_number=p.plot_number,
            khata_number=p.khata_number, survey_number=p.survey_number,
            village=p.village, mouza=p.mouza, circle=p.circle,
            district=p.district, state=p.state, total_area=p.total_area,
            area_unit=p.area_unit, land_type=p.land_type,
            geometry=_geometry_to_geojson(p.geometry),
            boundary_length=p.boundary_length, vertices=p.vertices,
            source=p.source.value, is_active=p.is_active,
            created_at=p.created_at, updated_at=p.updated_at,
        ) for p in parcels],
    )


@router.get("/{parcel_id}", response_model=ParcelResponse)
async def get_parcel(
    parcel_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Parcel).where(Parcel.id == parcel_id).options(selectinload(Parcel.documents))
    )
    parcel = result.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")
    return ParcelResponse(
        id=str(parcel.id), pniu=parcel.pniu, plot_number=parcel.plot_number,
        khata_number=parcel.khata_number, survey_number=parcel.survey_number,
        village=parcel.village, mouza=parcel.mouza, circle=parcel.circle,
        district=parcel.district, state=parcel.state, total_area=parcel.total_area,
        area_unit=parcel.area_unit, land_type=parcel.land_type,
        geometry=_geometry_to_geojson(parcel.geometry),
        boundary_length=parcel.boundary_length, vertices=parcel.vertices,
        source=parcel.source.value, is_active=parcel.is_active,
        created_at=parcel.created_at, updated_at=parcel.updated_at,
    )


@router.get("/{parcel_id}/geometry", response_model=ParcelGeometryResponse)
async def get_parcel_geometry(
    parcel_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Parcel).where(Parcel.id == parcel_id))
    parcel = result.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")
    geo = _geometry_to_geojson(parcel.geometry)
    return ParcelGeometryResponse(
        id=str(parcel.id),
        pniu=parcel.pniu,
        geometry=geo,
        center=_compute_center(geo) if geo else None,
    )


@router.get("/{parcel_id}/map", response_model=ParcelGeometryResponse)
async def get_parcel_map(
    parcel_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Parcel).where(Parcel.id == parcel_id))
    parcel = result.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")
    geo = _geometry_to_geojson(parcel.geometry)
    center = _compute_center(geo) if geo else {"lat": 25.5, "lng": 86.0}
    return ParcelGeometryResponse(
        id=str(parcel.id),
        pniu=parcel.pniu,
        geometry=geo,
        center=center,
        zoom=16,
    )


@router.delete("/{parcel_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_parcel(
    parcel_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Parcel).where(Parcel.id == parcel_id))
    parcel = result.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")
    await db.delete(parcel)
