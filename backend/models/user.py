from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    # 一对多关系（user -> entries）
    entries = relationship(
        "JournalEntry",
        back_populates="user",
        cascade="all, delete-orphan"
    )
