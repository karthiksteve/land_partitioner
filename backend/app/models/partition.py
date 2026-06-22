import uuid
import enum

from sqlalchemy import Column, Enum, ForeignKey, String, Text, Boolean, func
from sqlalchemy.dialects.postgresql import UUID, JSON

from app.db.base import Base, GeoMixin
from sqlalchemy.orm import relationship


class PlanType(str, enum.Enum):
    COMPACTNESS = "compactness"
    POSSESSION = "possession"
    COMMERCIAL = "commercial"


class PlanStatus(str, enum.Enum):
    DRAFT = "draft"
    GENERATED = "generated"
    APPROVED = "approved"
    REJECTED = "rejected"


class PartitionPlan(Base, GeoMixin):
    __tablename__ = "partition_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    parcel_id = Column(UUID(as_uuid=True), ForeignKey("parcels.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_name = Column(String(255), nullable=False)
    plan_type = Column(Enum(PlanType), nullable=False)
    description = Column(Text, nullable=True)
    parameters = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    status = Column(Enum(PlanStatus), default=PlanStatus.DRAFT, nullable=False)

    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_by_user = relationship("User", back_populates="partition_plans", lazy="selectin")
    parcel = relationship("Parcel", back_populates="partition_plans", lazy="selectin")

    allotments = relationship("PartitionParcel", back_populates="partition_plan", lazy="selectin", cascade="all, delete-orphan")
    scores = relationship("Score", back_populates="partition_plan", lazy="selectin", cascade="all, delete-orphan")
    kurra_reports = relationship("KurraReport", back_populates="partition_plan", lazy="selectin", cascade="all, delete-orphan")
    decrees = relationship("Decree", back_populates="partition_plan", lazy="selectin", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<PartitionPlan(id={self.id}, name={self.plan_name}, type={self.plan_type})>"
