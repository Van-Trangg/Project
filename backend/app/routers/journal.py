from typing import Dict, List
from datetime import date
from fastapi import APIRouter, HTTPException, Query, Depends 
from app.db.database import DbDep
from app.models.journal import Journal
from app.models.poi import POI
from app.schemas.journal_schema import JournalByDay, JournalByPOI, JournalCreate, JournalOut, JournalSummary, JournalUpdate
from app.core.security import get_current_user
from app.models.user import User
from sqlalchemy.orm import joinedload

router = APIRouter()

CurrentUser = Depends(get_current_user)

@router.get("", response_model=list[JournalOut])
def list_journals(
    db: DbDep,
):
    return db.query(Journal).all()

@router.get("/by-poi/", response_model=list[JournalByPOI])
def list_journals_by_poi(
    db: DbDep,
    current_user: User = CurrentUser,
    map_id: int = Query(None),
):
    query = (
        db.query(Journal)
        .options(joinedload(Journal.poi))
        .filter(Journal.author_id == current_user.id)
    )
    
    if map_id is not None:
        query = query.filter(Journal.poi.has(POI.map_id == map_id))
    
    journals_by_user = query.order_by(Journal.created_at.desc()).all()

    if not journals_by_user:
        return []

    pois_map: Dict[int, POI] = {}
    journals_by_poi_map: Dict[int, List[Journal]] = {}

    for journal in journals_by_user:
        poi_id = journal.poi_id

        if poi_id not in pois_map:
            pois_map[poi_id] = journal.poi

        if poi_id not in journals_by_poi_map:
            journals_by_poi_map[poi_id] = []
            
        journals_by_poi_map[poi_id].append(journal)

    result_list = []

    for poi_id, journals in journals_by_poi_map.items():
        poi = pois_map[poi_id]
        
        journals_by_day: Dict[date, List[JournalSummary]] = {}

        for journal in journals:
            journal_date = journal.created_at.date()
            
            # Normalize the emotion value to title case
            normalized_emotion = journal.emotion.title() if journal.emotion else "Neutral"
            
            summary = JournalSummary(
                id=journal.id,
                time=journal.created_at.strftime("%I:%M %p"), 
                emotion=normalized_emotion,  # Use the normalized value
                content=journal.content,
                images=journal.images,
            )

            if journal_date not in journals_by_day:
                journals_by_day[journal_date] = []
            
            journals_by_day[journal_date].append(summary)

        entries_by_day = []
        for day_date in sorted(journals_by_day.keys(), reverse=True):
            day_entry = JournalByDay(
                day=day_date.strftime("%Y-%m-%d"), 
                smallEntries=journals_by_day[day_date]
            )
            entries_by_day.append(day_entry)

        poi_summary = JournalByPOI(
            id=poi.id,
            title=poi.name,
            description=poi.description[:100] + "...", 
            longDescription=poi.description, 
            image=poi.image or "",
            entries=entries_by_day
        )
        result_list.append(poi_summary)

    return result_list
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

    data = payload.dict(exclude_unset=True)

    # Nếu FE không gửi created_at → dùng thời gian hiện tại
    if data.get("created_at") is None:
        from datetime import datetime
        data["created_at"] = datetime.utcnow()

    journal = Journal(**data, author_id=current_user.id)

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