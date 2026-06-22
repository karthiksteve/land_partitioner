from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel


class DecreeGenerateRequest(BaseModel):
    partition_plan_id: UUID
    decree_type: str = "preliminary"


class DecreeResponse(BaseModel):
    id: UUID
    partition_plan_id: UUID
    decree_type: str
    decree_data: Optional[Dict[str, Any]] = None
    legal_references: Optional[Dict[str, Any]] = None
    pdf_path: Optional[str] = None
    status: str
    generated_at: datetime

    class Config:
        from_attributes = True
