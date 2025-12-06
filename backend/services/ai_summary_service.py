# backend/services/ai_summary_service.py

from typing import Optional, Dict, Any
from core.ai_client import generate_text_with_gemini

def build_summary_prompt(companion: Optional[Dict[str, Any]], emotion_trend, top_emotions):
    """
    companion: dict-like object (may contain 'name' and 'persona_prompt' and 'identity_title')
    emotion_trend: list/dict for recent valence
    top_emotions: dict of emotion counts
    """
    comp_name = "Your companion"
    persona = ""
    if companion:
        comp_name = companion.get("name") or comp_name
        persona = companion.get("persona_prompt") or ""
    # Provide a short persona if none
    if not persona:
        persona = (
            f"You are {comp_name}, a warm journaling companion. "
            "You write in a gentle, empathic tone and provide short supportive messages."
        )

    prompt = f"""
You are {comp_name}. {persona}

Task:
Based on the user's recent emotional patterns, write a short, gentle and supportive message in the voice of {comp_name}.
Keep it 2–4 sentences, warm and encouraging. Avoid generic platitudes and be specific to the emotions provided.

Emotional data:
- Valence trend: {emotion_trend}
- Top feelings: {top_emotions}

Return ONLY plain text (no JSON, no extra commentary).
"""
    return prompt


def generate_summary_message(companion: Optional[Dict[str, Any]], emotion_trend, top_emotions) -> str:
    prompt = build_summary_prompt(companion, emotion_trend, top_emotions)
    raw = generate_text_with_gemini(prompt)
    return raw.strip()
