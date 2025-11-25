import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HowToEarn.css';
import overview1 from '../public/Onboarding-overview-1.png'

export default function WelcomeScreen() {
  const navigate = useNavigate();

  // Hàm xử lý khi bấm nút
  const handleJoin = () => {
    // Logic kiểm tra đăng nhập hoặc chuyển hướng
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="welcome-root">
      <div className="welcome-content fade-in">
        
        {/* Phần Chữ */}
        <div className="welcome-text-group">
          <h2 className="welcome-subtitle">Cách nhận điểm</h2>
        </div>

        {/* Phần Ảnh */}
        <div className="welcome-image-wrap">
          <img 
            src={overview1} 
            alt="Welcome to GreenJourney" 
            className="welcome-image" 
          />
        </div>

        {/* Nút Tham Gia */}
        <div className="welcome-cta-wrap">
          <button className="welcome-cta" onClick={() => navigate('/reward')}>
            Tham gia ngay
          </button>
        </div>

      </div>
    </div>
  );
}