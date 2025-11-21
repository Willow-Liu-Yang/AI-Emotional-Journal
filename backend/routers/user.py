from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from database import SessionLocal
from models import User
from schemas import UserCreate, UserOut, UsernameUpdate  # 👈 新加 UsernameUpdate
from datetime import timedelta
from auth import create_access_token

from database import get_db


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# 密码加密工具
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")



# 工具函数：哈希密码
def hash_password(password: str):
    return pwd_context.hash(password)

# 工具函数：验证密码
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 注册用户（邮箱 + 密码）
@router.post("/register", response_model=UserOut)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)
    new_user = User(
        email=user.email,
        password=hashed_pw,

    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# 登录
@router.post("/login")
def login_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # 生成 access token（可选设置短期或长期过期）
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"user_id": db_user.id},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# 设置用户名（昵称）
@router.patch("/{user_id}/username", response_model=UserOut)
def update_username(user_id: int, username_update: UsernameUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.username = username_update.username
    db.commit()
    db.refresh(user)
    return user
