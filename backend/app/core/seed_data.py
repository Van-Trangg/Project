import json
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from passlib.context import CryptContext
import random
import string

from app.db.database import engine
from app.models.map import Map
from app.models.poi import POI
from app.models.user import User
from app.models.checkin import Checkin
from app.core.security import hash_password
from app.models.journal import Journal
from app.models.transaction import Transaction

# --- Password Hashing ---
#pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

#def hash_password(password: str) -> str:
    #return pwd_context.hash(password)


# --- Helper ---
def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def seed_journals(journal_file: str = "app/data/journals.json"):
    journals = load_json(journal_file)
    with Session(engine) as session:
        for j in journals:
            existing = session.scalar(select(Journal).where(Journal.id == j["id"]))
            if not existing:
                if isinstance(j.get("created_at"), str):
                    try:
                        j["created_at"] = datetime.fromisoformat(j["created_at"])
                    except ValueError:
                        j["created_at"] = datetime.strptime(j["created_at"], "%Y-%m-%d %H:%M:%S")

                session.add(Journal(**j))
        session.commit()
        print(f"✅ Seed completed: {len(journals)} journals inserted")

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




def seed_transactions(
    checkin_file: str = "app/data/checkins.json",
    user_file: str = "app/data/users.json",
    poi_file: str = "app/data/poi.json"
):
    checkins = json.load(open(checkin_file, "r", encoding="utf-8"))
    users = json.load(open(user_file, "r", encoding="utf-8"))
    pois = json.load(open(poi_file, "r", encoding="utf-8"))

    poi_lookup = {i + 1: poi for i, poi in enumerate(pois)}

    with Session(engine) as session:
        # ---------------------------------------------------
        # 1) Generate Check-in Transactions
        # ---------------------------------------------------
        for c in checkins:
            poi_name = poi_lookup.get(c["poi_id"], {}).get("name", "Địa điểm")

            # Check duplicate
            exists = session.scalar(
                select(Transaction).where(Transaction.code == c["receipt_no"])
            )

            if not exists:
                code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
                created_at = datetime.fromisoformat(c["created_at"])

                session.add(Transaction(
                    title=f"Check-in tại {poi_name}",
                    amount=100,
                    type="positive",
                    created_at=created_at,
                    user_id=c["user_id"],
                    code=code
                ))

        session.commit()
        print("✅ Transactions from Check-ins inserted.")

        # ---------------------------------------------------
        # 2) Generate Daily Reward Transactions
        # ---------------------------------------------------
        for u in users:
            remain = u["total_eco_points"] - u["check_ins"] * 100

            # Mỗi daily reward = 10 điểm
            num_rewards = remain // 10 if remain > 0 else 0

            if num_rewards > 0:
                for _ in range(num_rewards):
                    # Sinh ngày ngẫu nhiên trong 3 tháng (9, 10, 11) trước ngày 20/11
                    month = random.choice([9, 10, 11])
                    if month == 11:
                        day = random.randint(1, 19)
                    else:
                        day = random.randint(1, 28)  # tránh lỗi ngày 30/31 không hợp lệ

                    created_at = datetime(2025, month, day)

                    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

                    session.add(Transaction(
                        title="Điểm danh hàng ngày",
                        amount=10,
                        type="positive",
                        created_at=created_at,
                        user_id=u["id"],
                        code=code
                    ))

        session.commit()
        print("🎁 Daily Rewards inserted.")
        print("✅ Seed Transaction Completed.")


# --- Main ---
if __name__ == "__main__":
    seed_maps_and_pois("app/data/map.json", "app/data/poi.json")
    seed_users("app/data/users.json")
    seed_checkins("app/data/checkins.json")
    seed_journals("app/data/journals.json")
    seed_transactions("app/data/checkins.json", "app/data/users.json", "app/data/poi.json")
