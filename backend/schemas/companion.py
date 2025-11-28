from pydantic import BaseModel
from typing import List, Optional

# --------------- 基础结构：模型完整字段 ---------------
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
