from sqlalchemy import Column, Integer, Text, TIMESTAMP, func, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base


class JournalComment(Base):
    __tablename__ = "journal_comments"

    id = Column(Integer, primary_key=True, index=True)

    # 评论属于哪个日记
    entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=False)
    entry = relationship("JournalEntry", back_populates="comments")

    # 评论作者
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User")

    # 评论内容
    content = Column(Text, nullable=False)

    # 创建时间
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # 是否软删除
    deleted = Column(Boolean, default=False, nullable=False)
