import json
from pathlib import Path
from google import genai
from app.core.config import settings
import re

client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Load POI trực tiếp
POI_PATH = Path(__file__).parent.parent / "data" / "poi.json"

with open(POI_PATH, "r", encoding="utf-8") as f:
    POI_DATA = json.load(f)


SYSTEM_PROMPT = """
Bạn là chuyên gia gợi ý du lịch xanh tại Việt Nam.

NGUYÊN TẮC:
- Luôn trả lời bằng tiếng Việt.
- Chỉ được chọn 1 và chỉ 1 địa điểm từ danh sách.
- Không được bịa địa điểm.
- Trả lời ngắn gọn: 1–2 câu.
- Không trả về bullet point, không markdown, không ký tự đặc biệt.
- Nếu người dùng follow-up, dùng lịch sử để trả lời chính xác hơn.
"""


def clean_text(text: str) -> str:
    """Làm sạch câu trả lời để frontend luôn nhận plain text."""
    
    if not text:
        return ""

    # Loại bỏ markdown *, -, +, •, ###
    text = re.sub(r"[*•+\-#]+", " ", text)

    # Loại bỏ các dòng trống
    text = "\n".join([line.strip() for line in text.split("\n") if line.strip()])

    # Giới hạn tối đa 2 câu (để chắc chắn ngắn gọn)
    sentences = re.split(r"[.!?]\s+", text)
    if len(sentences) > 2:
        text = ". ".join(sentences[:2]) + "."

    # Xóa khoảng trắng dư
    text = re.sub(r"\s+", " ", text).strip()

    return text


def generate_reply(history, user_message=None):
    full_prompt = SYSTEM_PROMPT + "\n"

    # Thêm dữ liệu POI
    full_prompt += f"Dưới đây là danh sách địa điểm được phép sử dụng:\n{POI_DATA}\n\n"

    # Thêm lịch sử hội thoại
    for h in history:
        full_prompt += f"{h['role'].upper()}: {h['content']}\n"

    # Thêm câu hỏi hiện tại
    if user_message:
        full_prompt += f"USER: {user_message}\n"

    full_prompt += "ASSISTANT: "

    # Gọi Gemini
    result = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=full_prompt
    )

    raw_text = result.text

    # Làm sạch câu trả lời
    cleaned = clean_text(raw_text)

    return cleaned
