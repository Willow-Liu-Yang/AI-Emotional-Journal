from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func

from database import Base


class InsightsNoteCache(Base):
    __tablename__ = "insights_note_cache"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    range_type = Column(String(10), nullable=False)  # week | month
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    data_signature = Column(String(128), nullable=False)

    note = Column(Text, nullable=False, default="")
    note_author = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    __table_args__ = (
        UniqueConstraint("user_id", "range_type", "start_date", "end_date", name="uq_note_cache_scope"),
    )
