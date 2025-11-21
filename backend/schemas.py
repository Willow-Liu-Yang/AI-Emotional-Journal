from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

# --------------------------
# 用户相关
# --------------------------

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=72)


class UserOut(BaseModel):
    id: int
    username: str | None = None
    email: EmailStr

    class Config:
        from_attributes = True


class UsernameUpdate(BaseModel):
    username: str


# --------------------------
# 日记相关 —— 输入模型
# --------------------------

class EntryCreate(BaseModel):
    content: str
    created_at: Optional[datetime] = None
    need_ai_reply: bool = False


# --------------------------
# 日记相关 —— 列表页简要信息
# --------------------------

class EntrySummary(BaseModel):
    id: int
    summary: str
    created_at: datetime

    class Config:
        orm_mode = True


# --------------------------
# 日记相关 —— 详情页输出
# --------------------------

class EntryOut(BaseModel):
    id: int
    content: str
    created_at: datetime
    user_id: int

    emotion: Optional[str] = None
    emotion_score: Optional[float] = None
    ai_reply: Optional[str] = None

    class Config:
        orm_mode = True


class EntryUpdate(BaseModel):
    content: str
    need_ai_reply: bool = False
