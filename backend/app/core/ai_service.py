import json
import re
from pathlib import Path
from google import genai
from app.core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

POI_PATH = Path(__file__).parent.parent / "data" / "poi.json"
POI_DATA = json.load(open(POI_PATH, "r", encoding="utf-8"))


SYSTEM_PROMPT = """
Bạn là chuyên gia gợi ý du lịch xanh tại Việt Nam.

NHIỆM VỤ:
- Nếu người dùng yêu cầu gợi ý địa điểm → chọn đúng 1 POI duy nhất trong danh sách.
- Nếu người dùng chỉ trò chuyện hoặc follow-up không liên quan → response_type = "chat".
- Không được bịa địa điểm.
- Trả lời ngắn gọn, thân thiện.

TRẢ VỀ DẠNG JSON CHUẨN:
{
  "response_type": "recommend" hoặc "chat",
  "poi_name": "Tên POI hoặc null",
  "message": "Câu trả lời hiển thị"
}

KHÔNG TRẢ VỀ markdown, bullet point, hoặc ký tự đặc biệt.
"""


def clean_text(text: str) -> str:
    """Làm sạch văn bản trước khi trả về frontend."""
    if not text:
        return ""

    text = re.sub(r"[*•+\-#]+", " ", text)
    text = " ".join(line.strip() for line in text.split("\n"))
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_json(raw: str):
    """Cố gắng tìm JSON bên trong output Gemini."""
    raw = raw.strip()

    # Nếu raw đã là JSON chuẩn
    try:
        return json.loads(raw)
    except:
        pass

    # Tìm JSON bằng regex
    match = re.search(r"\{.*\}", raw, flags=re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except:
            pass

    # fallback
    return {
        "response_type": "chat",
        "poi_name": None,
        "message": clean_text(raw)
    }


def trim_history(history, max_items=10):
    """Chỉ giữ X message gần nhất để tránh overflow token."""
    if len(history) <= max_items:
        return history
    return history[-max_items:]


def generate_reply(history, user_message=None):
    # trim history
    history = trim_history(history)

    full_prompt = SYSTEM_PROMPT + "\n\n"
    full_prompt += f"Danh sách địa điểm hợp lệ:\n{POI_DATA}\n\n"

    for h in history:
        full_prompt += f"{h['role'].upper()}: {h['content']}\n"

    if user_message:
        full_prompt += f"USER: {user_message}\n"

    full_prompt += "ASSISTANT (trả JSON): "

    # Call Gemini
    result = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=full_prompt
    )

    raw = result.text

    # Parse JSON an toàn
    response = extract_json(raw)

    # Clean lại message
    response["message"] = clean_text(response.get("message", ""))

    # Đảm bảo đủ field
    response.setdefault("response_type", "chat")
    response.setdefault("poi_name", None)

    return response
