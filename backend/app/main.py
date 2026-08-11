from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.routers import admin, alerts, auth, dashboard, filieres, students, users

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(dashboard.router)
app.include_router(alerts.router)
app.include_router(users.router)
app.include_router(filieres.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok"}
