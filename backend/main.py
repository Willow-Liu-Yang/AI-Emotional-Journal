# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from database import Base, engine
import pkgutil
import startup
from routers import user, system, entries, companion, comments, stats, insights, calendar

# ---------------------------------------
# 创建 app（必须放最前）
# ---------------------------------------
app = FastAPI(
    title="AI Emotional Journal API",
    swagger_ui_parameters={"persistAuthorization": True},
)

# ---------------------------------------
# 注册路由（必须在 openapi 前）
# ---------------------------------------
app.include_router(user.router)
app.include_router(entries.router)
app.include_router(system.router)
app.include_router(companion.router)
app.include_router(comments.router)
app.include_router(stats.router)
app.include_router(insights.router)
app.include_router(calendar.router)

# ---------------------------------------
# 启动事件扫描
# ---------------------------------------
for _, module_name, _ in pkgutil.iter_modules(startup.__path__):
    module = __import__(f"startup.{module_name}", fromlist=["register_startup_event"])
    if hasattr(module, "register_startup_event"):
        module.register_startup_event(app)

# ---------------------------------------
# 创建数据库
# ---------------------------------------
Base.metadata.create_all(bind=engine)

# ---------------------------------------
# 自定义 Swagger（必须在 include_router 之后）
# ---------------------------------------
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
        "HTTPBearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    # ⭐⭐⭐ 关键：全局启用 BearerAuth
    openapi_schema["security"] = [{"HTTPBearer": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# ---------------------------------------
# CORS
# ---------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
