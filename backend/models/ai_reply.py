from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship

from database import Base
from sqlalchemy import DateTime

class AIReply(Base):
    __tablename__ = "ai_replies"

    id = Column(Integer, primary_key=True, index=True)

    # 关联的日记（1 对 1：每篇日记最多一条 AI 回复）
    entry_id = Column(
        Integer,
        ForeignKey("journal_entries.id"),
        nullable=False,
        unique=True,   # 保证一篇日记只会有一条记录
        index=True,
    )

    # 属于哪个用户（冗余一份，查询更方便）
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # 哪个 AI 伴侣生成的
    companion_id = Column(
        Integer,
        ForeignKey("ai_companions.id"),
        nullable=False,
        index=True,
    )

    # 回复类型：现在统一 "empathetic_reply"，以后可以扩展别的类型
    reply_type = Column(
        String(50),
        nullable=False,
        server_default="empathetic_reply",
    )

    # 实际回复内容
    content = Column(Text, nullable=False)

    # 使用的模型名（方便以后调试 / 切换模型）
    model_name = Column(String(100), nullable=True)

    # 创建时间
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


    # ------------ 关系 ------------
    entry = relationship("JournalEntry", back_populates="ai_reply")
    user = relationship("User", back_populates="ai_replies")
    companion = relationship("AICompanion", back_populates="replies")
