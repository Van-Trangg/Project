# backend/mock_api/main.py
from fastapi import FastAPI
from .db import Base, engine
from .routers import router as mock_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Mock Third-Party Promotion Service",
    version="1.0.0"
)

app.include_router(mock_router, tags=["Mock Third Party"])
