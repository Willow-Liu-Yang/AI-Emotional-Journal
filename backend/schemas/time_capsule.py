from datetime import date
from typing import Optional, Literal

from pydantic import BaseModel


class TimeCapsuleOut(BaseModel):
    found: bool
    source_date: Optional[date] = None
    source_level: Optional[Literal["year", "month", "week"]] = None
    quote: Optional[str] = None
    entry_id: Optional[int] = None

    class Config:
        from_attributes = True
