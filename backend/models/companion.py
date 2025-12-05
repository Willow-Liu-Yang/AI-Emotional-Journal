# backend/models/companion.py

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    ForeignKey,
    DateTime,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship

from database import Base


class AICompanion(Base):
    __tablename__ = "ai_companions"

    id = Column(Integer, primary_key=True, index=True)

    # ====== UI 展示相关 ======
    # UI 名称（如：Luna / Sol / Terra）
    name = Column(String(50), nullable=False)

    # 内部 key（用于代码 / prompt，例如：luna / sol / terra）
    key = Column(String(50), unique=True, nullable=False)

    # 角色标题（如：Your Gentle Companion）
    identity_title = Column(String(100), nullable=False)

    # 卡片下方的描述段落（给用户看的简介）
    description = Column(Text, nullable=False)

    # 三个左右的标签（给用户看的性格标签）
    tags = Column(ARRAY(String), nullable=False)

    # 插画 key（前端资源）
    avatar_key = Column(String(50), nullable=True)

    # 背景色，例如 "#FFD47D"
    theme_color = Column(String(20), nullable=True)

    # 排序（列表展示顺序）
    order_index = Column(Integer, nullable=False, server_default="0")

    # ====== 来源：系统预设 or 自定义 ======
    # 系统预设：created_by_user_id = NULL
    # 用户自定义：created_by_user_id = 某个 user.id
    created_by_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    # 是否启用（软删除/下架用）
    is_active = Column(Boolean, nullable=False, server_default="true")

    # ====== LLM 行为配置（给模型看的） ======
    # 给 LLM 的完整人设说明（长文本）
    persona_prompt = Column(Text, nullable=True)

    # 回复长度偏好：short / medium / long
    reply_length_hint = Column(
        String(20),
        nullable=False,
        server_default="medium",
    )

    # 是否允许这个 AI 给“建议类”内容
    allow_suggestions = Column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    # ====== 管理字段 ======
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ====== 关系（和 User / AIReply 对应） ======

    # 创建这个自定义 AI 的用户（系统预设为 NULL）
    creator = relationship(
        "User",
        back_populates="custom_companions",
        foreign_keys=[created_by_user_id],
    )

    # 被哪些用户选为当前 companion（多对一反向）
    selected_by_users = relationship(
        "User",
        back_populates="companion",
        foreign_keys="User.companion_id",
    )

    # 这个 AI 生成过哪些回复
    replies = relationship(
        "AIReply",
        back_populates="companion",
    )
