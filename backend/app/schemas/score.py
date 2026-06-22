from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel


class ScoreResponse(BaseModel):
    id: UUID
    partition_plan_id: UUID
    share_compliance: float
    compactness: float
    road_frontage: float
    commercial_fairness: float
    field_preservation: float
    possession_preservation: float
    family_settlement: float
    overall_score: float
    details: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ScoreSummaryResponse(BaseModel):
    plan_id: UUID
    plan_name: str
    plan_type: str
    overall_score: float
    strengths: list[str] = []
    weaknesses: list[str] = []
    recommendation: Optional[str] = None
