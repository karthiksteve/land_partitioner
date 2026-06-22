import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base, GeoMixin

import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    REVENUE_OFFICER = "revenue_officer"
    SURVEYOR = "surveyor"
    CITIZEN = "citizen"


class User(Base, GeoMixin):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CITIZEN, nullable=False)

    parcels = relationship("Parcel", back_populates="owner", lazy="selectin")
    partition_plans = relationship("PartitionPlan", back_populates="created_by_user", lazy="selectin")
    audit_logs = relationship("AuditLog", back_populates="user", lazy="selectin")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, role={self.role})>"
