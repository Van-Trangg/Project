from typing import Dict, List
from datetime import date
from fastapi import APIRouter, HTTPException, Query, Depends 
from app.db.database import DbDep
from app.models.checkin import Checkin
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
    poi_query = (db.query(POI)
                 .join(Checkin, POI.id == Checkin.poi_id)
                 .filter(Checkin.user_id == current_user.id))
    if map_id is not None:
        poi_query = poi_query.filter(POI.map_id == map_id)
        
    all_pois = poi_query.all()

    if not all_pois:
        return []

    poi_ids = [poi.id for poi in all_pois]

    journals_query = (
        db.query(Journal)
        .filter(
            Journal.author_id == current_user.id,
            Journal.poi_id.in_(poi_ids)
        )
        .order_by(Journal.created_at.desc())
        .options(joinedload(Journal.poi))
    )
    journals_by_user = journals_query.all()

    journals_by_poi_map: Dict[int, List[Journal]] = {}
    for journal in journals_by_user:
        poi_id = journal.poi_id
        if poi_id not in journals_by_poi_map:
            journals_by_poi_map[poi_id] = []
        journals_by_poi_map[poi_id].append(journal)
    
    result_list = []

    for poi in all_pois:
        journals_for_poi: List[Journal] = journals_by_poi_map.get(poi.id, [])
        
        journals_by_day: Dict[date, List[JournalSummary]] = {}

        for journal in journals_for_poi:
            journal_date = journal.created_at.date()
            normalized_emotion = journal.emotion.title() if journal.emotion else "Neutral" 
            
            summary = JournalSummary(
                id=journal.id,
                time=journal.created_at.strftime("%I:%M %p"), 
                emotion=normalized_emotion,
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
            description=(poi.description[:100] + "...") if poi.description and len(poi.description) > 100 else (poi.description or ""), 
            longDescription=poi.description or "", 
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
    return {"ok": True}\
    
@router.get("/poi/journals", response_model=JournalByPOI)
def get_poi_journals(
    db: DbDep,
    current_user: User = CurrentUser,
    poi_id: int = Query(..., description="The ID of the POI to retrieve journals for"),
):
    # First verify the user has checked into this POI
    checkin = db.query(Checkin).filter(
        Checkin.user_id == current_user.id,
        Checkin.poi_id == poi_id
    ).first()
    
    if not checkin:
        raise HTTPException(status_code=404, detail="POI not found or user hasn't checked into this POI")
    
    # Get the POI
    poi = db.get(POI, poi_id)
    if not poi:
        # This case is less likely to be hit if the checkin check passes, but it's good practice
        raise HTTPException(status_code=404, detail="POI not found")
    
    # Get all journals for this POI written by the current user
    journals_query = (
        db.query(Journal)
        .filter(
            Journal.author_id == current_user.id,
            Journal.poi_id == poi_id
        )
        .order_by(Journal.created_at.desc())
        .options(joinedload(Journal.poi))
    )
    journals_for_poi = journals_query.all()
    
    # Group journals by day
    journals_by_day: Dict[date, List[JournalSummary]] = {}
    
    for journal in journals_for_poi:
        journal_date = journal.created_at.date()
        normalized_emotion = journal.emotion.title() if journal.emotion else "Neutral" 
        
        summary = JournalSummary(
            id=journal.id,
            time=journal.created_at.strftime("%I:%M %p"), 
            emotion=normalized_emotion,
            content=journal.content,
            images=journal.images,
        )
        
        if journal_date not in journals_by_day:
            journals_by_day[journal_date] = []
        
        journals_by_day[journal_date].append(summary)
    
    # Create entries by day
    entries_by_day = []
    for day_date in sorted(journals_by_day.keys(), reverse=True):
        day_entry = JournalByDay(
            day=day_date.strftime("%Y-%m-%d"), 
            smallEntries=journals_by_day[day_date]
        )
        entries_by_day.append(day_entry)
    
    # Create and return the POI summary
    poi_summary = JournalByPOI(
        id=poi.id,
        title=poi.name,
        description=(poi.description[:100] + "...") if poi.description and len(poi.description) > 100 else (poi.description or ""), 
        longDescription=poi.description or "", 
        image=poi.image or "",
        entries=entries_by_day
    )
    
    return poi_summary