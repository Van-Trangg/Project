import json
from sqlmodel import Session
from passlib.context import CryptContext

from app.db.database import engine
from app.models.map import Map
from app.models.poi import POI
from app.models.user import User  # thêm import User model

# --- Hashing setup (phù hợp với nhóm bạn) ---
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# --- Helper function ---
def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

# --- Seed maps + POIs ---
def seed_maps_and_pois(map_file: str = "app/data/map.json", poi_file: str = "app/data/poi.json"):
    with Session(engine) as session:
        # Seed maps
        maps = load_json(map_file)
        for m in maps:
            existing = session.get(Map, m["id"])
            if not existing:
                session.add(Map(**m))
        session.commit()

        # Seed POIs
        pois = load_json(poi_file)
        for p in pois:
            session.add(POI(**p))
        session.commit()

        print("✅ Seed completed: maps + pois inserted")

# --- Seed Users ---
def seed_users(user_file: str = "app/data/users.json"):
    users = load_json(user_file)
    with Session(engine) as session:
        for u in users:
            existing = session.get(User, u["id"])
            if not existing:
                # Thay thế hashed_password giả bằng hash thật của "123456789"
                u["hashed_password"] = hash_password("123456789")
                session.add(User(**u))
        session.commit()
        print(f"✅ Seed completed: {len(users)} users inserted (password = '123456789')")

# --- Main ---
if __name__ == "__main__":
    seed_maps_and_pois()
    seed_users("app/data/users.json")
