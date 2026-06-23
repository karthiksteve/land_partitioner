import enum
import uuid

from sqlalchemy import Boolean, Column, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class DocumentType(str, enum.Enum):
    PARCEL_PDF = "parcel_pdf"
    LAND_RECORD = "land_record"
    ROR = "ror"
    GEOJSON = "geojson"
    OTHER = "other"


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parcel_id = Column(UUID(as_uuid=True), ForeignKey("parcels.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    document_type = Column(Enum(DocumentType), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=True)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    source_url = Column(String(512), nullable=True)
    is_downloaded = Column(Boolean, default=False, nullable=False)

    parcel = relationship("Parcel", back_populates="documents")
    uploaded_by = relationship("User", back_populates="documents")
