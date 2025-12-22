from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from database import get_db
from core.auth import get_current_user

from models import JournalEntry, User
from schemas import EntryCreate, EntryOut, EntrySummary, AIReplyOut
from services.ai_reply_service import generate_ai_reply_for_entry, analyze_entry_for_entry


router = APIRouter(
    prefix="/entries",
    tags=["Journal Entries"],
)


# ------------------------------------------------
# Helper: generate summary (first 200 chars)
# ------------------------------------------------
def generate_summary(content: str) -> str:
    return content[:200].strip()


def _parse_date_ymd_to_utc_start(date_str: str) -> datetime:
    """Parse YYYY-MM-DD and return UTC start of that day (00:00:00Z)."""
    try:
        d = datetime.fromisoformat(date_str).date()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format")
    return datetime(d.year, d.month, d.day, tzinfo=timezone.utc)


def _parse_month_ym_to_utc_range(month_str: str) -> tuple[datetime, datetime]:
    """Parse YYYY-MM and return [start, end) for that month (UTC)."""
    try:
        year_str, month_str2 = month_str.split("-")
        year = int(year_str)
        month = int(month_str2)
        if month < 1 or month > 12:
            raise ValueError
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format")

    start = datetime(year, month, 1, tzinfo=timezone.utc)
    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, month + 1, 1, tzinfo=timezone.utc)

    return start, end


# ------------------------------------------------
# POST /entries - create journal entry
# Rules:
# - Always generate analysis fields (emotion/theme saved to DB) regardless of need_ai_reply
# - Only create AIReply when need_ai_reply=True
# - created_at is set by DB server_default (UTC + tz-aware)
# ------------------------------------------------
@router.post("/", response_model=EntryOut)
def create_entry(
    entry: EntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_entry = JournalEntry(
        user_id=current_user.id,
        content=entry.content,
        summary=generate_summary(entry.content),

        emotion=None,
        emotion_intensity=None,

        primary_theme=None,
        theme_scores=None,

        deleted=False,
    )

    db.add(new_entry)
    db.flush()  # Get new_entry.id first (same Session for later service queries)

    try:
        # Do analysis even without AI reply; if selected, generate reply + analysis
        if entry.need_ai_reply:
            generate_ai_reply_for_entry(
                db=db,
                entry_id=new_entry.id,
                current_user=current_user,
                force_regenerate=False,
            )
        else:
            analyze_entry_for_entry(
                db=db,
                entry_id=new_entry.id,
                current_user=current_user,
                force_regenerate=False,
            )

        # Commit here regardless of service commit; safe to commit again
        db.commit()

    except Exception:
        db.rollback()
        raise

    db.refresh(new_entry)
    return EntryOut.model_validate(new_entry, from_attributes=True)


# ------------------------------------------------
# GET /entries - list journal entries (summary)
# ------------------------------------------------
@router.get("/", response_model=list[EntrySummary])
def get_entries(
    date: str | None = Query(None),
    from_date: str | None = Query(None),
    to_date: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id,
        JournalEntry.deleted == False,
    )

    # ----------------------------
    # Filter by year/month or date
    # ----------------------------
    if date:
        if len(date) == 7:  # YYYY-MM
            start, end = _parse_month_ym_to_utc_range(date)
        else:  # YYYY-MM-DD
            start = _parse_date_ymd_to_utc_start(date)
            end = start + timedelta(days=1)

        query = query.filter(
            JournalEntry.created_at >= start,
            JournalEntry.created_at < end,
        )

    # ----------------------------
    # Time range filter (UTC-aware, half-open interval)
    # Conventions:
    # - from_date: YYYY-MM-DD (inclusive)
    # - to_date:   YYYY-MM-DD (inclusive)
    # Filter [from_date 00:00Z, to_date+1day 00:00Z)
    # ----------------------------
    if from_date or to_date:
        start = _parse_date_ymd_to_utc_start(from_date) if from_date else None
        end = (_parse_date_ymd_to_utc_start(to_date) + timedelta(days=1)) if to_date else None

        if start and end and start >= end:
            raise HTTPException(status_code=400, detail="Invalid date range")

        if start is not None:
            query = query.filter(JournalEntry.created_at >= start)
        if end is not None:
            query = query.filter(JournalEntry.created_at < end)

    entries = query.order_by(JournalEntry.created_at.desc()).all()
    return [EntrySummary.model_validate(e, from_attributes=True) for e in entries]


# ------------------------------------------------
# GET /entries/{id} - get detail (with pleasure + ai_reply)
# ------------------------------------------------
@router.get("/{entry_id}", response_model=EntryOut)
def get_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == current_user.id,
            JournalEntry.deleted == False,
        )
        .first()
    )

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    return EntryOut.model_validate(entry, from_attributes=True)


# ------------------------------------------------
# POST /entries/{id}/ai_reply - generate/regenerate AI reply
# ------------------------------------------------
@router.post("/{entry_id}/ai_reply", response_model=AIReplyOut)
def create_ai_reply_for_entry_endpoint(
    entry_id: int,
    force_regenerate: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ai_reply = generate_ai_reply_for_entry(
        db=db,
        entry_id=entry_id,
        current_user=current_user,
        force_regenerate=force_regenerate,
    )

    # Commit here to avoid uncertainty about service commit
    db.commit()
    db.refresh(ai_reply)

    return AIReplyOut.model_validate(ai_reply, from_attributes=True)


# ------------------------------------------------
# DELETE /entries/{id} - soft delete
# ------------------------------------------------
@router.delete("/{entry_id}")
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == current_user.id,
            JournalEntry.deleted == False,
        )
        .first()
    )

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    entry.deleted = True
    db.commit()

    return {"message": f"Entry {entry_id} deleted"}
