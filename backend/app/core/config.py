from pydantic import BaseModel
import os

class Settings(BaseModel):
    DB_URL: str = os.getenv("DB_URL", "sqlite:///./app/app.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
settings = Settings()