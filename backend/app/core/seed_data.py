import json
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from passlib.context import CryptContext

from app.db.database import engine
from app.models.map import Map
from app.models.poi import POI
from app.models.user import User
from app.models.checkin import Checkin


# --- Password Hashing ---
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# --- Helper ---
def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# --- Seed Maps + POIs ---
def seed_maps_and_pois(map_file: str = "app/data/map.json", poi_file: str = "app/data/poi.json"):
    with Session(engine) as session:
        # --- Seed Maps ---
        maps = load_json(map_file)
        for m in maps:
            existing = session.scalar(select(Map).where(Map.name == m["name"]))
            if not existing:
                session.add(Map(**m))
        session.commit()

        # --- Seed POIs ---
        pois = load_json(poi_file)
        for p in pois:
            existing = session.scalar(select(POI).where(POI.name == p["name"], POI.map_id == p["map_id"]))
            if not existing:
                p.setdefault("rating", 0.0)
                p.setdefault("checked_users", 0)
                session.add(POI(**p))
        session.commit()

        print("✅ Seed completed: maps + pois inserted")


# --- Seed Users ---
def seed_users(user_file: str = "app/data/users.json"):
    users = load_json(user_file)
    with Session(engine) as session:
        for u in users:
            existing = session.scalar(select(User).where(User.id == u["id"]))
            if not existing:
                u["hashed_password"] = hash_password("123456789")
                session.add(User(**u))
        session.commit()
        print(f"✅ Seed completed: {len(users)} users inserted (password = '123456789')")


# --- Seed Checkins ---
def seed_checkins(checkin_file: str = "app/data/checkins.json"):
    checkins = load_json(checkin_file)
    with Session(engine) as session:
        for c in checkins:
            existing = session.scalar(select(Checkin).where(Checkin.receipt_no == c["receipt_no"]))
            if not existing:
                # ✅ Chuyển chuỗi ISO → datetime thật
                if isinstance(c.get("created_at"), str):
                    try:
                        c["created_at"] = datetime.fromisoformat(c["created_at"])
                    except ValueError:
                        c["created_at"] = datetime.strptime(c["created_at"], "%Y-%m-%d %H:%M:%S")

                session.add(Checkin(**c))
        session.commit()
        print(f"✅ Seed completed: {len(checkins)} check-ins inserted")

        # --- Update checked_users cho từng POI ---
        poi_counts = (
            session.query(Checkin.poi_id, func.count(func.distinct(Checkin.user_id)))
            .group_by(Checkin.poi_id)
            .all()
        )
        for poi_id, count in poi_counts:
            poi = session.get(POI, poi_id)
            if poi:
                poi.checked_users = count
        session.commit()
        print("🔁 Updated POI.checked_users successfully")


# --- Main ---
if __name__ == "__main__":
    seed_maps_and_pois("app/data/map.json", "app/data/poi.json")
    seed_users("app/data/users.json")
    seed_checkins("app/data/checkins.json")
