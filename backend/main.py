from fastapi import FastAPI
from database import Base, engine
from routers import user, system, entries

# 初始化数据库（自动建表）
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Emotional Journal API")

# 注册 journal 路由
app.include_router(entries.router)
app.include_router(user.router)
app.include_router(system.router)

@app.get("/")
def root():
    return {"message": "Hello from FastAPI + SQLAlchemy + Routers!"}
