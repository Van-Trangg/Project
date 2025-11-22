from sqlalchemy.orm import Session
from app.models.conversation import Conversation

def add_message(db: Session, user_id: int, role: str, content: str):
    item = Conversation(user_id=user_id, role=role, content=content)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def get_history(db: Session, user_id: int, limit=10):
    msgs = (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id)
        .order_by(Conversation.created_at.desc())
        .limit(limit)
        .all()
    )
    return msgs[::-1]  # đảo ngược thành oldest → newest

def clear_history(db: Session, user_id: int):
    db.query(Conversation).filter(Conversation.user_id == user_id).delete()
    db.commit()
