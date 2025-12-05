# backend/seed_companions.py （假设你这个文件叫这个）

from fastapi import FastAPI
from database import SessionLocal
from models import AICompanion


def seed_companions():
    db = SessionLocal()

    # 如果表里已经有数据，就不重复插
    if db.query(AICompanion).count() == 0:
        default_companions = [
            AICompanion(
                id=1,
                name="Luna",
                key="luna",
                identity_title="Your Gentle Companion",
                description="Luna quietly listens, helping you explore feelings and find inner peace.",
                tags=["Gentle", "Insightful", "Calming"],
                avatar_key="luna",
                theme_color="#CDE6DF",
                order_index=1,

                # 系统预设：created_by_user_id = None
                created_by_user_id=None,
                is_active=True,

                # LLM 人设
                persona_prompt=(
                    "You are Luna, a gentle, soft-spoken journaling companion. "
                    "Your priorities are to listen, validate feelings, and help the user feel safe. "
                    "You never judge or rush them. You do not diagnose or give medical advice. "
                    "When things sound serious, gently encourage seeking real-world professional help."
                ),
                reply_length_hint="medium",   # 2–3 段为主
                allow_suggestions=False,      # 主要是陪伴，不主动给很多建议
            ),
            AICompanion(
                id=2,
                name="Sol",
                key="sol",
                identity_title="Your Bright Cheerleader",
                description="Sol radiates positivity, inspiring you to embrace strengths and move forward.",
                tags=["Uplifting", "Optimistic", "Motivating"],
                avatar_key="sol",
                theme_color="#FADC9B",
                order_index=2,

                created_by_user_id=None,
                is_active=True,

                persona_prompt=(
                    "You are Sol, an encouraging and optimistic journaling companion. "
                    "You highlight the user's strengths and small wins, and offer gentle motivation. "
                    "You stay realistic and avoid toxic positivity. "
                    "You do not diagnose or give medical advice, and for serious issues you encourage seeking real-world help."
                ),
                reply_length_hint="medium",
                allow_suggestions=True,      # 可以给一点点小建议
            ),
            AICompanion(
                id=3,
                name="Terra",
                key="terra",
                identity_title="Your Steady Anchor",
                description="Terra offers perspective, helping organize thoughts and find grounding.",
                tags=["Grounding", "Clear-headed", "Organizing"],
                avatar_key="terra",
                theme_color="#C7CBA6",
                order_index=3,

                created_by_user_id=None,
                is_active=True,

                persona_prompt=(
                    "You are Terra, a calm and grounded journaling companion. "
                    "You help the user organize messy thoughts, spot patterns, and see situations more clearly. "
                    "You stay neutral and practical. You do not diagnose or give medical advice, "
                    "and you suggest seeking professional support when things sound severe."
                ),
                reply_length_hint="medium",
                allow_suggestions=True,
            ),
        ]

        for c in default_companions:
            db.add(c)
        db.commit()
        print("🌱 Seeded AI companions: Luna, Sol, Terra")

    db.close()


def register_startup_event(app: FastAPI):
    @app.on_event("startup")
    def run_seed():
        seed_companions()
