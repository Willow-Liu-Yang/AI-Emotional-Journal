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

# 固定四类主题（MVP）— ✅ work/hobbies/social/other
VALID_THEMES = {"work", "hobbies", "social", "other"}
THEME_KEYS_ORDER = ["work", "hobbies", "social", "other"]


def _get_companion_or_default(db: Session, current_user: User) -> AICompanion:
    """
    获取用户选择的 AI 伴侣；没有就 fallback 到默认伴侣 (id=1, is_active=True)。
    """
    companion: Optional[AICompanion] = getattr(current_user, "companion", None)
    if companion:
        return companion

    default_companion = (
        db.query(AICompanion)
        .filter(AICompanion.id == 1, AICompanion.is_active == True)
        .first()
    )
    if not default_companion:
        raise HTTPException(status_code=500, detail="Default AI companion not configured.")
    return default_companion


def build_prompt_for_entry(entry: JournalEntry, companion: AICompanion, analysis_only: bool) -> str:
    """
    把日记内容 + AI 伴侣的人设，拼成一次调用 LLM 的 prompt。

    - analysis_only=True: 只做分析（emotion/intensity/theme），reply 必须输出空字符串
    - analysis_only=False: 生成回复 + 分析（reply + emotion + intensity + theme）

    输出统一为一个 JSON，字段结构固定，便于解析与写库。
    """

    persona = companion.persona_prompt or (
        f"You are {companion.name}, a journaling companion. "
        "You respond in a warm, non-judgmental way. "
        "You do not diagnose or give medical advice. "
        "If things sound very serious, gently encourage the user to seek professional help in real life."
    )

    mode_text = (
        "You will ONLY analyze the entry. You MUST set reply to an empty string."
        if analysis_only
        else "You will write an empathetic reply AND analyze the entry."
    )

    prompt = f"""{persona}

You are helping a user with their private journal entry.

MODE:
{mode_text}

Your tasks:
1) (If not analysis-only) Write an empathetic reply directly to the user.
2) Estimate their emotional state using a fixed label set and intensity.
3) Classify the journal into FOUR high-level life themes and provide a distribution.

Rules for the REPLY (only when reply is required):
- Acknowledge and validate feelings.
- Do NOT copy long sentences or lists from the journal.
- You may briefly paraphrase one key phrase, but do not repeat the same negative wording many times.
- Focus on adding something new and supportive, instead of repeating what the user already wrote.
- Avoid diagnosis, disorders, or medication advice.
- If the situation seems very serious or risky, gently suggest reaching out to real-world support.

Reply length rules (only when reply is required):
- If the journal is very short (1–2 sentences), reply in 1–3 short sentences.
- If the journal is medium length, reply in about 3–6 sentences.
- If the journal is very long, reply in one medium paragraph (not multiple long paragraphs).

Emotion classification:
- emotion must be ONE of: "joy", "calm", "tired", "anxiety", "sadness", "anger".
- intensity must be an integer: 1 = low, 2 = medium, 3 = high.
- If you truly cannot decide the emotion, set emotion to null.

Theme classification (IMPORTANT):
- Provide theme_scores as a JSON object with exactly these keys:
  "work", "hobbies", "social", "other"
- Each value should be a number between 0 and 1.
- The sum should be approximately 1.0.
- If unsure, put more weight into "other".
- Optionally provide primary_theme as one of: "work" | "hobbies" | "social" | "other".

OUTPUT FORMAT (VERY IMPORTANT):
Return ONLY a single JSON object, in this exact structure, with no extra commentary:

{{
  "reply": "your reply to the user here (or empty string if analysis-only)",
  "emotion": "joy | calm | tired | anxiety | sadness | anger | null",
  "intensity": 1,
  "theme_scores": {{
    "work": 0.0,
    "hobbies": 0.0,
    "social": 0.0,
    "other": 1.0
  }},
  "primary_theme": "work | hobbies | social | other | null"
}}

Do not write any other text outside this JSON.

If analysis-only, reply MUST be "" (empty string).

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

    # 1) 直接 parse
    try:
        return json.loads(text)
    except Exception:
        pass

    # 2) ```json ... ``` 块
    m = re.search(r"```json(.*?)```", text, re.DOTALL | re.IGNORECASE)
    if m:
        inner = m.group(1).strip()
        try:
            return json.loads(inner)
        except Exception:
            pass

    # 3) 第一个大括号
    m2 = re.search(r"\{.*\}", text, re.DOTALL)
    if m2:
        candidate = m2.group(0)
        try:
            return json.loads(candidate)
        except Exception:
            pass

    # 完全失败：退化
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
            return float(x.strip())
    except Exception:
        return None
    return None


def _clean_and_normalize_theme_scores(raw_scores: Any) -> Tuple[Optional[Dict[str, float]], Optional[str]]:
    """
    接受 LLM 的 raw theme_scores，输出：
    - 归一化后的 theme_scores（四个 key 都在，sum≈1）
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
        scores = {"work": 0.0, "hobbies": 0.0, "social": 0.0, "other": 1.0}
        return scores, "other"

    # 归一化
    for k in scores:
        scores[k] = round(scores[k] / total, 6)

    # 修正 round 误差（差额补到 other）
    total2 = sum(scores.values())
    diff = round(1.0 - total2, 6)
    if abs(diff) > 0:
        scores["other"] = round(scores["other"] + diff, 6)
        if scores["other"] < 0:
            scores["other"] = 0.0

    primary = max(scores, key=lambda kk: scores[kk])
    return scores, primary


def _clean_emotion(emotion: Any) -> Optional[str]:
    if isinstance(emotion, str):
        e = emotion.strip().lower()
        return e if e in VALID_EMOTIONS else None
    return None


def _clean_intensity(intensity: Any) -> Optional[int]:
    val: Optional[int] = None
    if isinstance(intensity, int):
        val = intensity
    elif isinstance(intensity, str) and intensity.isdigit():
        val = int(intensity)

    if val not in (1, 2, 3):
        return None
    return val


def _clean_primary_theme(primary_theme: Any) -> Optional[str]:
    if isinstance(primary_theme, str):
        t = primary_theme.strip().lower()
        return t if t in VALID_THEMES else None
    return None


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

    reply = data.get("reply")
    if reply is None:
        reply = ""
    reply = str(reply).strip()

    emotion = _clean_emotion(data.get("emotion"))
    intensity = _clean_intensity(data.get("intensity"))

    theme_scores, inferred_primary = _clean_and_normalize_theme_scores(data.get("theme_scores"))
    primary_theme = _clean_primary_theme(data.get("primary_theme"))

    if not primary_theme:
        primary_theme = inferred_primary

    return {
        "reply": reply,
        "emotion": emotion,
        "intensity": intensity,
        "theme_scores": theme_scores,
        "primary_theme": primary_theme,
    }


def _apply_analysis_to_entry(
    entry: JournalEntry,
    emotion: Optional[str],
    intensity: Optional[int],
    theme_scores: Optional[Dict[str, float]],
    primary_theme: Optional[str],
) -> None:
    """
    把 AI 分析结果写回 entry。
    """
    if emotion:
        entry.emotion = emotion
    if intensity:
        entry.emotion_intensity = intensity

    if theme_scores is not None:
        entry.theme_scores = theme_scores
    if primary_theme:
        entry.primary_theme = primary_theme


def analyze_entry_for_entry(
    db: Session,
    entry_id: int,
    current_user: User,
    force_regenerate: bool = False,
) -> JournalEntry:
    """
    只做分析（emotion/intensity/theme），不生成 AIReply。
    - 默认：如果 entry 已经有分析 且不强制，直接返回
    - force_regenerate=True：重新分析并覆盖
    """
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

    has_analysis = bool(entry.emotion or entry.emotion_intensity or entry.primary_theme or entry.theme_scores)
    if has_analysis and not force_regenerate:
        return entry

    companion = _get_companion_or_default(db, current_user)

    prompt = build_prompt_for_entry(entry, companion, analysis_only=True)
    result = call_llm_for_reply_emotion_and_theme(prompt)

    _apply_analysis_to_entry(
        entry=entry,
        emotion=result["emotion"],
        intensity=result["intensity"],
        theme_scores=result["theme_scores"],
        primary_theme=result["primary_theme"],
    )

    db.commit()
    db.refresh(entry)
    return entry


def generate_ai_reply_for_entry(
    db: Session,
    entry_id: int,
    current_user: User,
    force_regenerate: bool = False,
) -> AIReply:
    """
    生成 AI 回复 + 分析（emotion/intensity/theme）。
    """
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

    if entry.ai_reply and not force_regenerate:
        return entry.ai_reply

    companion = _get_companion_or_default(db, current_user)

    prompt = build_prompt_for_entry(entry, companion, analysis_only=False)
    result = call_llm_for_reply_emotion_and_theme(prompt)

    reply_text: str = (result.get("reply") or "").strip()

    _apply_analysis_to_entry(
        entry=entry,
        emotion=result["emotion"],
        intensity=result["intensity"],
        theme_scores=result["theme_scores"],
        primary_theme=result["primary_theme"],
    )

    if entry.ai_reply:
        db.delete(entry.ai_reply)
        db.flush()

    ai_reply = AIReply(
        entry_id=entry.id,
        user_id=current_user.id,
        companion_id=companion.id,
        reply_type="empathetic_reply_with_emotion",
        content=reply_text or " ",
        model_name="Qwen/Qwen2.5-7B-Instruct",
    )
    db.add(ai_reply)

    db.commit()
    db.refresh(ai_reply)
    return ai_reply
