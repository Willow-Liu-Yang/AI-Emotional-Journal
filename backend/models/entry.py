from sqlalchemy import Column, Integer, Text, TIMESTAMP, func, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


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
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # 情绪（六选一）
    emotion = Column(String, nullable=True)

    # 情绪强度：1=低, 2=中, 3=高
    emotion_intensity = Column(Integer, nullable=True)

    # AI 回复（如果用户选择生成）
    ai_reply = Column(Text, nullable=True)

    # 软删除标记
    deleted = Column(Boolean, default=False, nullable=False)
    
    #JournalEntry反向关系
    comments = relationship("JournalComment", back_populates="entry", cascade="all, delete-orphan")


    # ⭐ 动态计算愉悦度（不存数据库）
    @property
    def pleasure(self):
        base_scores = {
            "joy": 6,
            "calm": 5,
            "surprise": 4,
            "sad": 2,
            "fear": 1,
            "anger": 0
        }

        base = base_scores.get(self.emotion, 0)

        intensity_weight = {
            1: 1.0,
            2: 1.2,
            3: 1.5
        }

        weight = intensity_weight.get(self.emotion_intensity, 1.0)

        return round(base * weight, 2)
