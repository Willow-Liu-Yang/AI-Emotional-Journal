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

# 👉 在这里指定你想插入日记的「用户邮箱」(User.email)
#    例如登录用的是 "test@example.com"，就填那个
#    如果留空 None，就会退回到“取第一个用户”的逻辑
TARGET_EMAIL = "aaa@aaa.com"  # 比如 "test@example.com"

# ✅ 你项目中定义的六种情绪
EMOTIONS = ["joy", "calm", "tired", "anxiety", "sadness", "anger"]

# 按情绪分好的样本句子
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


def seed_entries_for_user(
    days_back: int = 60,
    min_entries_per_day: int = 0,
    max_entries_per_day: int = 3,
):
    """
    为指定用户生成测试日记数据：
    - 过去 days_back 天
    - 每天随机生成 [min_entries_per_day, max_entries_per_day] 条日记
    - 每条日记随机 emotion + intensity，但内容和 emotion 匹配
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

    print(
        f"✅ 为用户 id={user.id}, email={user.email} 生成测试日记数据..."
    )

    # 👉 可选：如果你想每次 seed 前清空这个用户的旧日记，可以解开下面三行
    # db.query(JournalEntry).where(JournalEntry.user_id == user.id).delete()
    # db.commit()
    # print("⚠️ 已清空该用户原有日记数据。")

    now = datetime.utcnow()

    for i in range(days_back):
        day_date = now - timedelta(days=i)

        # 当天生成几条
        count_today = random.randint(min_entries_per_day, max_entries_per_day)
        if count_today == 0:
            continue

        for _ in range(count_today):
            # 先随机一个情绪
            emotion = random.choice(EMOTIONS)
            # 再从对应情绪的句子里挑一条
            content = random.choice(EMOTION_SENTENCES[emotion])
            intensity = random.randint(1, 3)  # 1=low, 2=medium, 3=high

            created_at = day_date.replace(
                hour=random.randint(8, 22),
                minute=random.randint(0, 59),
                second=random.randint(0, 59),
                microsecond=0,
            )

            entry = JournalEntry(
                user_id=user.id,
                content=content,
                summary=content[:200],  # 跟你路由里生成的逻辑保持一致
                created_at=created_at,
                emotion=emotion,
                emotion_intensity=intensity,
                deleted=False,
            )

            db.add(entry)

    db.commit()
    db.close()
    print("✅ Seed 完成，快去 /entries 和 /stats 看看效果吧！")


if __name__ == "__main__":
    seed_entries_for_user()
