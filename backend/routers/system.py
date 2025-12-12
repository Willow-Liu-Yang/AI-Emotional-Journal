# backend/routers/system.py

from fastapi import APIRouter
from datetime import datetime
from sqlalchemy import text
from database import engine
from dotenv import load_dotenv
import os
import requests

load_dotenv()

router = APIRouter(prefix="", tags=["System"])


@router.get("/health")
def health_check():
    """
    系统健康检查接口：
    检查数据库、DeepSeek API 等状态
    """

    # -------------------------------
    # Check Database
    # -------------------------------
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {type(e).__name__}"

    # -------------------------------
    # Check DeepSeek API
    # -------------------------------
    deepseek_key = os.getenv("DEEPSEEK_API_KEY")
    ai_status = "not_configured"

    if deepseek_key:
        try:
            resp = requests.get("https://api.deepseek.com", timeout=3)

            if resp.status_code in (200, 404):
                # 404 也代表服务可访问（因为根路径没有资源）
                ai_status = "available"
            else:
                ai_status = f"unreachable ({resp.status_code})"
        except Exception as e:
            ai_status = f"unreachable ({type(e).__name__})"

    # -------------------------------
    # Combine result
    # -------------------------------
    return {
        "status": "ok",
        "version": "1.0.0",
        "server_time": datetime.utcnow().isoformat(),
        "database": db_status,
        "ai_service": ai_status,
    }
