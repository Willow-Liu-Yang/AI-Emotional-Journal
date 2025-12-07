# backend/routers/calendar.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date
from database import get_db
from core.auth import get_current_user
from models import JournalEntry

router = APIRouter(prefix="/journals", tags=["Calendar"])

@router.get("/calendar/week")
def get_week_calendar(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    today = date.today()
    start = today - timedelta(days=today.weekday())  # Monday
    dates = [start + timedelta(days=i) for i in range(7)]

    result = []

    for d in dates:
        count = (
            db.query(JournalEntry)
            .filter(
                JournalEntry.user_id == current_user.id,
                JournalEntry.deleted == False,
                JournalEntry.created_at >= datetime.combine(d, datetime.min.time()),
                JournalEntry.created_at <= datetime.combine(d, datetime.max.time()),
            )
            .count()
        )

        if count == 0:
            paw = "none"
        elif count == 1:
            paw = "light"
        else:
            paw = "dark"

        result.append({"date": d.isoformat(), "paw": paw})

    return {"week": result}

@router.get("/calendar/month")
def get_month_calendar(
    month: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    # Parse month argument
    try:
        year, mon = map(int, month.split("-"))
        first_day = date(year, mon, 1)
    except:
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM.")

    # Determine first weekday & number of days
    start_weekday = first_day.weekday()  # Monday=0
    next_month = date(year + (mon == 12), (mon % 12) + 1, 1)
    total_days = (next_month - first_day).days

    # Build a flat list of 42 cells (6 weeks × 7 days)
    cells = []

    # Fill leading days from previous month
    for _ in range(start_weekday):
        cells.append("none")

    # Fill actual month days
    for i in range(1, total_days + 1):
        d = date(year, mon, i)

        count = (
            db.query(JournalEntry)
            .filter(
                JournalEntry.user_id == current_user.id,
                JournalEntry.deleted == False,
                JournalEntry.created_at >= datetime.combine(d, datetime.min.time()),
                JournalEntry.created_at <= datetime.combine(d, datetime.max.time()),
            )
            .count()
        )

        if count == 0:
            paw = "none"
        elif count == 1:
            paw = "light"
        else:
            paw = "dark"

        cells.append(paw)

    # Fill trailing empty cells
    while len(cells) < 42:
        cells.append("none")

    # Split into 6 rows × 7 cols
    month_grid = [cells[i:i+7] for i in range(0, 42, 7)]

    return {"month": month_grid}
