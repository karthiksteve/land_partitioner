from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: str
    parcel_id: str
    document_type: str
    file_name: str
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    source_url: Optional[str] = None
    is_downloaded: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    total: int
    items: List[DocumentResponse]
