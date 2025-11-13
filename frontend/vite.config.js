import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // 🔥 Cho phép truy cập từ máy khác
    port: 5173,        // Giữ nguyên cổng
    strictPort: true,  // (tùy chọn) để chắc chắn luôn dùng đúng cổng
  },
})
