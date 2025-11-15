from fastapi import FastAPI
from database import init_db
from routers import users, entries

app = FastAPI(title="Emotion Journal Backend")

@app.on_event("startup")
def on_startup():
    init_db()

# 注册路由
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(entries.router, prefix="/entries", tags=["Entries"])

@app.get("/")
def home():
    return {"message": "Backend is running successfully!"}
