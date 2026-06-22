import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSON

from app.db.base import Base, GeoMixin
from sqlalchemy.orm import relationship


class KurraReport(Base, GeoMixin):
    __tablename__ = "kurra_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    partition_plan_id = Column(UUID(as_uuid=True), ForeignKey("partition_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    report_data = Column(JSON, nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    generated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    pdf_path = Column(String(500), nullable=True)
    file_format = Column(String(20), default="pdf")

    partition_plan = relationship("PartitionPlan", back_populates="kurra_reports", lazy="selectin")

    def __repr__(self):
        return f"<KurraReport(id={self.id}, format={self.file_format})>"
