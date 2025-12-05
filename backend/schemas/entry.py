# backend/schemas/entry.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# -------------------------------
# AI 回复输出（给前端）
# -------------------------------
class AIReplyOut(BaseModel):
    id: int
    entry_id: int
    companion_id: int          # 哪个 AI 伴侣回的
    reply_type: str            # 目前是 "empathetic_reply_with_emotion"
    content: str               # 实际回复文本
    model_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------------
# 创建日记（前端输入）
# ✅ 现在只需要 content + 是否需要 AI 回复
# -------------------------------
class EntryCreate(BaseModel):
    content: str
    need_ai_reply: bool = False


# -------------------------------
# 列表页简要数据（summary）
# -------------------------------
class EntrySummary(BaseModel):
    id: int
    summary: str
    created_at: datetime
    emotion: Optional[str]

    class Config:
        from_attributes = True


# -------------------------------
# 详情页（完整输出）
# -------------------------------
class EntryOut(BaseModel):
    id: int
    user_id: int
    content: str
    summary: Optional[str]
    created_at: datetime

    emotion: Optional[str]
    emotion_intensity: Optional[int]

    # ✅ 现在是对象，而不是字符串
    ai_reply: Optional[AIReplyOut] = None

    # ⭐ 愉悦度（动态计算）
    pleasure: float

    class Config:
        from_attributes = True
