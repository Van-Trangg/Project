from fastapi import APIRouter
from app.schemas import home_schema # Import schema (camelCase) mới

router = APIRouter()

# BƯỚC SỬA LỖI: Xóa 'response_model_by_alias=True'
@router.get(
    "/", 
    response_model=home_schema.HomeDataResponse 
)
def get_home_data():
    """
    Cung cấp dữ liệu GIẢ LẬP (hardcoded)
    khớp với cấu trúc (schema) mà frontend (Home.jsx) mong đợi.
    """
    
    # BƯỚC SỬA LỖI: Dùng camelCase trong mock_data
    mock_data = {
        "userName": "HEHEHEHEHEHE", # Đã đổi
        "ecopoints": 6969,
        "badges": 54,
        "rank": 1,
        "checkIns": 3, # Đã đổi
        "currentTitle": "Friend of the Trees", # Đã đổi
        "progressCurrent": 1600, # Đã đổi
        "progressMax": 1000, # Đã đổi
        "dailyStreak": 13, # Đã đổi
        "dailyRewards": [ # Đã đổi
            { "date": "25/10", "points": 10, "claimed": True, "isToday": False },
            { "date": "26/10", "points": 10, "claimed": False, "isToday": True },
            { "date": "27/10", "points": 10, "claimed": False, "isToday": False },
            { "date": "28/10", "points": 10, "claimed": False, "isToday": False },
        ]
    }
    
    # FastAPI sẽ kiểm tra xem mock_data (camelCase)
    # có khớp với schema (camelCase) không
    return mock_data