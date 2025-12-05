# backend/scripts/seed_entries.py

import os
import sys

# 让 Python 知道 backend 根目录的位置
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import random
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from database import SessionLocal
from models import JournalEntry, User
from services.ai_reply_service import generate_ai_reply_for_entry

# 👉 在这里指定你想插入日记的「用户邮箱」(User.email)
#    例如登录用的是 "test@example.com"，就填那个
TARGET_EMAIL = "jiawenchen.jwc@outlook.com"  # 比如 "test@example.com"

# ✅ 你项目中定义的六种情绪（只是用来挑文案，不直接写进表）
EMOTIONS = ["joy", "calm", "tired", "anxiety", "sadness", "anger"]

# 按情绪分好的样本句子（只用来生成日记文字）
EMOTION_SENTENCES = {
    "joy": [
        "Today felt unexpectedly bright. I finished my tasks earlier than I planned and even had time to walk around the campus. The sunlight felt warm on my face and for a moment, everything felt easy.",
        "I had a genuinely joyful evening. I cooked something simple but delicious, and the whole room smelled amazing. It made me feel like I’m slowly building a life I enjoy.",
        "I laughed a lot today—small moments, small jokes, but they stacked up. Sometimes happiness really comes from the tiniest things.",
        "I cooked something simple for dinner and it actually turned out pretty good. It made the evening feel a bit softer.",
    ],
    "calm": [
        "It was a quiet and peaceful day. I didn’t do anything special, but my mind felt clear, and I enjoyed the stillness. I wish days like this came more often.",
        "I spent most of my time reading and the calm was comforting. No pressure, no rush. Just me, a cup of tea, and a soft light from the window.",
        "Today felt clean and slow. I didn’t push myself too much, but I still got things done. There’s a nice balance in that.",
        "I walked outside for a bit and the air was cold, but refreshing. Sometimes stepping away from work is exactly what I need to reset my mind.",
        "I didn’t speak much today, but it wasn’t a bad thing. Silence felt comfortable, like giving my brain a chance to rest.",
    ],
    "tired": [
        "I’m feeling really drained today. Even simple tasks felt heavy, and my body was begging for rest. Maybe I’ve been pushing myself too hard recently.",
        "I woke up tired and it never really went away. No matter how much I tried to focus, my brain just kept slowing down. I think I need a proper break.",
        "My whole body feels sluggish. I didn’t even do anything intense, but the exhaustion just sat on me like a weight all day.",
    ],
    "anxiety": [
        "I felt anxious most of the day. My mind kept circling around the same worries even though nothing bad was happening. I wish I could just switch it off.",
        "My chest felt tight for no clear reason. I tried breathing exercises, and it helped a little, but the anxiety stayed quietly in the background.",
        "There’s this uncomfortable sense of pressure I can’t explain. I did everything I needed to, but the uneasiness never really left.",
    ],
    "sadness": [
        "I felt a wave of sadness today. Not overwhelming, just a quiet heaviness that followed me around. I couldn’t really point to a reason.",
        "It’s one of those days where everything feels muted. People talked around me, but it’s like my emotions were a little far away.",
        "I had a moment where I suddenly felt lonely. It passed after a while, but it left a kind of softness inside me—sad, but gentle.",
    ],
    "anger": [
        "I felt irritated at small things today. Maybe I’m tired or mentally overloaded, but everything seemed to get on my nerves more than usual.",
        "Something someone said bothered me more than it should have, and I carried that irritation for hours. I wish I could let things go faster.",
        "I got frustrated with myself today. When things don’t go the way I expect, it’s like my patience just disappears.",
    ],
}


def get_year_month_offset(base_year: int, base_month: int, offset: int) -> tuple[int, int]:
  """
  从当前年月往前 offset 个月，比如：
  offset=0 -> 当月
  offset=1 -> 上个月
  offset=2 -> 上上个月
  """
  m = base_month - offset
  y = base_year
  while m <= 0:
      m += 12
      y -= 1
  return y, m


def seed_entries_for_user(
    months: int = 3,
    entries_per_month: int = 5,
):
    """
    为指定用户生成测试日记数据：
    - 最近 months 个月（包含当月）
    - 每个月随机选择 entries_per_month 天，每天 1 条日记
    - 日记内容根据情绪模板随机选一句
    - 不直接写 emotion / emotion_intensity
    - 为每条日记调用 generate_ai_reply_for_entry，让 AI 生成回复 + 情绪 + 强度
    """

    db: Session = SessionLocal()

    # 1. 查找目标用户（优先按邮箱）
    user_query = db.query(User)

    if TARGET_EMAIL:
        user_query = user_query.filter(User.email == TARGET_EMAIL)

    user = user_query.order_by(User.id.asc()).first()

    if not user:
        if TARGET_EMAIL:
            print(f"❌ 没有找到 email 为 {TARGET_EMAIL!r} 的用户，请确认后再试。")
        else:
            print("❌ 没有找到任何用户，请先注册一个用户再运行脚本。")
        db.close()
        return

    print(f"✅ 为用户 id={user.id}, email={user.email} 生成 3 个月测试日记数据...")

    # 👉 如需每次 seed 前清空该用户原有日记，可以手动解开：
    # db.query(JournalEntry).where(JournalEntry.user_id == user.id).delete()
    # db.commit()
    # print("⚠️ 已清空该用户原有日记数据。")

    now = datetime.utcnow()
    base_year = now.year
    base_month = now.month

    total_entries = 0

    for offset in range(months):
        year, month = get_year_month_offset(base_year, base_month, offset)
        first_day = datetime(year, month, 1)

        # 下个月的第一天
        if month == 12:
            next_first = datetime(year + 1, 1, 1)
        else:
            next_first = datetime(year, month + 1, 1)

        days_in_month = (next_first - first_day).days

        # 这个月实际要生成多少条（防止 2 月太短）
        k = min(entries_per_month, days_in_month)

        # 随机挑 k 个不同的日期
        day_offsets = random.sample(range(days_in_month), k=k)

        print(f"📅 {year}-{month:02d}: 生成 {k} 条日记...")

        for day_offset in day_offsets:
            day_date = first_day + timedelta(days=day_offset)

            # 选一个情绪和对应文案（只是为了让内容看起来合理一点）
            emotion = random.choice(EMOTIONS)
            content = random.choice(EMOTION_SENTENCES[emotion])

            created_at = day_date.replace(
                hour=random.randint(8, 22),
                minute=random.randint(0, 59),
                second=random.randint(0, 59),
                microsecond=0,
            )

            entry = JournalEntry(
                user_id=user.id,
                content=content,
                summary=content[:200],
                created_at=created_at,
                # 这里不直接写 emotion / emotion_intensity，
                # 让 AI 在 generate_ai_reply_for_entry 里统一分析并写入
                deleted=False,
            )

            db.add(entry)
            db.flush()  # 拿到 entry.id

            # ✨ 直接调用你们的 AI service：
            # - 生成 empathetic reply
            # - 同时分析 emotion / intensity 并写回 JournalEntry
            try:
                ai_reply = generate_ai_reply_for_entry(
                    db=db,
                    entry_id=entry.id,
                    current_user=user,
                    force_regenerate=False,
                )
                # service 内部一般会 commit，一次 commit 会把当前 session 的改动都保存
                print(
                    f"  ➕ entry_id={entry.id} | AI reply id={ai_reply.id} 已生成"
                )
            except Exception as e:
                # 如果 AI 调用失败，也至少保留日记
                print(f"  ⚠️ entry_id={entry.id} 生成 AI 回复失败: {e}")

            total_entries += 1

    # 保险起见再 commit 一次（即使 service 里已经 commit 过也没问题）
    db.commit()
    db.close()
    print(f"✅ Seed 完成，总共生成 {total_entries} 条日记（含 AI 回复）。")


if __name__ == "__main__":
    # 默认：最近 3 个月，每月 5 条
    seed_entries_for_user(months=3, entries_per_month=5)
