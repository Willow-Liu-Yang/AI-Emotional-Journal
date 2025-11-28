# schemas/__init__.py

# 用户相关
from .user import (
    UserCreate,
    UserLogin,
    UserOut,
    UserMe,
    UsernameUpdate,
)

# 日记相关
from .entry import (
    EntryCreate,
    EntryOut,
    EntrySummary,
    
)

# -------------------------------
# AI Companion（人设）
# -------------------------------
from .companion import (
    AICompanionSummary,
    CompanionSelect,
    CompanionOut,
    AICompanionBase,
)

# -------------------------------
# 评论相关
# -------------------------------
from .comment import (
    CommentCreate,
    CommentOut,
)

# 身份认证（如果存在 auth.py）
try:
    from .auth import Token, TokenData
except ImportError:
    pass
