from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from core.auth import get_current_user
from schemas import TimeCapsuleOut
from services.time_capsule_service import get_time_capsule


router = APIRouter(prefix="/time-capsule", tags=["Time Capsule"])


@router.get("/", response_model=TimeCapsuleOut)
def get_time_capsule_endpoint(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_time_capsule(db, current_user)
