# backend/schemas/user.py

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

from schemas.companion import CompanionOut


# -------------------------------
# 用户注册输入
# -------------------------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=72)


# -------------------------------
# 用户登录输入（如果需要）
# -------------------------------
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# -------------------------------
# 用户输出（给前端）
# 包含 AI 小伙伴信息
# -------------------------------
class UserOut(BaseModel):
    id: int
    username: Optional[str] = None
    email: EmailStr
    companion: Optional[CompanionOut] = None   # ⭐ 嵌套 Companion
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------------
# /users/me 输出
# （暂时和 UserOut 一样）
# -------------------------------
class UserMe(UserOut):
    pass


# -------------------------------
# 用户名更新
# -------------------------------
class UsernameUpdate(BaseModel):
    username: str
