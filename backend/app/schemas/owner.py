from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class OwnerCreate(BaseModel):
    owner_name: str
    share_percentage: float = Field(..., gt=0, le=100)
    existing_possession: bool = False
    possession_geometry: Optional[Dict[str, Any]] = None


class OwnerUpdate(BaseModel):
    owner_name: Optional[str] = None
    share_percentage: Optional[float] = None
    existing_possession: Optional[bool] = None
    possession_geometry: Optional[Dict[str, Any]] = None


class OwnerResponse(BaseModel):
    id: UUID
    parcel_id: UUID
    owner_name: str
    share_percentage: float
    existing_possession: bool
    possession_geometry: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OwnerListResponse(BaseModel):
    items: List[OwnerResponse]
    total: int


class BulkOwnerCreate(BaseModel):
    parcel_id: UUID
    owners: List[OwnerCreate]

    @model_validator(mode="after")
    def validate_shares_sum(self):
        total = sum(o.share_percentage for o in self.owners)
        if abs(total - 100.0) > 0.01:
            raise ValueError(f"Owner shares must sum to 100%, got {total}%")
        return self
