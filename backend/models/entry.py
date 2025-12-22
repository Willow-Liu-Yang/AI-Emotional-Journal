from sqlalchemy import (
    Column,
    Integer,
    Text,
    func,
    String,
    Boolean,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy import DateTime

from database import Base


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)

    # Owning user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="entries")

    # Journal content
    content = Column(Text, nullable=False)

    # Summary (shown on list page)
    summary = Column(String(300), nullable=True)

    # Created time (UTC + tz-aware)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Emotion (one of six)
    emotion = Column(String, nullable=True)

    # Emotion intensity: 1=low, 2=mid, 3=high
    emotion_intensity = Column(Integer, nullable=True)

    # Primary theme (for list/filter/quick display)
    # Value constrained to: work / hobbies / social / other
    primary_theme = Column(String(20), nullable=True)

    # Theme score distribution (for insights aggregation)
    # Example: {"work":0.2,"hobbies":0.5,"social":0.1,"other":0.2}
    theme_scores = Column(JSON, nullable=True)

    # No longer store reply text directly; access via AIReply relationship
    ai_reply = relationship(
        "AIReply",
        back_populates="entry",
        uselist=False,              # One reply per journal entry
        cascade="all, delete-orphan",
    )

    # Soft-delete flag
    deleted = Column(Boolean, default=False, nullable=False)

    # JournalEntry reverse relationship: comments
    comments = relationship(
        "JournalComment",
        back_populates="entry",
        cascade="all, delete-orphan",
    )

    # Dynamically computed pleasure score (not stored)
    @property
    def pleasure(self):
        base_scores = {
            "joy": 6,
            "calm": 5,
            "tired": 2,
            "anxiety": 1,
            "sadness": 2,
            "anger": 0,
        }

        base = base_scores.get(self.emotion, 0)

        intensity_weight = {
            1: 1.0,
            2: 1.2,
            3: 1.5,
        }

        weight = intensity_weight.get(self.emotion_intensity, 1.0)
        return round(base * weight, 2)
