from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from core.auth import get_current_user

from models import JournalEntry, User
from schemas import EntryCreate, EntryOut, EntrySummary, AIReplyOut
from services.ai_reply_service import generate_ai_reply_for_entry


router = APIRouter(
    prefix="/entries",
    tags=["Journal Entries"],
)


# ------------------------------------------------
# 工具函数：生成摘要 summary（取前 200 字）
# ------------------------------------------------
def generate_summary(content: str) -> str:
    return content[:200].strip()


# ------------------------------------------------
# POST /entries —— 创建日记
# ✅ 情绪 & 强度由 AI 自动写入，不再从前端传
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
        created_at=datetime.utcnow(),
        # 这里一开始都设为 None，后面 AI 会更新
        emotion=None,
        emotion_intensity=None,
        deleted=False,
    )

    db.add(new_entry)
    db.flush()  # 先拿到 new_entry.id，但还没提交事务

    # 如果需要 AI 回复，调用 service 生成一条 AIReply（会顺便写入 emotion / intensity）
    if entry.need_ai_reply:
        generate_ai_reply_for_entry(
            db=db,
            entry_id=new_entry.id,
            current_user=current_user,
            force_regenerate=False,
        )

    db.commit()
    db.refresh(new_entry)

    # 直接让 Pydantic 从 ORM 对象读取属性（包含 pleasure 属性和 ai_reply 关系）
    return EntryOut.model_validate(new_entry, from_attributes=True)


# ------------------------------------------------
# GET /entries —— 获取日记列表（summary）
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

    # 按年月或日期筛选
    if date:
        try:
            if len(date) == 7:  # YYYY-MM
                year, month = date.split("-")
                start = datetime(int(year), int(month), 1)
                month_int = int(month)

                if month_int == 12:
                    end = datetime(int(year) + 1, 1, 1)
                else:
                    end = datetime(int(year), month_int + 1, 1)
            else:  # YYYY-MM-DD
                start = datetime.fromisoformat(date)
                end = start.replace(hour=23, minute=59, second=59)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid date format")

        query = query.filter(
            JournalEntry.created_at >= start,
            JournalEntry.created_at < end,
        )

    # 时间区间
    if from_date and to_date:
        try:
            start = datetime.fromisoformat(from_date)
            end = datetime.fromisoformat(to_date)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid date range")

        query = query.filter(
            JournalEntry.created_at >= start,
            JournalEntry.created_at <= end,
        )

    entries = query.order_by(JournalEntry.created_at.desc()).all()

    return [EntrySummary.model_validate(e, from_attributes=True) for e in entries]


# ------------------------------------------------
# GET /entries/{id} —— 获取详情（带 pleasure + ai_reply）
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
# POST /entries/{id}/ai_reply —— 生成 / 重新生成 AI 回复
# ------------------------------------------------
@router.post("/{entry_id}/ai_reply", response_model=AIReplyOut)
def create_ai_reply_for_entry_endpoint(
    entry_id: int,
    force_regenerate: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    对指定的日记生成一条 AI 回复。

    - 默认：如果已经存在 AIReply，就直接返回旧的
    - force_regenerate=True：会删除旧记录，重新调用 LLM 生成
    - 同时会刷新该日记的 emotion / emotion_intensity
    """
    ai_reply = generate_ai_reply_for_entry(
        db=db,
        entry_id=entry_id,
        current_user=current_user,
        force_regenerate=force_regenerate,
    )

    # 这里不再额外 db.commit()，service 里已经 commit & refresh 过了
    return AIReplyOut.model_validate(ai_reply, from_attributes=True)


# ------------------------------------------------
# DELETE /entries/{id} —— 软删除
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
