import httpx
import os

MOCK_THIRD_PARTY_URL = os.getenv(
    "MOCK_THIRD_PARTY_URL",
    "http://localhost:5500/promotion/redeem"
)

def send_to_mock(user_id: int, promotion_title: str, code: str):
    payload = {
        "user_id": user_id,
        "promotion_title": promotion_title,
        "code": code,
    }

    try:
        with httpx.Client(timeout=5) as client:
            response = client.post(MOCK_THIRD_PARTY_URL, json=payload)
            response.raise_for_status()
            return response.json()

    except httpx.RequestError as e:
        print(f"[Mock API] ❌ Request error: {e}")
        return None

    except httpx.HTTPStatusError as e:
        print(f"[Mock API] ❌ HTTP error: {e.response.status_code} - {e.response.text}")
        return None
