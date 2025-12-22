# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from database import Base, engine
import pkgutil
import startup
from routers import user, system, entries, companion, comments, stats, insights, calendar

# ---------------------------------------
# Create app (must be first)
# ---------------------------------------
app = FastAPI(
    title="AI Emotional Journal API",
    swagger_ui_parameters={"persistAuthorization": True},
)

# ---------------------------------------
# Register routes (must be before OpenAPI)
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
# Startup event scan
# ---------------------------------------
for _, module_name, _ in pkgutil.iter_modules(startup.__path__):
    module = __import__(f"startup.{module_name}", fromlist=["register_startup_event"])
    if hasattr(module, "register_startup_event"):
        module.register_startup_event(app)

# ---------------------------------------
# Create database
# ---------------------------------------
Base.metadata.create_all(bind=engine)

# ---------------------------------------
# Custom Swagger (must be after include_router)
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

    # Key: enable BearerAuth globally
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
