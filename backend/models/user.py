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
    # 当前选择的 AI 小伙伴
    # 默认绑定 Luna（id = 1）
    # ----------------------------------------
    companion_id = Column(
        Integer,
        ForeignKey("ai_companions.id"),
        nullable=True,
        default=1,          # Python 端默认值
        server_default="1", # 数据库端默认值
    )

    # 当前选择的 AI 伴侣（多对一：很多用户可以选同一个伴侣）
    companion = relationship(
        "AICompanion",
        foreign_keys=[companion_id],      # ✅ 指明用哪条外键
        back_populates="selected_by_users",
        lazy="joined",
    )

    # 我创建的自定义 AI 伴侣（系统预设的 created_by_user_id = NULL，不会出现在这里）
    custom_companions = relationship(
        "AICompanion",
        back_populates="creator",
        foreign_keys="AICompanion.created_by_user_id",
        cascade="all, delete-orphan",
    )

    # 账号创建时间
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # 与日记的关系（一对多）
    entries = relationship(
        "JournalEntry",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    # 我所有的 AI 回复（一对多）
    ai_replies = relationship(
        "AIReply",
        back_populates="user",
        cascade="all, delete-orphan",
    )
