from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import user, system, entries

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Emotional Journal API",
    swagger_ui_parameters={"persistAuthorization": True},
    openapi_tags=[
        {"name": "Users", "description": "User management"},
        {"name": "Journal Entries", "description": "AI-powered journal entries"},
    ]
)

# ⭐⭐ 添加这一段：让 Swagger 支持 Bearer Token ⭐⭐
from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="AI Emotional Journal API",
        version="1.0.0",
        description="API for the AI Journal App",
        routes=app.routes,
    )

    # 添加 Bearer Token security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    # 设置全局需要 token（可选）
    openapi_schema["security"] = [{"bearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi


# 注册路由
app.include_router(entries.router)
app.include_router(user.router)
app.include_router(system.router)


@app.get("/")
def root():
    return {"message": "Hello from FastAPI!"}
