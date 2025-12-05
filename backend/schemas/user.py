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
# 用户登录输入
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

    # 当前绑定的 AI 伴侣 id（可选，方便前端直接用）
    companion_id: Optional[int] = None

    # 当前绑定的 AI 伴侣详情
    companion: Optional[CompanionOut] = None

    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------------
# /users/me 输出
# -------------------------------
class UserMe(UserOut):
    pass


# -------------------------------
# 用户名更新
# -------------------------------
class UsernameUpdate(BaseModel):
    username: str
