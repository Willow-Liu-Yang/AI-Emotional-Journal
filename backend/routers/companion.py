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
# 1. List all AI personas
# -----------------------
@router.get("/", response_model=list[AICompanionSummary])
def list_companions(db: Session = Depends(get_db)):
    companions = db.query(AICompanion).order_by(AICompanion.order_index).all()
    return companions


# -----------------------
# 2. Get a single AI persona
# -----------------------
@router.get("/{companion_id}", response_model=AICompanionBase)
def get_companion(companion_id: int, db: Session = Depends(get_db)):
    companion = db.query(AICompanion).filter(AICompanion.id == companion_id).first()
    if not companion:
        raise HTTPException(status_code=404, detail="Companion not found")
    return companion


# -----------------------
# 3. User selects AI persona
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

    # Update the user-bound persona
    current_user.companion_id = data.companion_id
    db.commit()
    db.refresh(current_user)

    return current_user
