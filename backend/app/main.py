from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, file, home, leaderboard, journal, map as map_router, profile, reward, users,badges
from app.db.database import init_db
from starlette.staticfiles import StaticFiles
import os
app = FastAPI(title="GreenJourney API", version="0.1.0")

# CORS for local dev
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/badges", StaticFiles(directory="static/badges"), name="badges_static")
# Routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(home.router, prefix="/home", tags=["home"])
app.include_router(leaderboard.router, prefix="/leaderboard", tags=["leaderboard"])
app.include_router(journal.router, prefix="/journal", tags=["journal"])
app.include_router(map_router.router, prefix="/map", tags=["map"])
app.include_router(profile.router, prefix="/profile", tags=["profile"])
app.include_router(reward.router, prefix="/reward", tags=["reward"])
app.include_router(file.router, prefix="/file", tags=["file"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(badges.router, prefix="/api/badges", tags=["badges"])
@app.on_event("startup")
async def on_startup():
    init_db()

@app.get("/")
async def root():
    return {"status": "ok", "service": "greenjourney"}