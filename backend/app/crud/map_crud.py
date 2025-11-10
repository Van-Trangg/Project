from app.models.map import Map
from app.models.poi import POI

def list_maps(db):

    return db.query(Map).all()

def list_pois_by_map(db, map_id: int):
    """Trả về danh sách các POI thuộc một bản đồ cụ thể."""
    return db.query(POI).filter(POI.map_id == map_id).all()

def get_map(db, map_id: int):
    """Lấy thông tin một map theo ID."""
    return db.query(Map).filter(Map.id == map_id).first()
