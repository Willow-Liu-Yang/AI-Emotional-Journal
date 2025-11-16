from sqlalchemy import Column, Integer, Text, TIMESTAMP, func, String, Boolean, Float, ForeignKey
from database import Base
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    # 一对多：一个用户有多条日记
    entries = relationship(
        "JournalEntry",
        back_populates="user",
        cascade="all, delete-orphan"
    )

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)

    # 外键：这条日记属于哪个用户
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # 反向关系：这条日记对应的用户对象
    user = relationship("User", back_populates="entries")
    
    # 用户输入的内容
    content = Column(Text, nullable=False)

    # 创建时间（可以由前端指定，默认当前时间）
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # 情绪分析结果：例如 "sad", "joy", "anxious"
    emotion = Column(String, nullable=True)

    # 情绪分数（AI 输出的某种强度，0-1 或任意浮点值）
    emotion_score = Column(Float, nullable=True)

    # AI 回复
    ai_reply = Column(Text, nullable=True)

    # 软删除标记
    deleted = Column(Boolean, default=False, nullable=False)
