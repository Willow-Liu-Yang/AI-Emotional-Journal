from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from models import JournalEntry, User


# ============================================================
# WEEK CALENDAR (Mon → Sun)
# ============================================================
def build_week_calendar(db: Session, current_user: User):
    today = date.today()
    monday = today - timedelta(days=today.weekday())  # Monday
    days = [monday + timedelta(days=i) for i in range(7)]

    result = []

    for d in days:
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

    # Build 42 calendar cells (6 weeks)
    cells = []

    # --- leading empty days ---
    for _ in range(start_weekday):
        cells.append("none")

    # --- actual days ---
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

    # --- trailing empty cells until 6 rows ---
    while len(cells) < 42:
        cells.append("none")

    # Split into 6 × 7
    month_grid = [cells[i:i+7] for i in range(0, 42, 7)]

    return {"month": month_grid}
