# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from database import Base, engine

import pkgutil
import startup

# Routers
from routers import user, system, entries, companion


# ---------------------------------------------------------
# 创建 app（必须放在最前面）
# ---------------------------------------------------------
app = FastAPI(
    title="AI Emotional Journal API",
    swagger_ui_parameters={"persistAuthorization": True},
)


# ---------------------------------------------------------
# 自动执行 startup/ 目录下的所有 startup 注册函数
# ---------------------------------------------------------
for _, module_name, _ in pkgutil.iter_modules(startup.__path__):
    module = __import__(f"startup.{module_name}", fromlist=["register_startup_event"])
    if hasattr(module, "register_startup_event"):
        module.register_startup_event(app)


# ---------------------------------------------------------
# 创建数据库表（如果你没有 Alembic）
# ---------------------------------------------------------
Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------
# 自定义 Swagger 的 JWT 配置
# ---------------------------------------------------------
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="AI Emotional Journal API",
        version="1.0.0",
        description="API for the AI Journal App",
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


# ---------------------------------------------------------
# 注册路由（必须在 app 创建之后）
# ---------------------------------------------------------
app.include_router(entries.router)
app.include_router(user.router)
app.include_router(system.router)
app.include_router(companion.router)


# ---------------------------------------------------------
# CORS 设置（如果你需要前端访问）
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # 你可以改成前端 URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
