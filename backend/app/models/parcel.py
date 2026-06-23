import enum
import uuid

from geoalchemy2 import Geometry
from sqlalchemy import Boolean, Column, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class LandSource(str, enum.Enum):
    BHUNAKSH = "bhunaksha"
    MANUAL = "manual"


class Parcel(Base, TimestampMixin):
    __tablename__ = "parcels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pniu = Column(String(50), unique=True, nullable=False, index=True)
    plot_number = Column(String(50), nullable=False)
    khata_number = Column(String(50), nullable=True)
    survey_number = Column(String(50), nullable=True)
    village = Column(String(255), nullable=False)
    mouza = Column(String(255), nullable=True)
    circle = Column(String(255), nullable=False)
    district = Column(String(255), nullable=False)
    state = Column(String(100), default="Bihar", nullable=False)
    total_area = Column(Float, nullable=True)
    area_unit = Column(String(20), default="sqm", nullable=True)
    land_type = Column(String(100), nullable=True)
    geometry = Column(Geometry("POLYGON", 4326), nullable=True)
    boundary_length = Column(Float, nullable=True)
    vertices = Column(JSON, nullable=True)
    source = Column(Enum(LandSource), default=LandSource.BHUNAKSH, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    documents = relationship("Document", back_populates="parcel", lazy="selectin",
                             cascade="all, delete-orphan")
