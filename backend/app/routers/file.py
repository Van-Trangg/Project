
from fastapi import APIRouter, Depends
from app.core.file import ImagesUploadDep, upload_file
from app.core.security import get_current_user as TokenDep
from app.models.user import User
router = APIRouter()

@router.post("/upload-images/", response_model=list[str])
def upload_images(
    image_upload: ImagesUploadDep, 
    _: User = Depends(TokenDep) 
):
    return [upload_file(content=image.content, filename=image.filename) for image in image_upload]
