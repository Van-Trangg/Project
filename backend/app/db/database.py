from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

engine = create_engine(
    settings.DB_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DB_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Bật foreign key và WAL mode cho SQLite
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.close()

# ⚠️ Import tất cả models ở đây
from app.models import user, journal, leaderboard, reward, location, map, poi, checkin  # noqa

def init_db():
    print("🛠️ Initializing database...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created:", list(Base.metadata.tables.keys()))
