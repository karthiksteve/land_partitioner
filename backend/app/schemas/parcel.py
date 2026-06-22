from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ParcelCreate(BaseModel):
    pniu: Optional[str] = None
    plot_number: Optional[str] = None
    survey_number: Optional[str] = None
    khata_number: Optional[str] = None
    village: Optional[str] = None
    tehsil: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    circle: Optional[str] = None
    subdivision: Optional[str] = None
    total_area: float = 0.0
    area_unit: str = "sq_meter"
    land_type: str = "agricultural"
    soil_type: Optional[str] = None
    irrigation_available: bool = False
    well_present: bool = False
    tubewell_present: bool = False
    trees_present: bool = False
    road_side: bool = False
    abadi_adjacent: bool = False
    commercial_value: bool = False
    geometry: Optional[Dict[str, Any]] = None
    owner_id: Optional[UUID] = None


class ParcelUpdate(BaseModel):
    pniu: Optional[str] = None
    plot_number: Optional[str] = None
    survey_number: Optional[str] = None
    khata_number: Optional[str] = None
    village: Optional[str] = None
    tehsil: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    circle: Optional[str] = None
    subdivision: Optional[str] = None
    total_area: Optional[float] = None
    area_unit: Optional[str] = None
    land_type: Optional[str] = None
    soil_type: Optional[str] = None
    irrigation_available: Optional[bool] = None
    well_present: Optional[bool] = None
    tubewell_present: Optional[bool] = None
    trees_present: Optional[bool] = None
    road_side: Optional[bool] = None
    abadi_adjacent: Optional[bool] = None
    commercial_value: Optional[bool] = None
    geometry: Optional[Dict[str, Any]] = None


class ParcelResponse(BaseModel):
    id: UUID
    pniu: Optional[str] = None
    plot_number: Optional[str] = None
    survey_number: Optional[str] = None
    khata_number: Optional[str] = None
    village: Optional[str] = None
    tehsil: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    circle: Optional[str] = None
    subdivision: Optional[str] = None
    total_area: float
    area_unit: str
    land_type: str
    soil_type: Optional[str] = None
    irrigation_available: bool
    well_present: bool
    tubewell_present: bool
    trees_present: bool
    road_side: bool
    abadi_adjacent: bool
    commercial_value: bool
    geometry: Optional[Dict[str, Any]] = None
    boundary_length: float
    is_active: bool
    owner_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ParcelListResponse(BaseModel):
    items: List[ParcelResponse]
    total: int
    page: int
    per_page: int


class ParcelSearchParams(BaseModel):
    query: Optional[str] = None
    village: Optional[str] = None
    tehsil: Optional[str] = None
    district: Optional[str] = None
    land_type: Optional[str] = None
    page: int = 1
    per_page: int = 20
