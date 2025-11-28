from fastapi import FastAPI
from database import SessionLocal
from models import AICompanion

def seed_companions():
    db = SessionLocal()
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
