from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.ai_service import generate_reply
from app.crud.conversation import get_history, add_message, clear_history
from app.schemas.conversation_schema import ChatRequest, ChatResponse
from app.core.security import get_current_user
from app.models.poi import POI

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest,
         db: Session = Depends(get_db),
         current_user=Depends(get_current_user)):

    user_id = current_user.id


    history_db = get_history(db, user_id)
    history = [{"role": h.role, "content": h.content} for h in history_db]


    ai_response = generate_reply(history, payload.message)


    add_message(db, user_id, "user", payload.message)
    add_message(db, user_id, "assistant", ai_response["message"])


    poi_id = None
    if ai_response["response_type"] == "recommend" and ai_response.get("poi_slug"):
        db_poi = db.query(POI).filter(POI.slug == ai_response["poi_slug"]).first()
        poi_id = db_poi.id if db_poi else None

    return {
        "response_type": ai_response["response_type"],
        "poi_slug": ai_response["poi_slug"],   
        "poi_id": poi_id,
        "message": ai_response["message"]
    }


@router.post("/reset")
def reset_chat(db: Session = Depends(get_db),
               current_user=Depends(get_current_user)):
    clear_history(db, current_user.id)
    return {"status": "ok", "message": "Đã xóa lịch sử hội thoại."}
