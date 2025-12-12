# backend/services/ai_summary_service.py

from typing import Optional, Dict, Any
from core.ai_client import call_siliconflow


def build_summary_prompt(companion: Optional[Dict[str, Any]], emotion_trend, top_emotions):
    """
    companion: dict-like object (may contain 'name' and 'persona_prompt')
    emotion_trend: list of {date, valence}
    top_emotions: dict {emotion: count}
    """

    comp_name = companion.get("name", "Your companion") if companion else "Your companion"
    persona = companion.get("persona_prompt") if (companion and companion.get("persona_prompt")) else ""

    # 默认 persona（增强 DeepSeek-Qwen 生成风格）
    if not persona:
        persona = (
            f"You are {comp_name}, a warm, supportive emotional journaling companion. "
            "You speak gently, with emotional sensitivity, never clinical. "
            "Your tone is encouraging, calming and empathetic."
        )

    prompt = f"""
{persona}

Your task:
Write a short supportive message for the user based on their recent emotional patterns.

Guidelines:
- 2–4 sentences only.
- Warm, encouraging, human-like tone.
- Reference the emotions or patterns implied by the data.
- Avoid generic statements like “everything will be fine.”
- No markdown. No JSON. Return plain text only.

Emotional data:
Valence trend: {emotion_trend}
Emotion counts: {top_emotions}

Now write the message:
"""

    return prompt


def generate_summary_message(companion: Optional[Dict[str, Any]], emotion_trend, top_emotions) -> str:
    prompt = build_summary_prompt(companion, emotion_trend, top_emotions)
    raw = call_siliconflow(prompt)
    return raw.strip()
