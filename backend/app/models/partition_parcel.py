import uuid

from sqlalchemy import Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry

from app.db.base import Base, GeoMixin
from sqlalchemy.orm import relationship


class PartitionParcel(Base, GeoMixin):
    __tablename__ = "partition_parcels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    partition_plan_id = Column(UUID(as_uuid=True), ForeignKey("partition_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("owners.id", ondelete="SET NULL"), nullable=True)
    allocated_area = Column(Float, nullable=False, default=0.0)
    allocated_geometry = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)
    compactness_score = Column(Float, default=0.0)
    road_frontage_length = Column(Float, default=0.0)
    commercial_value_score = Column(Float, default=0.0)
    possession_score = Column(Float, default=0.0)
    allotment_order = Column(Integer, default=0)
    notes = Column(Text, nullable=True)

    partition_plan = relationship("PartitionPlan", back_populates="allotments", lazy="selectin")
    owner_rel = relationship("Owner", back_populates="allotments", lazy="selectin")

    def __repr__(self):
        return f"<PartitionParcel(id={self.id}, area={self.allocated_area})>"
