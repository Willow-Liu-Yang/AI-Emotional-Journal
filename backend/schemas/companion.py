# backend/schemas/companion.py

from pydantic import BaseModel
from typing import List, Optional


# --------------- 基础结构：模型完整字段（详细信息 / Profile 用） ---------------
class AICompanionBase(BaseModel):
    id: int
    name: str
    key: str
    identity_title: str
    description: str
    tags: List[str]
    avatar_key: Optional[str] = None
    theme_color: Optional[str] = None
    order_index: Optional[int] = None

    # ✅ 新增：给 LLM 用的人设和行为配置
    persona_prompt: Optional[str] = None           # 完整人设说明
    reply_length_hint: str = "medium"              # short / medium / long
    allow_suggestions: bool = True                 # 是否倾向给建议
    is_active: bool = True                         # 是否启用（下架用）

    class Config:
        from_attributes = True


# --------------- 用于列表显示（更轻量） ---------------
class AICompanionSummary(BaseModel):
    id: int
    name: str
    identity_title: str
    tags: List[str]
    avatar_key: Optional[str] = None
    theme_color: Optional[str] = None
    order_index: Optional[int] = None

    class Config:
        from_attributes = True


# --------------- 用户选择 Companion 时用 ---------------
class CompanionSelect(BaseModel):
    companion_id: int


# --------------- 用于 UserOut 中返回用户的小伙伴信息 ---------------
class CompanionOut(AICompanionBase):
    pass


# --------------- 创建自定义 AI 伴侣（POST /companions/custom） ---------------
class AICompanionCreate(BaseModel):
    # key 可选，不填的话后端可以根据 name 自动生成
    name: str
    key: Optional[str] = None

    identity_title: str
    description: str
    tags: List[str]

    avatar_key: Optional[str] = None
    theme_color: Optional[str] = None

    persona_prompt: Optional[str] = None
    reply_length_hint: str = "medium"
    allow_suggestions: bool = True
    is_active: bool = True


# --------------- 更新自定义 AI 伴侣（PATCH /companions/{id}） ---------------
class AICompanionUpdate(BaseModel):
    # 全部可选，用哪个改哪个
    name: Optional[str] = None
    identity_title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None

    avatar_key: Optional[str] = None
    theme_color: Optional[str] = None

    persona_prompt: Optional[str] = None
    reply_length_hint: Optional[str] = None
    allow_suggestions: Optional[bool] = None
    is_active: Optional[bool] = None
