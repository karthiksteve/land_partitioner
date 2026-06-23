from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ParcelSearchRequest(BaseModel):
    district: str = Field(..., min_length=1)
    circle: str = Field(..., min_length=1)
    mouza: str = Field(..., min_length=1)
    plot_number: str = Field(..., min_length=1)


class GeometryGeoJSON(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]


class ParcelResponse(BaseModel):
    id: str
    pniu: str
    plot_number: str
    khata_number: Optional[str] = None
    survey_number: Optional[str] = None
    village: str
    mouza: Optional[str] = None
    circle: str
    district: str
    state: str
    total_area: Optional[float] = None
    area_unit: Optional[str] = None
    land_type: Optional[str] = None
    geometry: Optional[Dict[str, Any]] = None
    boundary_length: Optional[float] = None
    vertices: Optional[List[Dict[str, float]]] = None
    source: str
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ParcelGeometryResponse(BaseModel):
    id: str
    pniu: str
    geometry: Optional[Dict[str, Any]] = None
    center: Optional[Dict[str, float]] = None
    zoom: int = 16

    model_config = {"from_attributes": True}


class ParcelListResponse(BaseModel):
    total: int
    items: List[ParcelResponse]
