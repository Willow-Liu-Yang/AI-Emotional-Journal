# backend/schemas/entry.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# 写日记（输入）
class EntryCreate(BaseModel):
    content: str
    created_at: Optional[datetime] = None
    need_ai_reply: bool = False


# 日记列表项（summary）
class EntrySummary(BaseModel):
    id: int
    summary: str
    created_at: datetime

    class Config:
        orm_mode = True


# 日记详情（返回）
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


# 更新日记
class EntryUpdate(BaseModel):
    content: str
    need_ai_reply: bool = False
