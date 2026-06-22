import uuid

from sqlalchemy import Column, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON

from app.db.base import Base, GeoMixin
from sqlalchemy.orm import relationship


class Score(Base, GeoMixin):
    __tablename__ = "scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    partition_plan_id = Column(UUID(as_uuid=True), ForeignKey("partition_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    share_compliance = Column(Float, default=0.0)
    compactness = Column(Float, default=0.0)
    road_frontage = Column(Float, default=0.0)
    commercial_fairness = Column(Float, default=0.0)
    field_preservation = Column(Float, default=0.0)
    possession_preservation = Column(Float, default=0.0)
    family_settlement = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    details = Column(JSON, nullable=True)

    partition_plan = relationship("PartitionPlan", back_populates="scores", lazy="selectin")

    def __repr__(self):
        return f"<Score(id={self.id}, overall={self.overall_score})>"
