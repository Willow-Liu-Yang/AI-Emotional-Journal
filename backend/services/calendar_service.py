from datetime import date, datetime, timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session
from models import JournalEntry, User


def _counts_by_day(db: Session, current_user: User, start: date, end: date) -> dict[str, int]:
    start_dt = datetime.combine(start, datetime.min.time())
    end_dt = datetime.combine(end, datetime.min.time())

    rows = (
        db.query(func.date(JournalEntry.created_at).label("day"), func.count(JournalEntry.id))
        .filter(
            JournalEntry.user_id == current_user.id,
            JournalEntry.deleted == False,
            JournalEntry.created_at >= start_dt,
            JournalEntry.created_at < end_dt,
        )
        .group_by("day")
        .all()
    )

    counts: dict[str, int] = {}
    for day_val, cnt in rows:
        if isinstance(day_val, date):
            key = day_val.isoformat()
        else:
            key = str(day_val)
        counts[key] = int(cnt or 0)

    return counts


# ============================================================
# WEEK CALENDAR (Mon → Sun)
# ============================================================
def build_week_calendar(db: Session, current_user: User):
    today = date.today()
    monday = today - timedelta(days=today.weekday())  # Monday
    days = [monday + timedelta(days=i) for i in range(7)]
    counts = _counts_by_day(db, current_user, monday, monday + timedelta(days=7))

    result = []

    for d in days:
        count = counts.get(d.isoformat(), 0)

        if count == 0:
            paw = "none"
        elif count == 1:
            paw = "light"
        else:
            paw = "dark"

        result.append({
            "date": d.isoformat(),
            "paw": paw
        })

    return {"week": result}



# ============================================================
# MONTH CALENDAR (6 rows × 7 columns)
# ============================================================
def build_month_calendar(db: Session, current_user: User, month_str: str):
    """
    month_str: "YYYY-MM"
    output: {"month": [ [cells], [cells], ... ] }
    """
    try:
        year, mon = map(int, month_str.split("-"))
        first_day = date(year, mon, 1)
    except:
        raise ValueError("Invalid month format. Use YYYY-MM")

    # Start weekday (Mon=0)
    start_weekday = first_day.weekday()

    # Compute number of days in the month
    next_month = date(year + (mon == 12), (mon % 12) + 1, 1)
    total_days = (next_month - first_day).days

    counts = _counts_by_day(db, current_user, first_day, next_month)

    # Build 42 calendar cells (6 weeks)
    cells = []

    # --- leading empty days ---
    for _ in range(start_weekday):
        cells.append("none")

    # --- actual days ---
    for i in range(1, total_days + 1):
        d = date(year, mon, i)

        count = counts.get(d.isoformat(), 0)

        if count == 0:
            paw = "none"
        elif count == 1:
            paw = "light"
        else:
            paw = "dark"

        cells.append(paw)

    # --- trailing empty cells until 6 rows ---
    while len(cells) < 42:
        cells.append("none")

    # Split into 6 × 7
    month_grid = [cells[i:i+7] for i in range(0, 42, 7)]

    return {"month": month_grid}
