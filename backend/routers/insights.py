# backend/routers/insights.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from core.auth import get_current_user

from services.insights_service import aggregate_insights

router = APIRouter(prefix="/insights", tags=["Insights"])


@router.get("/")
def get_insights(
    range: str = "week",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if range not in ("week", "month"):
        raise HTTPException(status_code=400, detail="Invalid range")

    result = aggregate_insights(db, current_user, range)
    return result
