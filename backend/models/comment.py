from sqlalchemy import Column, Integer, Text, TIMESTAMP, func, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base


class JournalComment(Base):
    __tablename__ = "journal_comments"

    id = Column(Integer, primary_key=True, index=True)

    # Which journal entry this comment belongs to
    entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=False)
    entry = relationship("JournalEntry", back_populates="comments")

    # Comment author
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User")

    # Comment content
    content = Column(Text, nullable=False)

    # Created time
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Soft-delete flag
    deleted = Column(Boolean, default=False, nullable=False)
