from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# 用户创建评论（输入）
class CommentCreate(BaseModel):
    content: str


# 评论输出（给前端）
class CommentOut(BaseModel):
    id: int
    entry_id: int
    user_id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
