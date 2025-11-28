# backend/routers/user.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import timedelta

from models import User
from schemas import UserCreate, UserOut, UsernameUpdate, UserLogin, UserMe
from core.auth import create_access_token, get_current_user
from database import get_db


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# -----------------------------
# Helper functions
# -----------------------------
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# -----------------------------
# Register
# -----------------------------
@router.post("/register", response_model=UserOut)
def register_user(user: UserCreate, db: Session = Depends(get_db)):

    # Check email exists
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)

    new_user = User(
        email=user.email,
        password=hashed_pw,
        companion_id=1   # 默认 Luna
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# -----------------------------
# Login
# -----------------------------
@router.post("/login")
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == payload.email).first()
    if not db_user or not verify_password(payload.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_access_token(
        data={"user_id": db_user.id},
        expires_delta=timedelta(hours=1)
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut.model_validate(db_user)
    }


# -----------------------------
# Get current user info
# -----------------------------
@router.get("/me", response_model=UserMe)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# -----------------------------
# Update username (nickname)
# -----------------------------
@router.patch("/me/username", response_model=UserOut)
def update_username(update: UsernameUpdate,
                    db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):

    current_user.username = update.username
    db.commit()
    db.refresh(current_user)

    return current_user
