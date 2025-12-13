# backend/services/ai_reply_service.py

from typing import Optional, Dict, Any, Tuple
import json
import re

from fastapi import HTTPException
from sqlalchemy.orm import Session

from models import JournalEntry, User, AICompanion, AIReply
from core.ai_client import call_siliconflow


# 固定六种情绪
VALID_EMOTIONS = {"joy", "calm", "tired", "anxiety", "sadness", "anger"}

# 固定四类主题（MVP）
VALID_THEMES = {"job", "hobbies", "social", "other"}
THEME_KEYS_ORDER = ["job", "hobbies", "social", "other"]


def build_prompt_for_entry(entry: JournalEntry, companion: AICompanion) -> str:
    """
    把日记内容 + AI 伴侣的人设，拼成一次调用 LLM 的 prompt。
    一次调用返回：reply + emotion + intensity + theme_scores + primary_theme（JSON）

    theme 规则：
    - theme_scores 必须包含 job/hobbies/social/other 四类的比例（0~1）
    - 比例总和应接近 1（后端会再归一化）
    - primary_theme 可选；若不给，后端用最大比例的主题推导
    """

    persona = companion.persona_prompt or (
        f"You are {companion.name}, a journaling companion. "
        "You respond in a warm, non-judgmental way. "
        "You do not diagnose or give medical advice. "
        "If things sound very serious, gently encourage the user to seek professional help in real life."
    )

    user_label_part = ""

    prompt = f"""{persona}

You are helping a user with their private journal entry.{user_label_part}

Your task is to:
1) Write an empathetic reply directly to the user.
2) Estimate their emotional state using a fixed label set and intensity.
3) Classify the journal into FOUR high-level life themes and provide a distribution.

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

Theme classification (IMPORTANT):
- Provide theme_scores as a JSON object with exactly these keys:
  "job", "hobbies", "social", "other"
- Each value should be a number between 0 and 1.
- The sum should be approximately 1.0.
- If unsure, put more weight into "other".
- Optionally provide primary_theme as one of: "job" | "hobbies" | "social" | "other".

OUTPUT FORMAT (VERY IMPORTANT):
Return ONLY a single JSON object, in this exact structure, with no extra commentary:

{{
  "reply": "your reply to the user here",
  "emotion": "joy | calm | tired | anxiety | sadness | anger | null",
  "intensity": 1,
  "theme_scores": {{
    "job": 0.0,
    "hobbies": 0.0,
    "social": 0.0,
    "other": 1.0
  }},
  "primary_theme": "job | hobbies | social | other | null"
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
    失败就把全部文本当成 reply，用空 emotion/intensity/theme。
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
        "theme_scores": None,
        "primary_theme": None,
    }


def _coerce_float(x: Any) -> Optional[float]:
    try:
        if x is None:
            return None
        if isinstance(x, (int, float)):
            return float(x)
        if isinstance(x, str):
            s = x.strip()
            return float(s)
    except Exception:
        return None
    return None


def _clean_and_normalize_theme_scores(raw_scores: Any) -> Tuple[Optional[Dict[str, float]], Optional[str]]:
    """
    接受 LLM 的 raw theme_scores，输出：
    - 归一化后的 theme_scores（四个 key 都在，sum=1）
    - primary_theme（最大值对应 key）
    """
    if not isinstance(raw_scores, dict):
        return None, None

    scores: Dict[str, float] = {}
    for k in THEME_KEYS_ORDER:
        v = _coerce_float(raw_scores.get(k))
        if v is None or v < 0:
            v = 0.0
        scores[k] = float(v)

    total = sum(scores.values())
    if total <= 0:
        # 全 0 则认为 unknown -> other=1
        scores = {"job": 0.0, "hobbies": 0.0, "social": 0.0, "other": 1.0}
        return scores, "other"

    # 归一化
    for k in scores:
        scores[k] = round(scores[k] / total, 6)

    # 归一化后可能因 round 误差不等于 1，这里做一次修正，把差额补到 other
    total2 = sum(scores.values())
    diff = round(1.0 - total2, 6)
    if abs(diff) > 0:
        scores["other"] = round(scores["other"] + diff, 6)
        if scores["other"] < 0:
            scores["other"] = 0.0

    primary = max(scores, key=lambda kk: scores[kk])
    return scores, primary


def call_llm_for_reply_emotion_and_theme(prompt: str) -> Dict[str, Any]:
    """
    返回：
    - reply: str
    - emotion: str|None
    - intensity: int|None
    - theme_scores: dict|None
    - primary_theme: str|None
    """
    try:
        raw = call_siliconflow(prompt)
    except Exception as e:
        raise HTTPException(status_code=502, detail="AI service unavailable.") from e

    data = _extract_json(raw)

    # reply
    reply = (data.get("reply") or "").strip()
    if not reply:
        reply = raw.strip()

    # emotion
    emotion = data.get("emotion")
    if isinstance(emotion, str):
        emotion = emotion.strip().lower()
        if emotion not in VALID_EMOTIONS:
            emotion = None
    else:
        emotion = None

    # intensity
    intensity = data.get("intensity")
    int_val: Optional[int] = None
    if isinstance(intensity, int):
        int_val = intensity
    elif isinstance(intensity, str) and intensity.isdigit():
        int_val = int(intensity)
    if int_val not in (1, 2, 3):
        int_val = None

    # theme
    raw_scores = data.get("theme_scores")
    theme_scores, inferred_primary = _clean_and_normalize_theme_scores(raw_scores)

    primary_theme = data.get("primary_theme")
    if isinstance(primary_theme, str):
        primary_theme = primary_theme.strip().lower()
        if primary_theme not in VALID_THEMES:
            primary_theme = None
    else:
        primary_theme = None

    if not primary_theme:
        primary_theme = inferred_primary

    return {
        "reply": reply,
        "emotion": emotion,
        "intensity": int_val,
        "theme_scores": theme_scores,
        "primary_theme": primary_theme,
    }


def generate_ai_reply_for_entry(
    db: Session,
    entry_id: int,
    current_user: User,
    force_regenerate: bool = False,
) -> AIReply:
    """
    给某一篇日记生成（或获取已有的）AI 回复 + 情绪分析 + 主题分析。

    - 确保这篇日记属于当前用户
    - 默认：如果已经有 ai_reply，就直接返回旧的（不重复生成）
    - force_regenerate=True 时，会删除旧的、重新生成一条
    - emotion / intensity / theme_* 视为纯 AI 字段：每次生成时用最新结果覆盖旧值
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

    # 4. 拼 prompt + 调 LLM（一次拿 reply + emotion + intensity + theme）
    prompt = build_prompt_for_entry(entry, companion)
    result = call_llm_for_reply_emotion_and_theme(prompt)

    reply_text: str = result["reply"]
    auto_emotion: Optional[str] = result["emotion"]
    auto_intensity: Optional[int] = result["intensity"]
    theme_scores: Optional[Dict[str, float]] = result["theme_scores"]
    primary_theme: Optional[str] = result["primary_theme"]

    # 5. 回写情绪标签（如果这次是 None 就保持原值）
    if auto_emotion:
        entry.emotion = auto_emotion
    if auto_intensity:
        entry.emotion_intensity = auto_intensity

    # 6. 回写主题（建议始终覆盖旧的主题分布；若本次没拿到就不改）
    # 说明：这两列必须存在于 JournalEntry model 和数据库表中
    if theme_scores:
        entry.theme_scores = theme_scores
    if primary_theme:
        entry.primary_theme = primary_theme

    # 7. 如果之前已经有 AIReply，删掉旧的，保持一篇日记最多一条
    if entry.ai_reply:
        db.delete(entry.ai_reply)
        db.flush()

    # 8. 创建新的 AIReply 记录
    ai_reply = AIReply(
        entry_id=entry.id,
        user_id=current_user.id,
        companion_id=companion.id,
        reply_type="empathetic_reply_with_emotion",
        content=reply_text,
        # 建议填真实模型名；这里先用你们当前调用的模型（如果你想）
        model_name="Qwen/Qwen2.5-7B-Instruct",
    )
    db.add(ai_reply)

    # 9. 提交变更（entry 的情绪/主题 + 新的 AIReply）
    db.commit()
    db.refresh(ai_reply)

    return ai_reply
