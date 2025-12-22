from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship

from database import Base
from sqlalchemy import DateTime

class AIReply(Base):
    __tablename__ = "ai_replies"

    id = Column(Integer, primary_key=True, index=True)

    # Related journal entry (1:1; one reply per entry)
    entry_id = Column(
        Integer,
        ForeignKey("journal_entries.id"),
        nullable=False,
        unique=True,   # Ensure only one record per entry
        index=True,
    )

    # Which user it belongs to (duplicated for easier queries)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # Which AI companion generated it
    companion_id = Column(
        Integer,
        ForeignKey("ai_companions.id"),
        nullable=False,
        index=True,
    )

    # Reply type: currently "empathetic_reply", extendable later
    reply_type = Column(
        String(50),
        nullable=False,
        server_default="empathetic_reply",
    )

    # Actual reply content
    content = Column(Text, nullable=False)

    # Model name used (for debugging/switching later)
    model_name = Column(String(100), nullable=True)

    # Created time
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


    # ------------ Relationships ------------
    entry = relationship("JournalEntry", back_populates="ai_reply")
    user = relationship("User", back_populates="ai_replies")
    companion = relationship("AICompanion", back_populates="replies")
