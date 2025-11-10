import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv
from fastapi import UploadFile


load_dotenv() 


cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

def upload_avatar(file: UploadFile, user_id: int) -> str:
    try:

        result = cloudinary.uploader.upload(
            file.file,
            public_id=str(user_id),  
            folder="avatars",        
            overwrite=True,          
            resource_type="image"    
        )
        
        secure_url = result.get("secure_url")
        if not secure_url:
            raise Exception("Không thể lấy secure_url từ Cloudinary")
            
        return secure_url

    except Exception as e:
        print(f"Lỗi khi tải ảnh lên Cloudinary: {e}")
        raise e