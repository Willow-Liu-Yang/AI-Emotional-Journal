# backend/schemas/user.py

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

from schemas.companion import CompanionOut


# -------------------------------
# User signup input
# -------------------------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=72)


# -------------------------------
# User login input
# -------------------------------
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# -------------------------------
# User output (to frontend)
# Includes AI companion info
# -------------------------------
class UserOut(BaseModel):
    id: int
    username: Optional[str] = None
    email: EmailStr

    # Current bound companion id (optional; easier for frontend)
    companion_id: Optional[int] = None

    # Current bound companion details
    companion: Optional[CompanionOut] = None

    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------------
# /users/me output
# -------------------------------
class UserMe(UserOut):
    pass


# -------------------------------
# Username update
# -------------------------------
class UsernameUpdate(BaseModel):
    username: str
