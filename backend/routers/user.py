from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from database import SessionLocal
from models import User
from schemas import UserCreate, UserOut, UsernameUpdate  # 👈 新加 UsernameUpdate

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# 密码加密工具
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 数据库依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 工具函数：哈希密码
def hash_password(password: str):
    return pwd_context.hash(password)

# 工具函数：验证密码
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 注册用户（邮箱 + 密码）
@router.post("/register", response_model=UserOut)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    print("🟡 REGISTER PASSWORD TYPE:", type(user.password), user.password)  # <---- 加这行
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)
    new_user = User(
        email=user.email,
        password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# 登录
@router.post("/login")
def login_user(user: UserCreate, db: Session = Depends(get_db)):
    print("🟢 LOGIN PASSWORD TYPE:", type(user.password), user.password)  # <---- 加这行
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "user_id": db_user.id,
        "username": db_user.username
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
