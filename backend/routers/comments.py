from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from core.auth import get_current_user
from models import JournalEntry, JournalComment, User
from schemas import CommentCreate, CommentOut


router = APIRouter(
    prefix="/entries/{entry_id}/comments",
    tags=["Comments"]
)


# -------------------------------
# 获取某条日记的评论列表
# -------------------------------
@router.get("/", response_model=list[CommentOut])
def list_comments(entry_id: int, 
                  db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):  # 登录用户可查看
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    comments = (
        db.query(JournalComment)
        .filter(JournalComment.entry_id == entry_id, JournalComment.deleted == False)
        .order_by(JournalComment.created_at.asc())
        .all()
    )
    return comments


# -------------------------------
# 创建评论
# -------------------------------
@router.post("/", response_model=CommentOut)
def create_comment(entry_id: int,
                   payload: CommentCreate,
                   db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):

    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    new_comment = JournalComment(
        entry_id=entry_id,
        user_id=current_user.id,
        content=payload.content
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return new_comment


# -------------------------------
# 删除评论（仅作者可删除）
# -------------------------------
@router.delete("/{comment_id}")
def delete_comment(entry_id: int,
                   comment_id: int,
                   db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):

    comment = db.query(JournalComment).filter(JournalComment.id == comment_id).first()

    if not comment or comment.deleted:
        raise HTTPException(status_code=404, detail="Comment not found")

    # 权限：只能删除自己的
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to delete this comment")

    comment.deleted = True
    db.commit()

    return {"message": "Comment deleted"}
