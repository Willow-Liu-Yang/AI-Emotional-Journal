# backend/core/ai_client.py

import os
import requests
from fastapi import HTTPException

SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY")
if not SILICONFLOW_API_KEY:
    raise RuntimeError("SILICONFLOW_API_KEY is missing in environment!")

API_URL = "https://api.siliconflow.cn/v1/chat/completions"
MODEL_NAME = "Qwen/Qwen2.5-7B-Instruct"   # ← 新模型名


def call_siliconflow(prompt: str) -> str:
    """
    通用 LLM 调用函数，统一使用 Qwen2.5-7B-Instruct。
    """

    headers = {
        "Authorization": f"Bearer {SILICONFLOW_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "You are a helpful AI assistant."},
            {"role": "user", "content": prompt},
        ],
        # Qwen 最佳温度 0.6（风格柔和、稳定）
        "temperature": 0.6,
    }

    try:
        resp = requests.post(API_URL, json=payload, headers=headers, timeout=60)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"SiliconFlow unreachable: {e}")

    if resp.status_code != 200:
        raise RuntimeError(f"SiliconFlow API error {resp.status_code}: {resp.text}")

    data = resp.json()
    try:
        return data["choices"][0]["message"]["content"].strip()
    except:
        return ""
