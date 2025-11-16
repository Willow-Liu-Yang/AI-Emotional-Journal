from fastapi import APIRouter
from datetime import datetime
from sqlalchemy import text
from database import engine
from dotenv import load_dotenv
import os
import requests

# 加载环境变量
load_dotenv()

router = APIRouter(prefix="", tags=["System"])

@router.get("/health")
def health_check():
    """
    系统健康检查接口：
    返回后端、数据库、AI 服务等运行状态。
    """

    # ✅ 检查数据库连接状态
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {type(e).__name__}"

    # ✅ 检查外部 AI 服务（Gemini API）
    ai_status = "not_configured"
    gemini_key = os.getenv("GEMINI_API_KEY")

    if gemini_key:
        try:
            resp = requests.get(
                "https://generativelanguage.googleapis.com", timeout=3
            )
            if resp.status_code == 200:
                ai_status = "available"
            else:
                ai_status = f"unreachable ({resp.status_code})"
        except Exception as e:
            ai_status = f"unreachable ({type(e).__name__})"

    # ✅ 汇总结果
    return {
        "status": "ok",
        "version": "1.0.0",
        "server_time": datetime.utcnow().isoformat(),
        "database": db_status,
        "ai_service": ai_status,
    }
