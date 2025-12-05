from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
import os
from app.db.database import get_db
from sqlalchemy.orm import Session
from app.models.user import User
from app.routers import (
    auth, file, home, leaderboard, journal, ai, statistic, recap,
    map as map_router, profile, reward, users, badges
)
from app.db.database import init_db, SessionLocal
from app.crud.checkin_crud import recompute_scores   # ✔ bạn import CRUD scoring vào đây
from app.crud.badge_crud import check_and_award_badges,sync_all_user_badge_counts
app = FastAPI(title="GreenJourney API", version="0.1.0")

# CORS for local dev
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://semimagical-granville-uncreatively.ngrok-free.dev","*"],
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
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(statistic.router, prefix="/statistic", tags=["statistic"])
app.include_router(recap.router, prefix="/recap", tags=["recap"])

# ─────────────────────────────────────────────
# ⭐ STARTUP EVENT – chạy init_db + recompute_scores
# ─────────────────────────────────────────────

@app.on_event("startup")
async def on_startup():
    print("🔄 Initializing database...")
    init_db()
    print("✅ Database initialized.")

    # Tạo session riêng cho startup task
    db = SessionLocal()

    try:
        print("🎯 Recomputing POI scores on startup...")
        recompute_scores(db)
        print("✅ Finished recomputing POI scores.")
    except Exception as e:
        print("❌ Error recomputing POI scores:", e)
    finally:
        db.close()


@app.get("/")
async def root():
    return {"status": "ok", "service": "greenjourney"}
@app.post("/sync-all-badges-manual")
def sync_badges_manual(db: Session = Depends(get_db)):
    """
    Quét toàn bộ user, kiểm tra điểm total_eco_points hiện tại
    và cấp bù các huy hiệu còn thiếu.
    """
    users = db.query(User).all()
    count = 0
    logs = []

    print(f"🔄 Starting sync for {len(users)} users...")

    for user in users:
        points = user.total_eco_points or 0
        if points > 0:
            # Gọi hàm check badge, hàm này sẽ tự insert vào DB nếu thiếu
            new_badges = check_and_award_badges(db, user.id, points)
            
            if new_badges:
                badge_names = [b['badge'] for b in new_badges]
                logs.append(f"User ID {user.id} ({points} pts) -> Awarded: {badge_names}")
                count += 1
    
    print(f"✅ Sync complete. Updated {count} users.")
    return {"status": "success", "users_updated": count, "details": logs}

@app.post("/sync-counts")
def trigger_sync_badge_counts(
    db: Session = Depends(get_db),
):
    result = sync_all_user_badge_counts(db)
    return result