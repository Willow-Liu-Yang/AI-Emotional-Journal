from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# Comment create input (from user)
class CommentCreate(BaseModel):
    content: str


# Comment output (to frontend)
class CommentOut(BaseModel):
    id: int
    entry_id: int
    user_id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
