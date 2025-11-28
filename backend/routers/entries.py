from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from models import JournalEntry
from schemas import EntryCreate, EntryOut, EntrySummary
from ai import analyze_emotion_and_reply   # 你需要自己创建的 AI 调用工具
from datetime import datetime

from schemas import EntryUpdate

from core.auth import get_current_user
from models import User
from database import get_db


router = APIRouter(
    prefix="/entries",
    tags=["Journal Entries"]
)




# ------------------------------------------------
# POST /entries —— 创建日记 + AI 情绪分析（可选）
# ------------------------------------------------
@router.post("/", response_model=EntryOut)
def create_entry(entry: EntryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    # 1. 创建原始日记
    new_entry = JournalEntry(
        content=entry.content,
        created_at=datetime.utcnow(),
        deleted=False,
        user_id=current_user.id
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    # 2. 同步情绪分析
    emotion_result = analyze_emotion_and_reply(entry.content)

    new_entry.emotion = emotion_result["emotion"]
    new_entry.emotion_score = emotion_result["score"]

    # 3. 如果需要 AI 回复，则生成回复
    if entry.need_ai_reply:
        new_entry.ai_reply = emotion_result["reply"]

    db.commit()
    db.refresh(new_entry)

    return new_entry


# ------------------------------------------------
# GET /entries —— 获取日记列表（带 summary）
# ------------------------------------------------
@router.get("/", response_model=list[EntrySummary])
def read_entries(
        date: str | None = Query(None),
        from_date: str | None = Query(None),
        to_date: str | None = Query(None),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
    ):

    query = db.query(JournalEntry).filter(
        JournalEntry.deleted == False,
        JournalEntry.user_id == current_user.id
    )

    # 按某一天或某个月份筛选
    if date:
        # 2024-11 or 2024-11-20
        try:
            if len(date) == 7:  # YYYY-MM
                year, month = date.split("-")
                start = datetime(int(year), int(month), 1)
                if month == "12":
                    end = datetime(int(year) + 1, 1, 1)
                else:
                    end = datetime(int(year), int(month) + 1, 1)
            else:  # YYYY-MM-DD
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

    # 返回 summary 格式
    result = []
    for e in entries:
        result.append(EntrySummary(
            id=e.id,
            created_at=e.created_at,
            summary=e.content[:200]
        ))
    return result


# ------------------------------------------------
# GET /entries/{id} —— 返回完整日记详情
# ------------------------------------------------
@router.get("/{entry_id}", response_model=EntryOut)
def read_entry(entry_id: int, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id,
        JournalEntry.deleted == False
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry



# ------------------------------------------------
# DELETE /entries/{id} —— 软删除
# ------------------------------------------------
@router.delete("/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id,
        JournalEntry.deleted == False
    ).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    entry.deleted = True
    db.commit()

    return {"message": f"Entry {entry_id} deleted (soft delete)"}


# ------------------------------------------------
# PUT /entries/{id} —— 编辑日记 + 自动重新 AI 分析
# ------------------------------------------------
@router.put("/{entry_id}", response_model=EntryOut)
def update_entry(
    entry_id: int,
    update: EntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 取出当前用户的日记（权限检查）
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id,   # 只能改自己的
        JournalEntry.deleted == False
    ).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    # 更新内容
    entry.content = update.content

    # 重新进行 AI 分析
    emotion_result = analyze_emotion_and_reply(update.content)
    entry.emotion = emotion_result["emotion"]
    entry.emotion_score = emotion_result["score"]

    # AI 回复（字段名保持一致）
    entry.ai_reply = emotion_result["reply"] if update.need_ai_reply else None

    # 保存数据库
    db.commit()
    db.refresh(entry)

    return entry


