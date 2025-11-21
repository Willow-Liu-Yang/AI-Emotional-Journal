from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import user, system, entries
from fastapi.openapi.utils import get_openapi

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Emotional Journal API",
    swagger_ui_parameters={"persistAuthorization": True},
)

# 添加 BearerAuth（最标准写法）
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

# 注册路由
app.include_router(entries.router)
app.include_router(user.router)
app.include_router(system.router)
