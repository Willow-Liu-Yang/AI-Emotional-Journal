# schemas/__init__.py

# 用户相关
from .user import (
    UserCreate,
    UserOut,
    UsernameUpdate,
)

# 日记相关
from .entry import (
    EntryCreate,
    EntryOut,
    EntrySummary,
    EntryUpdate,
)

# AI Companion（人设）相关
from .companion import (
    AICompanionBase,
    AICompanionSummary,
    CompanionSelect,
)

# 身份认证（如果存在 auth.py）
try:
    from .auth import Token, TokenData
except ImportError:
    pass
