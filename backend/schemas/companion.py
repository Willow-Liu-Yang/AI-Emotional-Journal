# backend/schemas/companion.py

from pydantic import BaseModel
from typing import List, Optional


# --------------- Base structure: full model fields (detail/Profile) ---------------
class AICompanionBase(BaseModel):
    id: int
    name: str
    key: str
    identity_title: str
    description: str
    tags: List[str]
    avatar_key: Optional[str] = None
    theme_color: Optional[str] = None
    order_index: Optional[int] = None

    # New: persona and behavior settings for LLM
    persona_prompt: Optional[str] = None           # Full persona description
    reply_length_hint: str = "medium"              # short / medium / long
    allow_suggestions: bool = True                 # Whether to lean toward advice
    is_active: bool = True                         # Enabled flag (for unlisting)

    class Config:
        from_attributes = True


# --------------- For list display (lighter) ---------------
class AICompanionSummary(BaseModel):
    id: int
    name: str
    identity_title: str
    tags: List[str]
    avatar_key: Optional[str] = None
    theme_color: Optional[str] = None
    order_index: Optional[int] = None

    class Config:
        from_attributes = True


# --------------- Used when user selects a companion ---------------
class CompanionSelect(BaseModel):
    companion_id: int


# --------------- Returned in UserOut for companion info ---------------
class CompanionOut(AICompanionBase):
    pass


# --------------- Create custom AI companion (POST /companions/custom) ---------------
class AICompanionCreate(BaseModel):
    # Optional key; backend can auto-generate from name when omitted
    name: str
    key: Optional[str] = None

    identity_title: str
    description: str
    tags: List[str]

    avatar_key: Optional[str] = None
    theme_color: Optional[str] = None

    persona_prompt: Optional[str] = None
    reply_length_hint: str = "medium"
    allow_suggestions: bool = True
    is_active: bool = True


# --------------- Update custom AI companion (PATCH /companions/{id}) ---------------
class AICompanionUpdate(BaseModel):
    # All optional; update only what is provided
    name: Optional[str] = None
    identity_title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None

    avatar_key: Optional[str] = None
    theme_color: Optional[str] = None

    persona_prompt: Optional[str] = None
    reply_length_hint: Optional[str] = None
    allow_suggestions: Optional[bool] = None
    is_active: Optional[bool] = None
