# schemas/__init__.py

# -------------------------------
# 用户相关
# -------------------------------
from .user import (
    UserCreate,
    UserLogin,
    UserOut,
    UserMe,
    UsernameUpdate,
)

# -------------------------------
# 日记 & AI 回复相关
# -------------------------------
from .entry import (
    EntryCreate,
    EntryOut,
    EntrySummary,
    AIReplyOut,      # ✅ 新增：AI 回复输出
)

# -------------------------------
# AI Companion（人设）
# -------------------------------
from .companion import (
    AICompanionSummary,
    CompanionSelect,
    CompanionOut,
    AICompanionBase,
    AICompanionCreate,   # ✅ 新增：自定义创建用
    AICompanionUpdate,   # ✅ 新增：自定义更新用
)

# -------------------------------
# 评论相关
# -------------------------------
from .comment import (
    CommentCreate,
    CommentOut,
)

# -------------------------------
# 身份认证（如果存在 auth.py）
# -------------------------------
try:
    from .auth import Token, TokenData
except ImportError:
    pass
