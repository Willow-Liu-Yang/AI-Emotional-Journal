# backend/models/companion.py

from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from database import Base


class AICompanion(Base):
    __tablename__ = "ai_companions"

    id = Column(Integer, primary_key=True, index=True)

    # UI 名称（如：Luna / Sol / Terra）
    name = Column(String(50), nullable=False)

    # 内部 key（用于 prompt，例如：luna / sol / terra）
    key = Column(String(50), unique=True, nullable=False)

    # 角色标题（如：Your Gentle Companion）
    identity_title = Column(String(100), nullable=False)

    # 卡片下方的描述段落
    description = Column(Text, nullable=False)

    # 三个标签
    tags = Column(ARRAY(String), nullable=False)

    # 插画 key（前端资源）
    avatar_key = Column(String(50), nullable=True)

    # 背景色，例如 "#FFD47D"
    theme_color = Column(String(20), nullable=True)

    # 排序
    order_index = Column(Integer, nullable=False, server_default="0")
