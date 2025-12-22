from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Username (nullable; set after signup)
    username = Column(String(50), nullable=True)

    # User email (unique)
    email = Column(String, unique=True, nullable=False)

    # Hashed password (required)
    password = Column(String, nullable=False)

    # ----------------------------------------
    # Currently selected AI companion
    # Default bind to Luna (id = 1)
    # ----------------------------------------
    companion_id = Column(
        Integer,
        ForeignKey("ai_companions.id"),
        nullable=True,
        default=1,          # Python-side default
        server_default="1", # DB-side default
    )

    # Current companion (many-to-one: many users can pick one companion)
    companion = relationship(
        "AICompanion",
        foreign_keys=[companion_id],      # Specify which FK to use
        back_populates="selected_by_users",
        lazy="joined",
    )

    # Custom companions I created (system presets have created_by_user_id = NULL)
    custom_companions = relationship(
        "AICompanion",
        back_populates="creator",
        foreign_keys="AICompanion.created_by_user_id",
        cascade="all, delete-orphan",
    )

    # Account creation time
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationship to journal entries (one-to-many)
    entries = relationship(
        "JournalEntry",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    # All my AI replies (one-to-many)
    ai_replies = relationship(
        "AIReply",
        back_populates="user",
        cascade="all, delete-orphan",
    )
