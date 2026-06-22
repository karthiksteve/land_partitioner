from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str = Field(..., min_length=6)
    full_name: str
    phone: Optional[str] = None
    role: str = "citizen"


class UserResponse(BaseModel):
    id: UUID
    email: str
    username: str
    full_name: str
    phone: Optional[str] = None
    is_active: bool
    is_superuser: bool
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
