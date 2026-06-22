import uuid
import enum

from sqlalchemy import Boolean, Column, Enum, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from geoalchemy2 import Geometry

from app.db.base import Base, GeoMixin
from sqlalchemy.orm import relationship


class LandType(str, enum.Enum):
    AGRICULTURAL = "agricultural"
    COMMERCIAL = "commercial"
    RESIDENTIAL = "residential"
    MIXED = "mixed"


class Parcel(Base, GeoMixin):
    __tablename__ = "parcels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    pniu = Column(String(50), unique=True, nullable=True, index=True)
    plot_number = Column(String(50), nullable=True)
    survey_number = Column(String(50), nullable=True)
    khata_number = Column(String(50), nullable=True)
    village = Column(String(100), nullable=True, index=True)
    tehsil = Column(String(100), nullable=True, index=True)
    district = Column(String(100), nullable=True, index=True)
    state = Column(String(100), nullable=True)
    circle = Column(String(100), nullable=True)
    subdivision = Column(String(100), nullable=True)
    total_area = Column(Float, nullable=False, default=0.0)
    area_unit = Column(String(20), default="sq_meter")
    land_type = Column(Enum(LandType), default=LandType.AGRICULTURAL, nullable=False)
    soil_type = Column(String(100), nullable=True)
    irrigation_available = Column(Boolean, default=False)
    well_present = Column(Boolean, default=False)
    tubewell_present = Column(Boolean, default=False)
    trees_present = Column(Boolean, default=False)
    road_side = Column(Boolean, default=False)
    abadi_adjacent = Column(Boolean, default=False)
    commercial_value = Column(Boolean, default=False)
    geometry = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)
    boundary_length = Column(Float, default=0.0)
    vertices = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    owner = relationship("User", back_populates="parcels", lazy="selectin")

    owners = relationship("Owner", back_populates="parcel", lazy="selectin", cascade="all, delete-orphan")
    partition_plans = relationship("PartitionPlan", back_populates="parcel", lazy="selectin", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Parcel(id={self.id}, pniu={self.pniu}, village={self.village})>"
