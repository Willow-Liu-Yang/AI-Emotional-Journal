from sqlalchemy import (
    Column,
    Integer,
    Text,
    TIMESTAMP,
    func,
    String,
    Boolean,
    ForeignKey,
    JSON,   # ✅ 新增
)
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy import DateTime




class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)

    # 所属用户
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="entries")

    # 日记内容
    content = Column(Text, nullable=False)

    # 摘要（列表页显示）
    summary = Column(String(300), nullable=True)

    # 创建时间
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # 情绪（六选一）
    emotion = Column(String, nullable=True)

    # 情绪强度：1=低, 2=中, 3=高
    emotion_intensity = Column(Integer, nullable=True)

    # ✅ 新增：主主题（用于列表/筛选/快速展示）
    # 值建议限定为：job / hobbies / social / other
    primary_theme = Column(String(20), nullable=True)

    # ✅ 新增：主题权重分布（用于 insights 聚合）
    # 形如：{"job":0.2,"hobbies":0.5,"social":0.1,"other":0.2}
    theme_scores = Column(JSON, nullable=True)

    # ✅ 不再直接存文本回复，而是通过关系访问 AIReply
    ai_reply = relationship(
        "AIReply",
        back_populates="entry",
        uselist=False,              # 一篇日记最多一条回复
        cascade="all, delete-orphan",
    )

    # 软删除标记
    deleted = Column(Boolean, default=False, nullable=False)

    # JournalEntry 反向关系：评论
    comments = relationship(
        "JournalComment",
        back_populates="entry",
        cascade="all, delete-orphan",
    )

    # ⭐ 动态计算愉悦度（不存数据库）
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

