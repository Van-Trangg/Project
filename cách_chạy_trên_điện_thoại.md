-Dùng lệnh sau để chạy backend: uvicorn app.main:app --host 0.0.0.0 --port 8000
-Trong thư mục frontend, tạo file .env.development.local: điền VITE_API_BASE=http://<IP_cua_toi>:8000 
  Kiểm tra IP = ipconfig, thay IP trong phần IPv4 vào link trên
-Nếu vẫn chưa chạy được, mở cmd với quyền admin:
  + netsh advfirewall firewall add rule name="FastAPI" dir=in action=allow protocol=TCP localport=8000 
  + netsh advfirewall firewall add rule name="Vite" dir=in action=allow protocol=TCP localport=5173
  + Để đảm bảo an toàn, có thể xóa bằng lệnh: netsh advfirewall firewall delete rule name="FastAPI" và netsh advfirewall firewall delete rule name="Vite"
-Nếu vẫn chưa chạy được, có thể Windows chặn Private Network discovery:
  +Mở Settings → Network & Internet
    +Chọn Properties của mạng đang dùng, đặt Network profile = Private
  +Mở Control Panel → Network and Sharing Center → Advanced sharing settings
    +Bật:  Turn on network discovery và Turn on file and printer sharing
  + Sau khi test xong, có thể khôi phục cài đặt cũ để đảm bảo an toàn.
Các lệnh trên đều không có quá nhiều rủi ro.
