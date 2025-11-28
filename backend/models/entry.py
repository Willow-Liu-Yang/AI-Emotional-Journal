from sqlalchemy import Column, Integer, Text, TIMESTAMP, func, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)

    # 所属用户
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="entries")

    # 内容
    content = Column(Text, nullable=False)

    # 创建时间
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # 情绪结果
    emotion = Column(String, nullable=True)
    emotion_score = Column(Float, nullable=True)

    # AI 回复
    ai_reply = Column(Text, nullable=True)

    # 软删除标记
    deleted = Column(Boolean, default=False, nullable=False)
