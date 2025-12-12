# backend/services/ai_topic_service.py

import json
from core.ai_client import call_siliconflow


THEME_LABELS = [
    "work", "relationships", "school", "self-care",
    "health", "hobbies", "social", "emotion",
    "stress", "motivation", "productivity"
]


def build_theme_prompt(content: str) -> str:
    return f"""
You are an assistant that analyzes personal journal entries.

Your task is to extract the main themes present in the user's journal entry.
Choose 2–6 themes from the following predefined list:

{THEME_LABELS}

Rules:
- Only select themes that are meaningfully present.
- Assign each selected theme a weight between 0 and 1.
- The weights MUST sum to 1.
- Return ONLY valid JSON. No explanations, no markdown.

JSON output format:
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

    raw = call_siliconflow(prompt).strip()

    # Try direct JSON
    try:
        data = json.loads(raw)
        return data.get("themes", {})
    except:
        pass

    # Try extracting first {...}
    import re
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group(0))
            return data.get("themes", {})
        except:
            pass

    # Fallback
    return {}
