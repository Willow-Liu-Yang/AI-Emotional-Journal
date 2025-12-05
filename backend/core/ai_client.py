# core/ai_client.py

import os
from google import genai

# 1. 从环境变量里拿 key（支持两种名字）
_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

if not _API_KEY:
    # 如果这里触发，说明容器里没传进来 key —— 但你刚才已经验证是有的，所以正常不会走到这里
    raise RuntimeError(
        "GEMINI_API_KEY / GOOGLE_API_KEY is not set in environment. "
        "Please configure it in your .env / docker-compose."
    )

# 2. ✅ 显式传 api_key，避免“Missing key inputs argument”
client = genai.Client(api_key=_API_KEY)


def generate_text_with_gemini(prompt: str, model: str = "gemini-2.5-flash") -> str:
    """
    调用 Gemini，返回一段纯文本。
    """
    response = client.models.generate_content(
        model=model,
        contents=prompt,
    )

    text = getattr(response, "text", None)
    if not text:
        # 如果需要调试，可以在这里打印 response
        raise RuntimeError("Empty response from Gemini")

    return text.strip()
