import logging
import math
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import shape as shapely_shape
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db, RoleChecker
from app.models.owner import Owner
from app.models.parcel import Parcel, LandType
from app.models.user import User
from app.schemas.owner import BulkOwnerCreate, OwnerCreate, OwnerResponse
from app.schemas.parcel import (
    ParcelCreate, ParcelListResponse, ParcelResponse, ParcelSearchParams, ParcelUpdate,
)
from app.services.gis.geometry_engine import (
    extract_parcel_geometry, geojson_to_shapely, shapely_to_geojson,
)
from app.services.bhunaksha.adapter import BhuNakshaAdapter

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("", response_model=ParcelListResponse)
async def list_parcels(
    query: Optional[str] = Query(None),
    village: Optional[str] = Query(None),
    tehsil: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    land_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Parcel).where(Parcel.is_active == True)

    if query:
        stmt = stmt.where(
            or_(
                Parcel.pniu.ilike(f"%{query}%"),
                Parcel.plot_number.ilike(f"%{query}%"),
                Parcel.village.ilike(f"%{query}%"),
                Parcel.survey_number.ilike(f"%{query}%"),
            )
        )
    if village:
        stmt = stmt.where(Parcel.village.ilike(f"%{village}%"))
    if tehsil:
        stmt = stmt.where(Parcel.tehsil.ilike(f"%{tehsil}%"))
    if district:
        stmt = stmt.where(Parcel.district.ilike(f"%{district}%"))
    if land_type:
        stmt = stmt.where(Parcel.land_type == land_type)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    stmt = stmt.order_by(Parcel.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(stmt)
    parcels = result.scalars().all()

    items = []
    for p in parcels:
        p_dict = _parcel_to_dict(p)
        items.append(p_dict)

    return ParcelListResponse(items=items, total=total, page=page, per_page=per_page)


@router.post("", response_model=ParcelResponse, status_code=status.HTTP_201_CREATED)
async def create_parcel(
    request: ParcelCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    geom = None
    vertices = None
    boundary_length = 0.0

    if request.geometry:
        shape_geom = geojson_to_shapely(request.geometry)
        geom = from_shape(shape_geom, srid=4326)
        extracted = extract_parcel_geometry(request.geometry)
        boundary_length = extracted["perimeter"]
        vertices = extracted["vertices"]

    parcel = Parcel(
        pniu=request.pniu,
        plot_number=request.plot_number,
        survey_number=request.survey_number,
        khata_number=request.khata_number,
        village=request.village,
        tehsil=request.tehsil,
        district=request.district,
        state=request.state,
        circle=request.circle,
        subdivision=request.subdivision,
        total_area=request.total_area,
        area_unit=request.area_unit,
        land_type=request.land_type,
        soil_type=request.soil_type,
        irrigation_available=request.irrigation_available,
        well_present=request.well_present,
        tubewell_present=request.tubewell_present,
        trees_present=request.trees_present,
        road_side=request.road_side,
        abadi_adjacent=request.abadi_adjacent,
        commercial_value=request.commercial_value,
        geometry=geom,
        boundary_length=boundary_length,
        vertices=vertices,
        owner_id=request.owner_id or current_user.id,
        is_active=True,
    )
    db.add(parcel)
    await db.flush()
    await db.refresh(parcel)
    return _parcel_to_dict(parcel)


@router.get("/{parcel_id}", response_model=ParcelResponse)
async def get_parcel(
    parcel_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Parcel).where(Parcel.id == parcel_id, Parcel.is_active == True))
    parcel = result.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")
    return _parcel_to_dict(parcel)


@router.put("/{parcel_id}", response_model=ParcelResponse)
async def update_parcel(
    parcel_id: UUID,
    request: ParcelUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Parcel).where(Parcel.id == parcel_id, Parcel.is_active == True))
    parcel = result.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    update_data = request.model_dump(exclude_unset=True)
    if "geometry" in update_data and update_data["geometry"]:
        shape_geom = geojson_to_shapely(update_data["geometry"])
        parcel.geometry = from_shape(shape_geom, srid=4326)
        extracted = extract_parcel_geometry(update_data["geometry"])
        parcel.boundary_length = extracted["perimeter"]
        parcel.vertices = extracted["vertices"]
        update_data.pop("geometry")

    for field, value in update_data.items():
        setattr(parcel, field, value)

    db.add(parcel)
    await db.flush()
    await db.refresh(parcel)
    return _parcel_to_dict(parcel)


@router.delete("/{parcel_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_parcel(
    parcel_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "revenue_officer"])),
):
    result = await db.execute(select(Parcel).where(Parcel.id == parcel_id))
    parcel = result.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")
    parcel.is_active = False
    db.add(parcel)
    await db.flush()


@router.get("/{parcel_id}/geometry")
async def get_parcel_geometry(
    parcel_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Parcel).where(Parcel.id == parcel_id, Parcel.is_active == True))
    parcel = result.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")
    if not parcel.geometry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No geometry data")
    shape_geom = to_shape(parcel.geometry)
    return shapely_to_geojson(shape_geom)


@router.post("/{parcel_id}/owners", response_model=OwnerResponse, status_code=status.HTTP_201_CREATED)
async def add_owner(
    parcel_id: UUID,
    request: OwnerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Parcel).where(Parcel.id == parcel_id, Parcel.is_active == True))
    parcel = result.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    pos_geom = None
    if request.possession_geometry:
        pos_geom = from_shape(geojson_to_shapely(request.possession_geometry), srid=4326)

    owner = Owner(
        parcel_id=parcel_id,
        owner_name=request.owner_name,
        share_percentage=request.share_percentage,
        existing_possession=request.existing_possession,
        possession_geometry=pos_geom,
    )
    db.add(owner)
    await db.flush()
    await db.refresh(owner)

    return {
        "id": owner.id,
        "parcel_id": owner.parcel_id,
        "owner_name": owner.owner_name,
        "share_percentage": owner.share_percentage,
        "existing_possession": owner.existing_possession,
        "possession_geometry": shapely_to_geojson(to_shape(owner.possession_geometry)) if owner.possession_geometry else None,
        "created_at": owner.created_at,
        "updated_at": owner.updated_at,
    }


@router.get("/{parcel_id}/owners")
async def list_owners(
    parcel_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Owner).where(Owner.parcel_id == parcel_id).order_by(Owner.created_at)
    )
    owners = result.scalars().all()
    return {
        "items": [
            {
                "id": o.id,
                "parcel_id": o.parcel_id,
                "owner_name": o.owner_name,
                "share_percentage": o.share_percentage,
                "existing_possession": o.existing_possession,
                "possession_geometry": shapely_to_geojson(to_shape(o.possession_geometry)) if o.possession_geometry else None,
                "created_at": o.created_at,
                "updated_at": o.updated_at,
            }
            for o in owners
        ],
        "total": len(owners),
    }


@router.post("/upload", response_model=List[ParcelResponse])
async def upload_parcels(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    if file.filename.endswith(".geojson") or file.filename.endswith(".json"):
        import json
        data = json.loads(content)
        return await _process_geojson(data, db, current_user)
    elif file.filename.endswith(".kml"):
        return await _process_kml(content, db, current_user)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported format. Use GeoJSON or KML.",
        )


@router.post("/bhunaksha/fetch")
async def fetch_from_bhunaksha(
    pniu: str = Query(..., description="PNIU of the plot"),
    state: str = Query("uttar_pradesh"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    adapter = BhuNakshaAdapter(state)
    plot_data = await adapter.get_plot_by_pniu(pniu)
    details = adapter.extract_plot_details(plot_data)

    geom = None
    if details.get("geometry"):
        geom = from_shape(details["geometry"], srid=4326)

    existing = await db.execute(select(Parcel).where(Parcel.pniu == pniu))
    existing_parcel = existing.scalar_one_or_none()
    if existing_parcel:
        for field, value in details.items():
            if field != "geometry" and value is not None:
                setattr(existing_parcel, field, value)
        if geom:
            existing_parcel.geometry = geom
        db.add(existing_parcel)
        await db.flush()
        await db.refresh(existing_parcel)
        return _parcel_to_dict(existing_parcel)

    parcel = Parcel(
        pniu=details["pniu"],
        plot_number=details["plot_number"],
        survey_number=details["survey_number"],
        khata_number=details["khata_number"],
        village=details["village"],
        tehsil=details["tehsil"],
        district=details["district"],
        state=details["state"],
        total_area=details["total_area"],
        area_unit=details["area_unit"],
        land_type=details["land_type"],
        soil_type=details["soil_type"],
        irrigation_available=details["irrigation_available"],
        geometry=geom,
        owner_id=current_user.id,
        is_active=True,
    )
    db.add(parcel)
    await db.flush()
    await db.refresh(parcel)
    return _parcel_to_dict(parcel)


def _parcel_to_dict(parcel: Parcel) -> Dict[str, Any]:
    geom_geojson = None
    if parcel.geometry:
        try:
            shape_geom = to_shape(parcel.geometry)
            geom_geojson = shapely_to_geojson(shape_geom)
        except Exception:
            pass
    return {
        "id": parcel.id,
        "pniu": parcel.pniu,
        "plot_number": parcel.plot_number,
        "survey_number": parcel.survey_number,
        "khata_number": parcel.khata_number,
        "village": parcel.village,
        "tehsil": parcel.tehsil,
        "district": parcel.district,
        "state": parcel.state,
        "circle": parcel.circle,
        "subdivision": parcel.subdivision,
        "total_area": parcel.total_area,
        "area_unit": parcel.area_unit,
        "land_type": parcel.land_type.value if hasattr(parcel.land_type, "value") else parcel.land_type,
        "soil_type": parcel.soil_type,
        "irrigation_available": parcel.irrigation_available,
        "well_present": parcel.well_present,
        "tubewell_present": parcel.tubewell_present,
        "trees_present": parcel.trees_present,
        "road_side": parcel.road_side,
        "abadi_adjacent": parcel.abadi_adjacent,
        "commercial_value": parcel.commercial_value,
        "geometry": geom_geojson,
        "boundary_length": parcel.boundary_length,
        "is_active": parcel.is_active,
        "owner_id": parcel.owner_id,
        "created_at": parcel.created_at,
        "updated_at": parcel.updated_at,
    }


async def _process_geojson(data: Dict[str, Any], db: AsyncSession, current_user: User) -> List:
    parcels = []
    features = data.get("features", [data])
    for feature in features:
        props = feature.get("properties", {})
        geom = feature.get("geometry")
        shape_geom = geojson_to_shapely(geom) if geom else None
        db_geom = from_shape(shape_geom, srid=4326) if shape_geom else None
        extracted = extract_parcel_geometry(geom) if geom else {}
        parcel = Parcel(
            pniu=props.get("pniu"),
            plot_number=props.get("plot_number"),
            survey_number=props.get("survey_number"),
            khata_number=props.get("khata_number"),
            village=props.get("village"),
            tehsil=props.get("tehsil"),
            district=props.get("district"),
            state=props.get("state"),
            total_area=props.get("total_area", extracted.get("area", 0)),
            area_unit=props.get("area_unit", "sq_meter"),
            land_type=props.get("land_type", "agricultural"),
            soil_type=props.get("soil_type"),
            geometry=db_geom,
            boundary_length=extracted.get("perimeter", 0),
            owner_id=current_user.id,
            is_active=True,
        )
        db.add(parcel)
        parcels.append(parcel)
    await db.flush()
    for p in parcels:
        await db.refresh(p)
    return [_parcel_to_dict(p) for p in parcels]


async def _process_kml(content: bytes, db: AsyncSession, current_user: User) -> List:
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("latin-1")
    try:
        from fastapi import HTTPException as _HTTPException
        import re
        coords_pattern = re.compile(r"<coordinates>(.*?)</coordinates>", re.DOTALL)
        name_pattern = re.compile(r"<name>(.*?)</name>")
        coords_matches = coords_pattern.findall(text)
        parcels = []
        for i, coord_text in enumerate(coords_matches):
            coord_pairs = coord_text.strip().split()
            points = []
            for pair in coord_pairs:
                parts = pair.split(",")
                if len(parts) >= 2:
                    points.append((float(parts[0]), float(parts[1])))
            if len(points) >= 3:
                poly = shapely_shape({"type": "Polygon", "coordinates": [points]})
                db_geom = from_shape(poly, srid=4326)
                extracted = extract_parcel_geometry(poly)
                parcel = Parcel(
                    plot_number=f"KML-{i+1}",
                    village="Imported",
                    total_area=extracted["area"],
                    geometry=db_geom,
                    boundary_length=extracted["perimeter"],
                    owner_id=current_user.id,
                    is_active=True,
                )
                db.add(parcel)
                parcels.append(parcel)
        await db.flush()
        for p in parcels:
            await db.refresh(p)
        return [_parcel_to_dict(p) for p in parcels]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"KML parsing failed: {e}")
