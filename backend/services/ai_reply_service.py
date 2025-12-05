# backend/services/ai_reply_service.py

from typing import Optional, Dict, Any
import json
import re

from fastapi import HTTPException
from sqlalchemy.orm import Session

from models import JournalEntry, User, AICompanion, AIReply
from core.ai_client import generate_text_with_gemini


# 固定六种情绪
VALID_EMOTIONS = {"joy", "calm", "tired", "anxiety", "sadness", "anger"}


def build_prompt_for_entry(entry: JournalEntry, companion: AICompanion) -> str:
    """
    把日记内容 + AI 伴侣的人设，拼成一次调用 LLM 的 prompt。
    注意：
    - 一次调用返回：reply + emotion + intensity（JSON）
    - 控制不要复读用户原文
    - 根据日记长短控制回复长度
    """

    persona = companion.persona_prompt or (
        f"You are {companion.name}, a journaling companion. "
        "You respond in a warm, non-judgmental way. "
        "You do not diagnose or give medical advice. "
        "If things sound very serious, gently encourage the user to seek professional help in real life."
    )

    # 如果以后你想支持“用户自己选情绪”，可以在这里补充提示；
    # 目前我们没有用户输入的情绪，就先不加 user_label_part。
    user_label_part = ""

    prompt = f"""{persona}

You are helping a user with their private journal entry.{user_label_part}

Your task is to:
1) Write an empathetic reply directly to the user.
2) Estimate their emotional state using a fixed label set and intensity.

Rules for the REPLY:
- Acknowledge and validate feelings.
- Do NOT copy long sentences or lists from the journal.
- You may briefly paraphrase one key phrase, but do not repeat the same negative wording many times.
- Focus on adding something new and supportive, instead of repeating what the user already wrote.
- Avoid diagnosis, disorders, or medication advice.
- If the situation seems very serious or risky, gently suggest reaching out to real-world support.

Reply length rules:
- If the journal is very short (1–2 sentences), reply in 1–3 short sentences.
- If the journal is medium length, reply in about 3–6 sentences.
- If the journal is very long, reply in one medium paragraph (not multiple long paragraphs).

Emotion classification:
- emotion must be ONE of: "joy", "calm", "tired", "anxiety", "sadness", "anger".
- intensity must be an integer: 1 = low, 2 = medium, 3 = high.
- If you truly cannot decide the emotion, set emotion to null.

OUTPUT FORMAT (VERY IMPORTANT):
Return ONLY a single JSON object, in this exact structure, with no extra commentary:

{{
  "reply": "your reply to the user here",
  "emotion": "joy | calm | tired | anxiety | sadness | anger | null",
  "intensity": 1
}}

Do not write any other text outside this JSON.

The user's journal entry is:

\"\"\"{entry.content}\"\"\""""

    return prompt


def _extract_json(text: str) -> Dict[str, Any]:
    """
    尝试从 LLM 返回中提取 JSON：
    1) 直接整个 text 当 JSON
    2) ```json ... ``` 代码块
    3) 第一个 {...} 包裹内容
    失败就把全部文本当成 reply，用空 emotion/intensity。
    """
    text = text.strip()

    # 1. 直接 parse
    try:
        return json.loads(text)
    except Exception:
        pass

    # 2. ```json ... ``` 块
    m = re.search(r"```json(.*?)```", text, re.DOTALL | re.IGNORECASE)
    if m:
        inner = m.group(1).strip()
        try:
            return json.loads(inner)
        except Exception:
            pass

    # 3. 第一个大括号
    m2 = re.search(r"\{.*\}", text, re.DOTALL)
    if m2:
        candidate = m2.group(0)
        try:
            return json.loads(candidate)
        except Exception:
            pass

    # 完全失败：退化为只有 reply
    return {
        "reply": text,
        "emotion": None,
        "intensity": None,
    }


def call_llm_for_reply_and_emotion(prompt: str) -> Dict[str, Any]:
    """
    调用 Gemini，一次拿到：
    - reply: 字符串
    - emotion: 六选一 or null
    - intensity: 1/2/3 or null
    """
    try:
        raw = generate_text_with_gemini(prompt)
    except Exception as e:
        # 兜底，避免把底层错误直接抛给前端
        raise HTTPException(status_code=502, detail="AI service unavailable.") from e

    data = _extract_json(raw)

    # 做一点兜底清洗
    reply = (data.get("reply") or "").strip()
    if not reply:
        # 如果 JSON 里没有 reply，就把原始结果当成 reply
        reply = raw.strip()

    emotion = data.get("emotion")
    intensity = data.get("intensity")

    # 统一 emotion
    if isinstance(emotion, str):
        emotion = emotion.strip().lower()
        if emotion not in VALID_EMOTIONS:
            emotion = None
    else:
        emotion = None

    # 统一 intensity
    int_val: Optional[int] = None
    if isinstance(intensity, int):
        int_val = intensity
    elif isinstance(intensity, str) and intensity.isdigit():
        int_val = int(intensity)

    if int_val not in (1, 2, 3):
        int_val = None

    return {
        "reply": reply,
        "emotion": emotion,
        "intensity": int_val,
    }


def generate_ai_reply_for_entry(
    db: Session,
    entry_id: int,
    current_user: User,
    force_regenerate: bool = False,
) -> AIReply:
    """
    给某一篇日记生成（或获取已有的）AI 回复 + 情绪分析。

    - 确保这篇日记属于当前用户
    - 默认：如果已经有 ai_reply，就直接返回旧的（不重复生成）
    - force_regenerate=True 时，会删除旧的、重新生成一条
    - emotion / intensity 视为纯 AI 字段：每次生成时用最新结果覆盖旧值
    """

    # 1. 找到这篇日记，必须是当前用户自己的
    entry: Optional[JournalEntry] = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == current_user.id,
            JournalEntry.deleted == False,
        )
        .first()
    )

    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    # 2. 如果已经有一条回复，而且不强制重生，直接返回
    if entry.ai_reply and not force_regenerate:
        return entry.ai_reply

    # 3. 获取当前用户选择的 AI 伴侣；没有就 fallback 到 Luna(id=1)
    companion: Optional[AICompanion] = current_user.companion
    if not companion:
        companion = (
            db.query(AICompanion)
            .filter(
                AICompanion.id == 1,
                AICompanion.is_active == True,
            )
            .first()
        )
        if not companion:
            raise HTTPException(
                status_code=500,
                detail="Default AI companion not configured.",
            )

    # 4. 拼 prompt + 调 LLM（一次拿 reply + emotion + intensity）
    prompt = build_prompt_for_entry(entry, companion)
    result = call_llm_for_reply_and_emotion(prompt)

    reply_text: str = result["reply"]
    auto_emotion: Optional[str] = result["emotion"]
    auto_intensity: Optional[int] = result["intensity"]

    # 5. 用 AI 的结果回写情绪标签（始终覆盖旧的自动值；如果这次是 None 就保持原值）
    if auto_emotion:
        entry.emotion = auto_emotion

    if auto_intensity:
        entry.emotion_intensity = auto_intensity

    # 6. 如果之前已经有 AIReply，删掉旧的，保持一篇日记最多一条
    if entry.ai_reply:
        db.delete(entry.ai_reply)
        db.flush()

    # 7. 创建新的 AIReply 记录
    ai_reply = AIReply(
        entry_id=entry.id,
        user_id=current_user.id,
        companion_id=companion.id,
        reply_type="empathetic_reply_with_emotion",
        content=reply_text,
        model_name="gemini-structured-v1",  # 你可以换成真实模型名
    )
    db.add(ai_reply)

    # 8. 提交变更（entry 的情绪 + 新的 AIReply）
    db.commit()
    db.refresh(ai_reply)

    return ai_reply
