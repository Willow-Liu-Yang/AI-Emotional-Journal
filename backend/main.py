from fastapi import FastAPI
from database import Base, engine
from routers import journal

# 初始化数据库（自动建表）
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Emotional Journal API")

# 注册 journal 路由
app.include_router(journal.router)

@app.get("/")
def root():
    return {"message": "Hello from FastAPI + SQLAlchemy + Routers!"}
