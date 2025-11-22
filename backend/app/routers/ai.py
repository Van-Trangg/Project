from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.ai_service import generate_reply
from app.crud.conversation import get_history, add_message, clear_history
from app.schemas.conversation_schema import ChatRequest, ChatResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest,
         db: Session = Depends(get_db),
         current_user=Depends(get_current_user)):
    
    user_id = current_user.id

    # 1️⃣ Lấy lịch sử hội thoại của user (nếu có)
    history_db = get_history(db, user_id)

    # chuyển lịch sử DB → dạng Gemini hiểu
    history = [
        {"role": h.role, "content": h.content}
        for h in history_db
    ]

    # 2️⃣ Thêm message hiện tại vào history (rất quan trọng)
    history.append({
        "role": "user",
        "content": payload.message
    })

    # 3️⃣ Gọi Gemini — truyền cả history
    answer = generate_reply(history=history)

    # 4️⃣ Lưu user message và assistant message
    add_message(db, user_id, "user", payload.message)
    add_message(db, user_id, "assistant", answer)

    return ChatResponse(answer=answer)


@router.post("/reset")
def reset_chat(db: Session = Depends(get_db),
               current_user=Depends(get_current_user)):
    clear_history(db, current_user.id)
    return {"status": "ok", "message": "Đã xóa lịch sử hội thoại."}
