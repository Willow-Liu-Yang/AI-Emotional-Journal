from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # 用户名（可为空，注册后再设置）
    username = Column(String(50), nullable=True)

    # 用户邮箱（唯一）
    email = Column(String, unique=True, nullable=False)

    # 加密后密码（必填）
    password = Column(String, nullable=False)

    # ----------------------------------------
    # AI Companion：用户选择的 AI 小伙伴
    # 默认绑定 Luna（id = 1）
    # ----------------------------------------
    companion_id = Column(
        Integer,
        ForeignKey("ai_companions.id"),
        nullable=True,
        default=1,          # Python 端默认值
        server_default="1"  # 数据库端默认值
    )

    # 与 AICompanion 的反向关系
    companion = relationship(
        "AICompanion",
        lazy="joined"        # 查询用户时自动 JOIN，性能更好
    )
    
    # 账号创建时间
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # ----------------------------------------
    # 与日记的关系（一对多）
    # ----------------------------------------
    entries = relationship(
        "JournalEntry",
        back_populates="user",
        cascade="all, delete-orphan"
    )
