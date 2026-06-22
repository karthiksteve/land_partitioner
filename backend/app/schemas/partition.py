from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PartitionCreate(BaseModel):
    parcel_id: UUID
    plan_name: str
    plan_type: str = "compactness"
    parameters: Optional[Dict[str, Any]] = None


class PartitionOwnerInput(BaseModel):
    owner_id: UUID
    share_percentage: float


class PartitionGenerateRequest(BaseModel):
    parcel_id: UUID
    mode: str = "equal"
    owners: List[PartitionOwnerInput]


class PartitionParcelResponse(BaseModel):
    id: UUID
    partition_plan_id: UUID
    owner_id: Optional[UUID] = None
    owner_name: Optional[str] = None
    allocated_area: float
    allocated_geometry: Optional[Dict[str, Any]] = None
    compactness_score: float
    road_frontage_length: float
    commercial_value_score: float
    possession_score: float
    allotment_order: int
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class ScoreBriefResponse(BaseModel):
    share_compliance: float
    compactness: float
    road_frontage: float
    commercial_fairness: float
    field_preservation: float
    possession_preservation: float
    family_settlement: float
    overall_score: float

    class Config:
        from_attributes = True


class PartitionResponse(BaseModel):
    id: UUID
    parcel_id: UUID
    plan_name: str
    plan_type: str
    description: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    status: str
    is_active: bool
    created_by: Optional[UUID] = None
    allotments: List[PartitionParcelResponse] = []
    scores: List[ScoreBriefResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PartitionListResponse(BaseModel):
    items: List[PartitionResponse]
    total: int
    page: int
    per_page: int


class PlanComparisonResponse(BaseModel):
    parcel_id: UUID
    compactness_plan: Optional[PartitionResponse] = None
    possession_plan: Optional[PartitionResponse] = None
    commercial_plan: Optional[PartitionResponse] = None
    recommended: Optional[str] = None
