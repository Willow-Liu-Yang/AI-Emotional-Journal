from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from calendar import monthrange
from statistics import mean

from database import get_db
from core.auth import get_current_user
from models import JournalEntry, User


router = APIRouter(
    prefix="/stats",
    tags=["Statistics"]
)


@router.get("/")
def get_stats(
    stats_range: str = Query(..., pattern="^(month|week)$"),
    date: str = Query(..., description="Month: YYYY-MM, Week: YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ============ 1. 解析时间范围 ============

    if stats_range == "month":
        try:
            year, month_num = map(int, date.split("-"))
            start = datetime(year, month_num, 1)
            days_in_month = monthrange(year, month_num)[1]
            end = datetime(year, month_num, days_in_month, 23, 59, 59)
        except:
            raise HTTPException(status_code=400, detail="Invalid month format (YYYY-MM)")

        # 正确：使用 Python 内置 range
        time_units = list(range(1, days_in_month + 1))

    else:  # week
        try:
            base_day = datetime.fromisoformat(date)
        except:
            raise HTTPException(status_code=400, detail="Invalid date format (YYYY-MM-DD)")

        weekday = base_day.weekday()   # Monday = 0
        start = base_day - timedelta(days=weekday)
        end = start + timedelta(days=6, hours=23, minutes=59, seconds=59)

        time_units = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


    # ============ 2. 查询日记 ============

    entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id,
        JournalEntry.deleted == False,
        JournalEntry.created_at >= start,
        JournalEntry.created_at <= end
    ).all()


    # ============ 3. 基础统计 ============

    total_entries = len(entries)
    total_words = sum(len(e.content) for e in entries)
    active_days = len(set(e.created_at.date() for e in entries))

    basic_stats = {
        "total_entries": total_entries,
        "total_words": total_words,
        "active_days": active_days,
        "stats_range": stats_range,
        "date": date,
    }


    # ============ 4. 情绪饼图 ============

    emotions = ["joy", "calm", "tired", "anxiety", "sadness", "anger"]
    emotion_counts = {emotion: 0 for emotion in emotions}

    for e in entries:
        if e.emotion in emotion_counts:
            emotion_counts[e.emotion] += 1


    # ============ 5. 愉悦度折线图 + 打卡 ============

    if stats_range == "month":

        # 初始化天数映射：1..days_in_month
        day_map = {day: [] for day in time_units}

        for e in entries:
            day = e.created_at.day
            if day in day_map:
                day_map[day].append(e.pleasure)

        # 生成 month 曲线
        pleasure_curve = [
            {
                "day": day,
                "pleasure": mean(scores) if scores else None
            }
            for day, scores in day_map.items()
        ]

        # 生成月历
        activity_calendar = {
            f"{year}-{month_num:02d}-{day:02d}": (len(day_map[day]) > 0)
            for day in time_units
        }

    else:  # week

        # 正确：range(7)，不是 stats_range(7)
        week_map = {i: [] for i in range(7)}

        for e in entries:
            wd = e.created_at.weekday()
            week_map[wd].append(e.pleasure)

        # weekly 曲线
        pleasure_curve = []
        for i, label in enumerate(time_units):
            scores = week_map[i]
            pleasure_curve.append({
                "day": label,
                "pleasure": mean(scores) if scores else None
            })

        # weekly 打卡
        activity_calendar = {}
        for i, label in enumerate(time_units):
            day_date = (start + timedelta(days=i)).date()
            activity_calendar[str(day_date)] = (len(week_map[i]) > 0)


    # ============ 6. 主题图（暂无） ============

    topics = {
        "work": 0,
        "hobbies": 0,
        "social": 0
    }


    return {
        "basic": basic_stats,
        "emotion_pie": emotion_counts,
        "pleasure_curve": pleasure_curve,
        "activity_calendar": activity_calendar,
        "topics": topics
    }
