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
# 工具函数：生成摘要 summary（取前 200 字）
# ------------------------------------------------
def generate_summary(content: str) -> str:
    return content[:200].strip()


def _parse_date_ymd_to_utc_start(date_str: str) -> datetime:
    """
    解析 YYYY-MM-DD，返回 UTC 的当天起始时间（00:00:00Z）。
    """
    try:
        d = datetime.fromisoformat(date_str).date()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format")
    return datetime(d.year, d.month, d.day, tzinfo=timezone.utc)


def _parse_month_ym_to_utc_range(month_str: str) -> tuple[datetime, datetime]:
    """
    解析 YYYY-MM，返回该月的 [start, end)（UTC）。
    """
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
# POST /entries —— 创建日记
# 规则：
# - 无论 need_ai_reply 是否为 True，都要生成分析字段（emotion/theme 写入 DB）
# - 只有 need_ai_reply=True 才会创建 AIReply
# - created_at 由 DB server_default 统一写入（UTC + tz-aware）
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
    db.flush()  # 先拿到 new_entry.id（同一个 Session 内可被后续 service 查询到）

    try:
        # ✅ 不选 AI 回复也要做分析；选了则生成回复 + 分析
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

        # ✅ 统一在这里 commit：无论 service 内部是否 commit，这里再 commit 一次都安全
        db.commit()

    except Exception:
        db.rollback()
        raise

    db.refresh(new_entry)
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

    # ----------------------------
    # 按年月或日期筛选
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
    # 时间区间筛选（UTC-aware，使用半开区间）
    # 约定：
    # - from_date: YYYY-MM-DD（包含当天）
    # - to_date:   YYYY-MM-DD（包含当天）
    # 即筛选 [from_date 00:00Z, to_date+1day 00:00Z)
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
    ai_reply = generate_ai_reply_for_entry(
        db=db,
        entry_id=entry_id,
        current_user=current_user,
        force_regenerate=force_regenerate,
    )

    # 这里也统一 commit 一次，避免 service 是否 commit 的不确定性
    db.commit()
    db.refresh(ai_reply)

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
