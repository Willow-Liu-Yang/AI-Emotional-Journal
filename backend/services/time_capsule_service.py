from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Optional
import calendar
import re

from sqlalchemy.orm import Session

from models import JournalEntry, User, AICompanion
from core.ai_client import call_siliconflow
from fastapi import HTTPException


def _get_companion_or_default(db: Session, current_user: User) -> AICompanion:
    companion: Optional[AICompanion] = getattr(current_user, "companion", None)
    if companion:
        return companion

    default_companion = (
        db.query(AICompanion)
        .filter(AICompanion.id == 1, AICompanion.is_active == True)
        .first()
    )
    if not default_companion:
        raise HTTPException(status_code=500, detail="Default AI companion not configured.")
    return default_companion


def _safe_date(year: int, month: int, day: int) -> date:
    last_day = calendar.monthrange(year, month)[1]
    safe_day = min(day, last_day)
    return date(year, month, safe_day)


def _candidate_dates(today: date) -> list[tuple[str, date]]:
    last_year = _safe_date(today.year - 1, today.month, today.day)

    if today.month == 1:
        last_month = _safe_date(today.year - 1, 12, today.day)
    else:
        last_month = _safe_date(today.year, today.month - 1, today.day)

    last_week = today - timedelta(days=7)

    return [
        ("year", last_year),
        ("month", last_month),
        ("week", last_week),
    ]


def _find_entry_on_date(db: Session, user_id: int, target_date: date) -> Optional[JournalEntry]:
    start = datetime(target_date.year, target_date.month, target_date.day, tzinfo=timezone.utc)
    end = start + timedelta(days=1)

    return (
        db.query(JournalEntry)
        .filter(
            JournalEntry.user_id == user_id,
            JournalEntry.deleted == False,
            JournalEntry.created_at >= start,
            JournalEntry.created_at < end,
        )
        .order_by(JournalEntry.created_at.desc())
        .first()
    )


def _build_time_capsule_prompt(content: str, companion: AICompanion) -> str:
    persona = companion.persona_prompt or (
        f"You are {companion.name}, a warm journaling companion. "
        "You are helping the user reflect on past writing."
    )

    prompt = f"""{persona}

You are selecting ONE sentence from the journal entry to show in a "Time Capsule" card.

Rules:
- Return exactly one complete sentence from the entry (verbatim, no paraphrase).
- Prefer a meaningful or joyful sentence; if none, pick the most meaningful sentence.
- Output only the sentence. No quotes, no JSON, no extra text.

Journal entry:
\"\"\"{content}\"\"\"
"""
    return prompt


def _clean_llm_quote(raw: str) -> str:
    text = (raw or "").strip()
    if not text:
        return ""

    # Remove code fences if any.
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z0-9]*", "", text).strip()
        text = re.sub(r"```$", "", text).strip()

    # Remove surrounding quotes.
    if (text.startswith('"') and text.endswith('"')) or (text.startswith("'") and text.endswith("'")):
        text = text[1:-1].strip()

    # Keep only the first non-empty line.
    for line in text.splitlines():
        line = line.strip()
        if line:
            return line

    return text


def _fallback_quote(content: str) -> str:
    text = (content or "").strip()
    if not text:
        return ""

    # Split by sentence punctuation (ASCII + CJK).
    parts = re.split(r"(?<=[.!?])\s+|[\u3002\uFF01\uFF1F]\s*", text)
    sentences = [p.strip() for p in parts if p and p.strip()]

    if not sentences:
        return text[:120].strip()

    # Prefer a moderately long sentence.
    sentences.sort(key=len, reverse=True)
    return sentences[0][:120].strip()


def _extract_quote_with_ai(db: Session, current_user: User, content: str) -> str:
    companion = _get_companion_or_default(db, current_user)
    prompt = _build_time_capsule_prompt(content, companion)

    try:
        raw = call_siliconflow(prompt)
    except Exception:
        return _fallback_quote(content)

    quote = _clean_llm_quote(raw)
    if not quote:
        return _fallback_quote(content)

    # Ensure the quote exists in the original content; otherwise fallback.
    if quote not in content:
        return _fallback_quote(content)

    return quote


def get_time_capsule(db: Session, current_user: User) -> dict:
    today = datetime.now(timezone.utc).date()

    for level, target_date in _candidate_dates(today):
        entry = _find_entry_on_date(db, current_user.id, target_date)
        if not entry:
            continue

        quote = _extract_quote_with_ai(db, current_user, entry.content)
        return {
            "found": True,
            "source_date": target_date,
            "source_level": level,
            "quote": quote,
            "entry_id": entry.id,
        }

    return {
        "found": False,
        "source_date": None,
        "source_level": None,
        "quote": None,
        "entry_id": None,
    }
