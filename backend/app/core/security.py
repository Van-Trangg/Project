from datetime import datetime, timedelta
from typing import Annotated, Optional
from fastapi import Depends, HTTPException
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = {"sub": subject, "iat": datetime.utcnow()}
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_access_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload.get("sub")
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        ) from e
    
def get_current_user_id(
    auth_payload: Annotated[HTTPAuthorizationCredentials, Depends(HTTPBearer(auto_error=True))]
) -> str:
    return decode_access_token(auth_payload.credentials)

TokenDep = Annotated[str, Depends(get_current_user_id)]
