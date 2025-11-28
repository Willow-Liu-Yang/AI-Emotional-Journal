from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# -------------------------------
# 创建日记（前端输入）
# -------------------------------
class EntryCreate(BaseModel):
    content: str
    need_ai_reply: bool = False
    emotion: Optional[str] = None
    emotion_intensity: Optional[int] = None  # 1=low, 2=medium, 3=high


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

    ai_reply: Optional[str]

    # ⭐ 新增：愉悦度（动态计算）
    pleasure: float

    class Config:
        from_attributes = True


