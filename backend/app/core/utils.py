# app/core/utils.py
import random
import string

def generate_unique_code(length=6) -> str:
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=length))

def get_display_name(user) -> str:
    """
    Logic hiển thị tên: Full Name -> Nickname -> Masked Email -> Ẩn danh
    """
    # 1. Ưu tiên Full Name
    if user.full_name and user.full_name.strip():
        return user.full_name
    
    # 2. Tiếp theo là Nickname
    if user.nickname and user.nickname.strip():
        return user.nickname
        
    # 3. Nếu chỉ có Email -> Che bớt
    if user.email:
        parts = user.email.split('@')
        if len(parts) == 2:
            name_part = parts[0]
            domain_part = parts[1]
            if len(name_part) > 3:
                masked_name = name_part[:3] + "***"
            else:
                masked_name = "***"
            return f"{masked_name}@{domain_part}"
            
    return "Người dùng ẩn danh"