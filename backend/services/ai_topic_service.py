# backend/services/ai_topic_service.py

import json
from core.ai_client import generate_text_with_gemini


THEME_LABELS = [
    "work", "relationships", "school", "self-care",
    "health", "hobbies", "social", "emotion",
    "stress", "motivation", "productivity"
]


def build_theme_prompt(content: str) -> str:
    return f"""
You are an assistant that analyzes personal journal entries.

Your task is to identify the main themes present in the user's journal entry.
Choose 2–6 themes from the following list:

{THEME_LABELS}

Rules:
- Only output themes meaningfully present in the text.
- Assign each theme a weight between 0 and 1.
- The weights MUST sum to 1.
- Return ONLY JSON.

JSON format example:
{{
  "themes": {{
    "work": 0.4,
    "social": 0.3,
    "hobbies": 0.3
  }}
}}

Journal Entry:
\"\"\"{content}\"\"\"
"""


def extract_themes(content: str) -> dict:
    prompt = build_theme_prompt(content)
    raw = generate_text_with_gemini(prompt).strip()

    # 强化 JSON 提取防止 LLM 污染
    try:
        data = json.loads(raw)
        return data.get("themes", {})
    except:
        return {}
