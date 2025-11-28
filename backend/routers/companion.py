from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import AICompanion
from models import User
from schemas import AICompanionBase, AICompanionSummary, CompanionSelect
from schemas import UserOut
from core.auth import get_current_user

router = APIRouter(
    prefix="/companions",
    tags=["AI Companions"]
)


# -----------------------
# 1. 列出所有 AI 人设
# -----------------------
@router.get("/", response_model=list[AICompanionSummary])
def list_companions(db: Session = Depends(get_db)):
    companions = db.query(AICompanion).order_by(AICompanion.order_index).all()
    return companions


# -----------------------
# 2. 获取单个 AI 人设
# -----------------------
@router.get("/{companion_id}", response_model=AICompanionBase)
def get_companion(companion_id: int, db: Session = Depends(get_db)):
    companion = db.query(AICompanion).filter(AICompanion.id == companion_id).first()
    if not companion:
        raise HTTPException(status_code=404, detail="Companion not found")
    return companion


# -----------------------
# 3. 用户选择 AI 人设
# -----------------------
@router.post("/select", response_model=UserOut)
def select_companion(
    data: CompanionSelect,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    companion = db.query(AICompanion).filter(AICompanion.id == data.companion_id).first()
    if not companion:
        raise HTTPException(status_code=404, detail="Companion not found")

    # 更新用户绑定的人设
    current_user.companion_id = data.companion_id
    db.commit()
    db.refresh(current_user)

    return current_user
