import uuid
import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSON

from app.db.base import Base, GeoMixin
from sqlalchemy.orm import relationship


class DecreeType(str, enum.Enum):
    PRELIMINARY = "preliminary"
    FINAL = "final"


class DecreeStatus(str, enum.Enum):
    DRAFT = "draft"
    ISSUED = "issued"
    APPROVED = "approved"


class Decree(Base, GeoMixin):
    __tablename__ = "decrees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    partition_plan_id = Column(UUID(as_uuid=True), ForeignKey("partition_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    decree_type = Column(Enum(DecreeType), nullable=False)
    decree_data = Column(JSON, nullable=True)
    legal_references = Column(JSON, nullable=True)
    pdf_path = Column(String(500), nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    generated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status = Column(Enum(DecreeStatus), default=DecreeStatus.DRAFT, nullable=False)

    partition_plan = relationship("PartitionPlan", back_populates="decrees", lazy="selectin")

    def __repr__(self):
        return f"<Decree(id={self.id}, type={self.decree_type}, status={self.status})>"
