from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.journal import Journal
from app.schemas.journal_schema import JournalCreate

router = APIRouter()

@router.get("")
def list_journals(db: Session = Depends(get_db)):
    return db.query(Journal).all()

@router.post("")
def create_journal(payload: JournalCreate, db: Session = Depends(get_db)):
    journal = Journal(**payload.dict(), author_id=1)  # TODO: bind to auth user
    db.add(journal)
    db.commit()
    db.refresh(journal)
    return journal

@router.get("/{journal_id}")
def get_journal(journal_id: int, db: Session = Depends(get_db)):
    journal = db.get(Journal, journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    return journal

@router.delete("/{journal_id}")
def delete_journal(journal_id: int, db: Session = Depends(get_db)):
    journal = db.get(Journal, journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    db.delete(journal)
    db.commit()
    return {"ok": True}