# backend/services/ai_summary_service.py

from typing import Optional, Dict, Any, List
from core.ai_client import call_siliconflow


def build_summary_prompt(
    companion: Optional[Dict[str, Any]],
    range_type: str,
    stats: Dict[str, Any],
    emotion_trend: List[Dict[str, Any]],
    top_emotions: Dict[str, int],
):
    """
    companion: dict-like object (may contain 'name' and 'persona_prompt')
    range_type: "week" or "month"
    stats: dict with entries/active_days
    emotion_trend: list of {date, valence}
    top_emotions: dict {emotion: count}
    """

    comp_name = companion.get("name", "Your companion") if companion else "Your companion"
    persona = companion.get("persona_prompt") if (companion and companion.get("persona_prompt")) else ""

    # Default persona (enhance DeepSeek-Qwen style)
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
- 1-2 sentences only.
- Warm, encouraging, human-like tone.
- Mention 1-2 concrete signals from the data (trend direction, top emotions, activity).
- Avoid generic statements like "everything will be fine."
- Do not use markdown. Do not use quotes. Return plain text only.
- If there is no clear trend, say the pattern feels mixed or steady.

Emotional data:
Range: {range_type}
Entries: {stats.get("entries", 0)}
Active days: {stats.get("active_days", 0)}
Valence trend: {emotion_trend}
Emotion counts: {top_emotions}

Now write the message:
"""

    return prompt


def generate_summary_message(
    companion: Optional[Dict[str, Any]],
    range_type: str,
    stats: Dict[str, Any],
    emotion_trend: List[Dict[str, Any]],
    top_emotions: Dict[str, int],
) -> str:
    prompt = build_summary_prompt(companion, range_type, stats, emotion_trend, top_emotions)
    raw = call_siliconflow(prompt)
    return raw.strip()
