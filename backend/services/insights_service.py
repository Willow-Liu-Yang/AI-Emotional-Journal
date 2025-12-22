# backend/services/insights_service.py

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from models import JournalEntry, AICompanion, User
from .ai_summary_service import generate_summary_message

# Import calendar generation logic
from .calendar_service import build_week_calendar, build_month_calendar


VALENCE = {
    "joy": 2,
    "calm": 1,
    "tired": -1,
    "anxiety": -1,
    "sadness": -2,
    "anger": -2,
}

# Use unified theme keys: work/hobbies/social/other (no more job)
THEME_KEYS = ["work", "hobbies", "social", "other"]


# -----------------------------
# Time range helpers (UTC-aware)
# -----------------------------
def get_datetime_range_utc(range_type: str) -> tuple[datetime, datetime]:
    """
    Return [start, end) in UTC, both tz-aware datetimes.

    - week: Monday 00:00Z -> next Monday 00:00Z
    - month: 1st day 00:00Z -> 1st day of next month 00:00Z
    """
    now = datetime.now(timezone.utc)
    today = now.date()

    if range_type == "week":
        start_date = today - timedelta(days=today.weekday())  # Monday is 0
        start = datetime(start_date.year, start_date.month, start_date.day, tzinfo=timezone.utc)
        end = start + timedelta(days=7)
        return start, end

    # month
    start = datetime(today.year, today.month, 1, tzinfo=timezone.utc)
    if today.month == 12:
        end = datetime(today.year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(today.year, today.month + 1, 1, tzinfo=timezone.utc)
    return start, end


def get_entries(db: Session, user_id: int, start: datetime, end: datetime):
    """
    Query entries in [start, end) (UTC, tz-aware).
    """
    return (
        db.query(JournalEntry)
        .filter(
            JournalEntry.user_id == user_id,
            JournalEntry.deleted == False,
            JournalEntry.created_at >= start,
            JournalEntry.created_at < end,
        )
        .all()
    )


# -----------------------------
# Theme helpers
# -----------------------------
def _coerce_float(x: Any) -> Optional[float]:
    try:
        if x is None:
            return None
        if isinstance(x, (int, float)):
            return float(x)
        if isinstance(x, str):
            return float(x.strip())
    except Exception:
        return None
    return None


def _normalize_theme_scores(scores_dict: Any) -> Optional[Dict[str, float]]:
    """
    Input may be:
    - dict: {"work":0.2,...}
    - None
    - (rare) str JSON if backend/DB driver returns raw text

    Output:
    - dict with exactly THEME_KEYS, values >=0, sum == 1 (approx)
    - None if input cannot be parsed / sum <= 0
    """
    if scores_dict is None:
        return None

    # If somehow stored as text
    if isinstance(scores_dict, str):
        try:
            import json

            scores_dict = json.loads(scores_dict)
        except Exception:
            return None

    if not isinstance(scores_dict, dict):
        return None

    cleaned: Dict[str, float] = {k: 0.0 for k in THEME_KEYS}
    for k in THEME_KEYS:
        v = _coerce_float(scores_dict.get(k))
        if v is None or v < 0:
            v = 0.0
        cleaned[k] = float(v)

    total = sum(cleaned.values())
    if total <= 0:
        return None

    for k in cleaned:
        cleaned[k] = cleaned[k] / total

    # Fix floating error by adding delta to other
    total2 = sum(cleaned.values())
    diff = 1.0 - total2
    if abs(diff) > 1e-9:
        cleaned["other"] = max(0.0, cleaned["other"] + diff)

    return cleaned


# -----------------------------
# Main aggregation
# -----------------------------
def aggregate_insights(db: Session, current_user: User, range_type: str):
    """Aggregate stats + theme distribution (from DB theme_scores) + emotion trend + Calendar + AI Summary."""
    user_id = current_user.id

    # 1) Time range (UTC-aware, [start, end))
    start, end = get_datetime_range_utc(range_type)

    # 2) entries
    entries = get_entries(db, user_id, start, end)

    # ------------------------------
    # A. Basic stats
    # ------------------------------
    content_joined = " ".join([e.content for e in entries])
    stats = {
        "entries": len(entries),
        "words": len(content_joined.split()) if content_joined else 0,
        "active_days": len({e.created_at.date() for e in entries}),
    }

    # ------------------------------
    # B. Emotion distribution
    # ------------------------------
    emotion_counts: Dict[str, int] = {}
    for e in entries:
        if e.emotion:
            emotion_counts[e.emotion] = emotion_counts.get(e.emotion, 0) + 1

    # ------------------------------
    # C. Emotion valence trend (daily)
    # ------------------------------
    trend: Dict[str, int] = {}
    for e in entries:
        d = e.created_at.date().isoformat()
        v = VALENCE.get(e.emotion, 0)
        trend[d] = trend.get(d, 0) + v

    emotion_trend = [{"date": d, "valence": v} for d, v in sorted(trend.items())]

    # ------------------------------
    # D. Theme aggregation (Inner Landscape)
    # - entries=0 -> themes={}
    # - entries>0 but no valid theme_scores -> themes={}
    # ------------------------------
    if not entries:
        theme_distribution: Dict[str, float] = {}
    else:
        theme_sum = {k: 0.0 for k in THEME_KEYS}
        valid_theme_count = 0

        for e in entries:
            normalized = _normalize_theme_scores(getattr(e, "theme_scores", None))
            if not normalized:
                continue
            valid_theme_count += 1
            for k in THEME_KEYS:
                theme_sum[k] += float(normalized.get(k, 0.0))

        if valid_theme_count == 0:
            theme_distribution = {}
        else:
            total_theme = sum(theme_sum.values()) or 1.0
            theme_distribution = {k: round(theme_sum[k] / total_theme, 3) for k in THEME_KEYS}

    # ------------------------------
    # E. Calendar (weekly / monthly)
    # ------------------------------
    if range_type == "week":
        calendar_data = build_week_calendar(db, current_user)
    else:
        month_str = datetime.now(timezone.utc).strftime("%Y-%m")
        calendar_data = build_month_calendar(db, current_user, month_str)

    # ------------------------------
    # F. Mood Booster & Stressors (placeholder)
    # ------------------------------
    booster = ["Morning Run", "Coffee Time", "Drawing"]
    stressors = ["Deadlines", "Rainy days"]

    # ------------------------------
    # G. A Note from Companion
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

    if not entries:
        note = ""
    else:
        note = generate_summary_message(companion_obj, emotion_trend, emotion_counts)
    note_author = (
        companion_obj.get("name")
        if isinstance(companion_obj, dict) and companion_obj.get("name")
        else "Companion"
    )

    # ------------------------------
    # H. Return
    # ------------------------------
    return {
        "stats": stats,
        "themes": theme_distribution,  # When {}, frontend shows empty state
        "emotions": emotion_counts,
        "valence_trend": emotion_trend,
        "calendar": calendar_data,
        "booster": booster,
        "stressors": stressors,
        "note": note,
        "note_author": note_author,
    }
