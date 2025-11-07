from pathlib import Path
import os
from typing import Annotated, NamedTuple
from uuid import uuid4

from fastapi import Depends, File, HTTPException, UploadFile

class FileUpload(NamedTuple):
    filename: str
    content: bytes

def _get_root(marker=".git"):
    path = Path(__file__).resolve()
    for parent in path.parents:
        if (parent / marker).exists():
            return parent
    raise RuntimeError(f"Project root with marker '{marker}' not found.")

ROOT = _get_root()
UPLOAD_PATH = ROOT / "backend/uploads"
RELATIVE_PATH = "./backend/uploads"

os.makedirs(UPLOAD_PATH, exist_ok=True)

def upload_file(content: bytes, filename: str) -> str:
    file_path = UPLOAD_PATH / filename
    with open(file_path, "wb") as buffer:
        buffer.write(content)
    return f"{RELATIVE_PATH}/{filename}"

def get_images_upload(
    files: Annotated[list[UploadFile], File(...)]
) -> list[FileUpload]:
    result: list[FileUpload] = []
    for file in files:
        if (
            not file.content_type
            or not file.content_type.startswith("image/")
            or not file.filename
        ):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image file: {file.filename if file.filename else 'unknown'}",
            )
        
        ext = file.filename.split(".")[-1]
        filename = f"{uuid4().hex}.{ext}"
        content = file.file.read()
        result.append(FileUpload(content=content, filename=filename))

    return result

ImagesUploadDep = Annotated[list[FileUpload], Depends(get_images_upload)]
