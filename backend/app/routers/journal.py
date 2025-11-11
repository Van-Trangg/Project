from fastapi import APIRouter, HTTPException, Query, Depends 
from app.db.database import DbDep
from app.models.journal import Journal
from app.models.poi import POI
from app.schemas.journal_schema import JournalCreate, JournalOut, JournalUpdate
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

CurrentUser = Depends(get_current_user)

@router.get("", response_model=list[JournalOut])
def list_journals(
    db: DbDep,
):
    return db.query(Journal).all()

@router.get("/my", response_model=list[JournalOut])
def list_my_journals(
    db: DbDep,
    current_user: User = CurrentUser,
    poi_id: int = Query(None),
):
    filters = [Journal.author_id == current_user.id] 
    if poi_id is not None:
        filters.append(Journal.poi_id == poi_id)
    query = db.query(Journal).filter(*filters).order_by(Journal.created_at.desc())
    return query.all()

@router.post("", response_model=JournalOut)
def create_journal(
    payload: JournalCreate,
    db: DbDep,
    current_user: User = CurrentUser,
):
    poi = db.get(POI, payload.poi_id)
    if not poi:
        raise HTTPException(status_code=404, detail="POI not found")
    journal = Journal(**payload.dict(), author_id=current_user.id) 
    db.add(journal)
    db.commit()
    db.refresh(journal)
    return journal

@router.patch("/{journal_id}", response_model=JournalOut)
def update_journal(
    journal_id: int,
    payload: JournalUpdate,
    db: DbDep,
    current_user: User = CurrentUser,
):
    journal = db.get(Journal, journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    if journal.author_id != current_user.id: 
        raise HTTPException(status_code=403, detail="Not authorized to update this journal")
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(journal, key, value)
    db.commit()
    db.refresh(journal)
    return journal

@router.get("/{journal_id}", response_model=JournalOut)
def get_journal(
    journal_id: int,
    db: DbDep,
    current_user: User = CurrentUser,
):
    journal = db.get(Journal, journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    if journal.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this journal")
    return journal

@router.delete("/{journal_id}", response_model=dict)
def delete_journal(
    journal_id: int,
    db: DbDep,
    current_user: User = CurrentUser,
):
    journal = db.get(Journal, journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal not found")
    if journal.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this journal")
    db.delete(journal)
    db.commit()
    return {"ok": True}