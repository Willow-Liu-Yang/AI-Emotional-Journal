# backend/schemas/user.py
from pydantic import BaseModel, EmailStr, Field


# 用户注册
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=72)


# 用户返回数据
class UserOut(BaseModel):
    id: int
    username: str | None = None
    email: EmailStr

    class Config:
        from_attributes = True


# 更新用户名
class UsernameUpdate(BaseModel):
    username: str
