from fastapi import APIRouter, HTTPException, Query
from app.core.security import TokenDep
from app.db.database import DbDep
from app.models.journal import Journal
from app.schemas.journal_schema import JournalCreate, JournalUpdate

router = APIRouter()

@router.get("")
def list_journals(
    db: DbDep,
):
    return db.query(Journal).all()

@router.get("/my")
def list_my_journals(
    db: DbDep,
    user_id: TokenDep,
    location_id: int = Query(None),
):
    filters = [Journal.author_id == int(user_id)]
    if location_id is not None:
        filters.append(Journal.location_id == location_id)
    query = db.query(Journal).filter(*filters).order_by(Journal.created_at.desc())
    return query.all()

@router.post("")
def create_journal(
    payload: JournalCreate,
    db: DbDep,
    user_id: TokenDep,
):
    journal = Journal(**payload.dict(), author_id=int(user_id))
    db.add(journal)
    db.commit()
    db.refresh(journal)
    return journal

@router.put("/{journal_id}")
def update_journal(
    journal_id: int,
    payload: JournalUpdate,
    db: DbDep,
    user_id: TokenDep,
):
    journal = db.get(Journal, journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    if str(journal.author_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this journal")
    for key, value in payload.dict().items():
        setattr(journal, key, value)
    db.commit()
    db.refresh(journal)
    return journal

@router.get("/{journal_id}")
def get_journal(
    journal_id: int,
    db: DbDep,
    user_id: TokenDep,
):
    journal = db.get(Journal, journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    if str(journal.author_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this journal")
    return journal

@router.delete("/{journal_id}")
def delete_journal(
    journal_id: int,
    db: DbDep,
    user_id: TokenDep,
):
    journal = db.get(Journal, journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    if str(journal.author_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this journal")
    db.delete(journal)
    db.commit()
    return {"ok": True}
