## Cách chạy lần đầu (setup lần đầu tiên)

### Frontend - Updated 
cd frontend
npm install
npm install leaflet react-leaflet@4 
npm run dev -- --host


### Backend (FastAPI + SQLite)

**Nếu dùng Anaconda:**
```bash
cd backend
conda create -n greentravel python=3.11 -y
conda activate greentravel
pip install -r requirements.txt
python seed.py (tùy chọn)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

cd backend
python -m venv venv
# Kích hoạt môi trường ảo
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate
pip install -r requirements.txt
python seed.py (tùy chọn)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000


## Cách chạy lần sau

cd backend
# Nếu dùng Anaconda
conda activate greentravel
# Nếu dùng venv
venv\Scripts\activate  (Windows)
source venv/bin/activate  (macOS/Linux)
uvicorn app.main:app --reload

cd frontend
npm run dev -- --host


Kiểm tra hoạt động
Frontend: 
 Mở http://localhost:5173 → Trang Home / Map / Leaderboard / Journal
 Trên điện thoại (kết nối cùng wi-fi với máy tính) thay localhost = IP máy tính
Backend:
 Mở http://localhost:8000
