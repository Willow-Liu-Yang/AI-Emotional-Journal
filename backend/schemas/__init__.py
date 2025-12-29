# schemas/__init__.py

# -------------------------------
# User-related
# -------------------------------
from .user import (
    UserCreate,
    UserLogin,
    UserOut,
    UserMe,
    UsernameUpdate,
)

# -------------------------------
# Journal and AI reply related
# -------------------------------
from .entry import (
    EntryCreate,
    EntryOut,
    EntrySummary,
    AIReplyOut,      # New: AI reply output
)

# -------------------------------
# AI Companion (persona)
# -------------------------------
from .companion import (
    AICompanionSummary,
    CompanionSelect,
    CompanionOut,
    AICompanionBase,
    AICompanionCreate,   # New: for custom creation
    AICompanionUpdate,   # New: for custom update
)

# -------------------------------
# Comment-related
# -------------------------------
from .comment import (
    CommentCreate,
    CommentOut,
)

# -------------------------------
# Time capsule
# -------------------------------
from .time_capsule import (
    TimeCapsuleOut,
)

# -------------------------------
# Authentication (if auth.py exists)
# -------------------------------
try:
    from .auth import Token, TokenData
except ImportError:
    pass
