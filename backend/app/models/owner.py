import uuid

from sqlalchemy import Boolean, Column, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry

from app.db.base import Base, GeoMixin
from sqlalchemy.orm import relationship


class Owner(Base, GeoMixin):
    __tablename__ = "owners"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    parcel_id = Column(UUID(as_uuid=True), ForeignKey("parcels.id", ondelete="CASCADE"), nullable=False, index=True)
    owner_name = Column(String(255), nullable=False)
    share_percentage = Column(Float, nullable=False, default=0.0)
    existing_possession = Column(Boolean, default=False)
    possession_geometry = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)

    parcel = relationship("Parcel", back_populates="owners", lazy="selectin")
    allotments = relationship("PartitionParcel", back_populates="owner_rel", lazy="selectin")

    def __repr__(self):
        return f"<Owner(id={self.id}, name={self.owner_name}, share={self.share_percentage}%)>"
