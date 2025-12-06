# backend/services/insights_service.py

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from models import JournalEntry, AICompanion, User
from .ai_topic_service import extract_themes
from .ai_summary_service import generate_summary_message

VALENCE = {
    "joy": 2,
    "calm": 1,
    "tired": -1,
    "anxiety": -1,
    "sadness": -2,
    "anger": -2,
}


def get_date_range(range_type: str):
    today = datetime.today().date()

    if range_type == "week":
        start = today - timedelta(days=today.weekday())
        end = today
    else:
        start = today.replace(day=1)
        end = today

    return start, end


def get_entries(db: Session, user_id: int, start, end):
    end_plus = end + timedelta(days=1)   # 修复：包含整天

    return (
        db.query(JournalEntry)
        .filter(
            JournalEntry.user_id == user_id,
            JournalEntry.deleted == False,
            JournalEntry.created_at >= start,
            JournalEntry.created_at < end_plus
        )
        .all()
    )


def aggregate_insights(db: Session, current_user: User, range_type: str):
    """
    current_user: SQLAlchemy User instance (includes .companion relationship if loaded)
    """
    print("DEBUG current_user.id =", current_user.id)

    user_id = current_user.id
    # 1. 取时间范围
    start, end = get_date_range(range_type)

    # DEBUG 打印时间范围
    print("\n========== DEBUG INSIGHTS RANGE ==========")
    print(f"User ID: {user_id}")
    print(f"Range Type: {range_type}")
    print(f"Start: {start}, End: {end}")
    print("==========================================\n")

    # 2. 查询数据
    entries = get_entries(db, user_id, start, end)

    # ⭐⭐⭐ DEBUG：打印查询到的 entries ⭐⭐⭐
    print("========== DEBUG ENTRIES FETCHED ==========")
    if not entries:
        print("No entries returned from DB query!")
    else:
        for e in entries:
            print(
                f"ID={e.id}, user_id={e.user_id}, deleted={e.deleted}, "
                f"created_at={e.created_at}, emotion={e.emotion}"
            )
    print("===========================================\n")

    # ------------------------------
    # A. 基础统计
    # ------------------------------
    content_joined = " ".join([e.content for e in entries])
    stats = {
        "entries": len(entries),
        "words": len(content_joined.split()) if content_joined else 0,
        "active_days": len({e.created_at.date() for e in entries}),
    }

    # ------------------------------
    # B. 情绪分布
    # ------------------------------
    emotion_counts = {}
    for e in entries:
        if e.emotion:
            emotion_counts[e.emotion] = emotion_counts.get(e.emotion, 0) + 1

    # ------------------------------
    # C. 情绪价趋势（按天）
    # ------------------------------
    trend = {}
    for e in entries:
        d = e.created_at.date().isoformat()
        v = VALENCE.get(e.emotion, 0)
        trend[d] = trend.get(d, 0) + v

    # normalize trend ordering
    emotion_trend = [
        {"date": d, "valence": v}
        for d, v in sorted(trend.items())
    ]

    # ------------------------------
    # D. 主题聚合（Inner Landscape）
    # ------------------------------
    all_themes = {}

    for e in entries:
        themes = extract_themes(e.content)
        for t, w in (themes or {}).items():
            try:
                w_val = float(w)
            except Exception:
                continue
            all_themes[t] = all_themes.get(t, 0.0) + w_val

    # 归一化
    total = sum(all_themes.values()) or 1.0
    theme_distribution = {t: round(w / total, 3) for t, w in all_themes.items()}

    # ------------------------------
    # E. Mood Booster & Stressors (简化版 AI 关键词统计)
    # ------------------------------
    booster = ["Morning Run", "Coffee Time", "Drawing"]
    stressors = ["Deadlines", "Rainy days"]

    # ------------------------------
    # F. A Note from companion (using companion persona)
    # ------------------------------
    companion_obj = None
    if hasattr(current_user, "companion") and current_user.companion:
        c = current_user.companion
        companion_obj = {
            "id": c.id,
            "name": getattr(c, "name", None),
            "identity_title": getattr(c, "identity_title", None),
            "persona_prompt": getattr(c, "persona_prompt", None),
        }
    else:
        default_c = db.query(AICompanion).filter(AICompanion.id == 1).first()
        if default_c:
            companion_obj = {
                "id": default_c.id,
                "name": getattr(default_c, "name", None),
                "identity_title": getattr(default_c, "identity_title", None),
                "persona_prompt": getattr(default_c, "persona_prompt", None),
            }

    note = generate_summary_message(companion_obj, emotion_trend, emotion_counts)

    return {
        "stats": stats,
        "themes": theme_distribution,
        "emotions": emotion_counts,
        "valence_trend": emotion_trend,
        "booster": booster,
        "stressors": stressors,
        "note": note,
    }
