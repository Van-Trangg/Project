
from fastapi import APIRouter
from app.core.file import ImagesUploadDep, upload_file
from app.core.security import TokenDep

router = APIRouter()

@router.post("/upload-images/", response_model=list[str])
def upload_images(image_upload: ImagesUploadDep, _: TokenDep):
    return [upload_file(content=image.content, filename=image.filename) for image in image_upload]
