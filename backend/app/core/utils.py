import random
import string

def generate_unique_code(length=6) -> str:
    """Sinh mã ngẫu nhiên gồm chữ hoa và số, VD: A1B2C3"""
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=length))