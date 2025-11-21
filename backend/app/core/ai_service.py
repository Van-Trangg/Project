import json
from pathlib import Path
from google import genai
from app.core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Load POI trực tiếp
POI_PATH = Path(__file__).parent.parent / "data" / "poi.json"

with open(POI_PATH, "r", encoding="utf-8") as f:
    POI_DATA = json.load(f)


SYSTEM_PROMPT = """
Bạn là chuyên gia gợi ý du lịch xanh tại Việt Nam.
- Luôn trả lời bằng tiếng Việt.
- Không bịa địa điểm ngoài danh sách.
- Trả lời ngắn gọn, thân thiện.
- Hiểu và xử lý câu follow-up dựa trên lịch sử hội thoại.
"""


def generate_reply(history, user_message=None):
    full_prompt = SYSTEM_PROMPT + "\n"

    # thêm dữ liệu POI
    full_prompt += f"Danh sách địa điểm được phép sử dụng:\n{POI_DATA}\n\n"

    # thêm lịch sử hội thoại
    for h in history:
        full_prompt += f"{h['role'].upper()}: {h['content']}\n"

    # thêm câu hỏi hiện tại
    if user_message:
        full_prompt += f"USER: {user_message}\n"

    full_prompt += "ASSISTANT: "

    result = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=full_prompt
    )

    return result.text
