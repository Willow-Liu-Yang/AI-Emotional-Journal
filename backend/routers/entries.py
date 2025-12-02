from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from core.auth import get_current_user

from models import JournalEntry, User
from schemas import EntryCreate, EntryOut, EntrySummary


router = APIRouter(
    prefix="/entries",
    tags=["Journal Entries"]
)


# ------------------------------------------------
# 工具函数：生成摘要 summary（取前 200 字）
# ------------------------------------------------
def generate_summary(content: str) -> str:
    return content[:200].strip()


# ------------------------------------------------
# POST /entries —— 创建日记（emotion + intensity）
# ------------------------------------------------
@router.post("/", response_model=EntryOut)
def create_entry(
    entry: EntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_entry = JournalEntry(
        user_id=current_user.id,
        content=entry.content,
        summary=generate_summary(entry.content),
        created_at=datetime.utcnow(),
        emotion=entry.emotion,                       # 六选一
        emotion_intensity=entry.emotion_intensity,   # 1 / 2 / 3
        deleted=False
    )

    # 如果需要 AI 回复
    if entry.need_ai_reply:
        # 这里你之后再接真实 AI 调用就行
        new_entry.ai_reply = "AI 回复功能尚未配置"

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    # ⭐ 将 pleasure 加进去返回
    return EntryOut.model_validate({
        **new_entry.__dict__,
        "pleasure": new_entry.pleasure
    })


# ------------------------------------------------
# GET /entries —— 获取日记列表（summary）
# ------------------------------------------------
@router.get("/", response_model=list[EntrySummary])
def get_entries(
    date: str | None = Query(None),
    from_date: str | None = Query(None),
    to_date: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    query = db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id,
        JournalEntry.deleted == False
    )

    # 按年月或日期筛选
    if date:
        try:
            if len(date) == 7:   # YYYY-MM
                year, month = date.split("-")
                start = datetime(int(year), int(month), 1)
                month_int = int(month)

                if month_int == 12:
                    end = datetime(int(year) + 1, 1, 1)
                else:
                    end = datetime(int(year), month_int + 1, 1)
            else:                # YYYY-MM-DD
                start = datetime.fromisoformat(date)
                end = start.replace(hour=23, minute=59, second=59)
        except:
            raise HTTPException(status_code=400, detail="Invalid date format")

        query = query.filter(JournalEntry.created_at >= start,
                             JournalEntry.created_at < end)

    # 时间区间
    if from_date and to_date:
        try:
            start = datetime.fromisoformat(from_date)
            end = datetime.fromisoformat(to_date)
        except:
            raise HTTPException(status_code=400, detail="Invalid date range")

        query = query.filter(JournalEntry.created_at >= start,
                             JournalEntry.created_at <= end)

    entries = query.order_by(JournalEntry.created_at.desc()).all()

    return [
        EntrySummary.model_validate(e)
        for e in entries
    ]


# ------------------------------------------------
# GET /entries/{id} —— 获取详情（带 pleasure）
# ------------------------------------------------
@router.get("/{entry_id}", response_model=EntryOut)
def get_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id,
        JournalEntry.deleted == False
    ).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    return EntryOut.model_validate({
        **entry.__dict__,
        "pleasure": entry.pleasure
    })


# ------------------------------------------------
# DELETE /entries/{id} —— 软删除
# ------------------------------------------------
@router.delete("/{entry_id}")
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id,
        JournalEntry.deleted == False
    ).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    entry.deleted = True
    db.commit()

    return {"message": f"Entry {entry_id} deleted"}
