from sqlalchemy.orm import DeclarativeBase
from geoalchemy2 import Geometry
from sqlalchemy import Column, DateTime, func
from typing import Any


class Base(DeclarativeBase):
    pass


class GeoMixin:
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
