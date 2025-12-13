from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal, Dict


# -------------------------------
# 主题类型（主主题）
# -------------------------------
EntryTheme = Literal["work", "hobbies", "social", "other"]


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
# ✅ 只需要 content + 是否需要 AI 回复
# 主题由后端分析生成，不从前端传入
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

    # ✅ 主主题
    primary_theme: Optional[EntryTheme] = None

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

    # ✅ 主主题（快速展示/筛选）
    primary_theme: Optional[EntryTheme] = None

    # ✅ 主题权重分布（insights 聚合用）
    # 形如：{"work":0.2,"hobbies":0.5,"social":0.1,"other":0.2}
    theme_scores: Optional[Dict[str, float]] = None

    # ✅ 现在是对象，而不是字符串
    ai_reply: Optional[AIReplyOut] = None

    # ⭐ 愉悦度（动态计算）
    pleasure: float

    class Config:
        from_attributes = True
