import json
from sqlmodel import Session
from app.db.database import engine
from app.models.map import Map
from app.models.poi import POI

def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

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

if __name__ == "__main__":
    seed_maps_and_pois()
