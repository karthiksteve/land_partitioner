from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel


class KurraGenerateRequest(BaseModel):
    partition_plan_id: UUID
    format: str = "pdf"


class KurraResponse(BaseModel):
    id: UUID
    partition_plan_id: UUID
    report_data: Optional[Dict[str, Any]] = None
    pdf_path: Optional[str] = None
    file_format: str
    generated_at: datetime

    class Config:
        from_attributes = True
