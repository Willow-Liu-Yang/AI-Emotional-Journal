from pydantic import BaseModel
from datetime import datetime

# 创建日记时用
class JournalCreate(BaseModel):
    content: str

# 返回日记时用
class Journal(BaseModel):
    id: int
    content: str
    created_at: datetime

    class Config:
        orm_mode = True  # 让 SQLAlchemy 对象能被直接转换成 JSON
