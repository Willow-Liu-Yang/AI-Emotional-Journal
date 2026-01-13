# backend/scripts/seed_entries.py

import os
import sys

# Let Python know backend root path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import random
from datetime import datetime, timedelta
import calendar

from sqlalchemy.orm import Session

from database import SessionLocal
from models import JournalEntry, User
from routers.user import hash_password
from services.ai_reply_service import generate_ai_reply_for_entry

# Set the target user's email (User.email)
TARGET_EMAIL = "test@example.com"
TARGET_PASSWORD = "test1234"

# Emotion pool (only used to pick text; emotion/intensity are written by AI service)
EMOTIONS = ["joy", "calm", "tired", "anxiety", "sadness", "anger"]

# Sample sentences grouped by emotion
EMOTION_SENTENCES = {
    "joy": [
        "Today felt unexpectedly bright. I finished my tasks earlier than I planned and even had time to walk around the campus. The sunlight felt warm on my face and for a moment, everything felt easy.",
        "I had a genuinely joyful evening. I cooked something simple but delicious, and the whole room smelled amazing. It made me feel like I’m slowly building a life I enjoy.",
        "I laughed a lot today—small moments, small jokes, but they stacked up. Sometimes happiness really comes from the tiniest things.",
        "I cooked something simple for dinner and it actually turned out pretty good. It made the evening feel a bit softer.",
        "I got a kind message from a friend and it lifted my whole mood. We ended up chatting for a while and I felt more connected than I have in days.",
        "I finally cleared an old task that was hanging over me. The relief felt warm and spacious, like I could breathe again.",
        "I made time for a short walk after lunch and the breeze felt so good. The day felt lighter than usual.",
        "A small win: I stuck to my plan and finished a tough part of my project. I feel proud and a little more confident.",
    ],
    "calm": [
        "It was a quiet and peaceful day. I didn’t do anything special, but my mind felt clear, and I enjoyed the stillness. I wish days like this came more often.",
        "I spent most of my time reading and the calm was comforting. No pressure, no rush. Just me, a cup of tea, and a soft light from the window.",
        "Today felt clean and slow. I didn’t push myself too much, but I still got things done. There’s a nice balance in that.",
        "I walked outside for a bit and the air was cold, but refreshing. Sometimes stepping away from work is exactly what I need to reset my mind.",
        "I didn’t speak much today, but it wasn’t a bad thing. Silence felt comfortable, like giving my brain a chance to rest.",
        "I tidied my desk and put on quiet music. The small order made everything feel less noisy in my head.",
        "I took a longer shower and let the warm water slow me down. The day felt gentle after that.",
        "I kept my phone away for most of the afternoon. It was surprisingly calming to move at my own pace.",
        "I spent some time stretching and it eased the tension in my shoulders. I felt more grounded afterward.",
    ],
    "tired": [
        "I’m feeling really drained today. Even simple tasks felt heavy, and my body was begging for rest. Maybe I’ve been pushing myself too hard recently.",
        "I woke up tired and it never really went away. No matter how much I tried to focus, my brain just kept slowing down. I think I need a proper break.",
        "My whole body feels sluggish. I didn’t even do anything intense, but the exhaustion just sat on me like a weight all day.",
        "I kept yawning through meetings and could not stay fully present. It felt like my energy ran out before the day even started.",
        "I tried to push through, but everything took twice as long. I should probably sleep earlier tonight.",
        "Even small decisions felt exhausting today. I need to give myself more room to rest.",
    ],
    "anxiety": [
        "I felt anxious most of the day. My mind kept circling around the same worries even though nothing bad was happening. I wish I could just switch it off.",
        "My chest felt tight for no clear reason. I tried breathing exercises, and it helped a little, but the anxiety stayed quietly in the background.",
        "There’s this uncomfortable sense of pressure I can’t explain. I did everything I needed to, but the uneasiness never really left.",
        "I kept checking my phone and email, afraid I was missing something important. It made it hard to relax.",
        "I felt on edge for most of the afternoon. My thoughts were racing and I could not settle on one thing.",
        "I worried about a future deadline even though it is weeks away. I know it is not urgent, but it still felt heavy.",
    ],
    "sadness": [
        "I felt a wave of sadness today. Not overwhelming, just a quiet heaviness that followed me around. I couldn’t really point to a reason.",
        "It’s one of those days where everything feels muted. People talked around me, but it’s like my emotions were a little far away.",
        "I had a moment where I suddenly felt lonely. It passed after a while, but it left a kind of softness inside me—sad, but gentle.",
        "I looked back at some old photos and felt a little nostalgic. It was tender but also a bit heavy.",
        "I felt low energy and distant today. I think I need some small comforts and time to reset.",
        "I missed someone I have not talked to in a while. It made the day feel a little gray.",
    ],
    "anger": [
        "I felt irritated at small things today. Maybe I’m tired or mentally overloaded, but everything seemed to get on my nerves more than usual.",
        "Something someone said bothered me more than it should have, and I carried that irritation for hours. I wish I could let things go faster.",
        "I got frustrated with myself today. When things don’t go the way I expect, it’s like my patience just disappears.",
        "A small inconvenience set me off and I hated how quickly I snapped. I want to handle stress with more grace.",
        "I felt annoyed by delays and noise around me. It was hard to stay focused and kind.",
        "I argued with myself in my head about what I should have said. The lingering anger felt exhausting.",
    ],
}


def clamp_day(year: int, month: int, day: int) -> int:
    """Clamp day to the last valid day of the given month."""
    last_day = calendar.monthrange(year, month)[1]
    return min(day, last_day)


def same_day_last_month(dt: datetime) -> datetime:
    """Return 'same day last month' (clamped if last month is shorter)."""
    y = dt.year
    m = dt.month - 1
    if m == 0:
        y -= 1
        m = 12
    d = clamp_day(y, m, dt.day)
    return dt.replace(year=y, month=m, day=d)


def same_day_last_year(dt: datetime) -> datetime:
    """Return 'same day last year' (handles Feb 29 -> Feb 28)."""
    y = dt.year - 1
    m = dt.month
    d = clamp_day(y, m, dt.day)
    return dt.replace(year=y, month=m, day=d)


def random_time_on_date(day_dt: datetime) -> datetime:
    """Assign a random time (08:00-22:59) on the given date."""
    return day_dt.replace(
        hour=random.randint(8, 22),
        minute=random.randint(0, 59),
        second=random.randint(0, 59),
        microsecond=0,
    )


def create_entry_with_ai(db: Session, user: User, created_at: datetime) -> None:
    """Create one JournalEntry, then call AI service to generate reply + emotion/intensity."""
    emotion = random.choice(EMOTIONS)
    content = random.choice(EMOTION_SENTENCES[emotion])

    entry = JournalEntry(
        user_id=user.id,
        content=content,
        summary=content[:200],
        created_at=created_at,
        deleted=False,
    )

    db.add(entry)
    db.flush()  # get entry.id

    try:
        ai_reply = generate_ai_reply_for_entry(
            db=db,
            entry_id=entry.id,
            current_user=user,
            force_regenerate=False,
        )
        print(f"Created entry_id={entry.id}; AI reply id={ai_reply.id}")
    except Exception as e:
        print(f"Created entry_id={entry.id}; AI reply failed: {e}")


def seed_entries_for_user(total_entries: int = 18) -> None:
    """
    Seed about 18 entries for the specified user:
    - today
    - same weekday last week (today - 7 days)
    - same day last month (clamped if needed)
    - same day last year (clamped if needed)
    - plus 2 additional random dates (recent 60 days) avoiding duplicates

    For each entry, we call generate_ai_reply_for_entry to generate AI reply + emotion + intensity.
    """

    db: Session = SessionLocal()

    # Find or create target user
    user_query = db.query(User)
    if TARGET_EMAIL:
        user_query = user_query.filter(User.email == TARGET_EMAIL)

    user = user_query.order_by(User.id.asc()).first()
    if not user:
        if not TARGET_EMAIL:
            print("No users found. Please register a user first, then retry.")
            db.close()
            return

        user = User(
            email=TARGET_EMAIL,
            password=hash_password(TARGET_PASSWORD),
            companion_id=1,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created user id={user.id}, email={user.email}")

    now = datetime.utcnow()

    # Fixed required dates
    fixed_dates = [
        now,
        now - timedelta(days=7),          # last week's today
        same_day_last_month(now),         # last month's today (clamped)
        same_day_last_year(now),          # last year's today (clamped)
    ]

    # Use date keys to avoid duplicates across months/years edge cases
    used_date_keys = set()
    all_target_dates = []

    for d in fixed_dates:
        key = (d.year, d.month, d.day)
        if key not in used_date_keys:
            used_date_keys.add(key)
            all_target_dates.append(d)

    # Add extra random dates (recent 60 days), avoiding duplicates
    # Keep generating until we reach total_entries, but hard-cap attempts to prevent infinite loops.
    attempts = 0
    while len(all_target_dates) < total_entries and attempts < 200:
        attempts += 1
        delta_days = random.randint(1, 60)
        d = now - timedelta(days=delta_days)
        key = (d.year, d.month, d.day)
        if key in used_date_keys:
            continue
        used_date_keys.add(key)
        all_target_dates.append(d)

    # Sort by created_at ascending (optional; nicer chronology)
    all_target_dates.sort()

    print(f"Seeding {len(all_target_dates)} entries for user id={user.id}, email={user.email} ...")

    # Optional: clear existing entries for this user (uncomment if needed)
    # db.query(JournalEntry).where(JournalEntry.user_id == user.id).delete()
    # db.commit()
    # print("Cleared existing entries for this user.")

    for d in all_target_dates:
        created_at = random_time_on_date(d)
        create_entry_with_ai(db, user, created_at)

    db.commit()
    db.close()
    print(f"Seed completed. Inserted {len(all_target_dates)} entries.")


if __name__ == "__main__":
    seed_entries_for_user(total_entries=18)
