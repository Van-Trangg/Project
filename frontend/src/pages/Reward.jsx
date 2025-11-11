// src/pages/Rewards.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Reward.css'
// URL ảnh nền (thay bằng ảnh của bạn)
const headerImageUrl = 'https://images.unsplash.com/photo-1547036322-3860f0e37d12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTg1fDB8MXxzZWFyY2h8MTB8fGZvbGlhZ2V8ZW58MHx8fHwxNzMwNzIzNDI1fDA&ixlib=rb-4.0.3&q=80&w=1080';

export default function Rewards() {
  const navigate = useNavigate();

  // Dữ liệu giả (hardcoded) cho phần History
  const historyData = [
    { id: 1, title: 'Điểm danh', amount: 123, type: 'positive' },
    { id: 2, title: 'Vouncher 10%', amount: -123, type: 'negative' },
    { id: 3, title: 'Trồng cây', amount: -500, type: 'negative' },
    { id: 4, title: 'Check-in công viên', amount: 50, type: 'positive' },
  ];

  // Dữ liệu giả cho phần Promotions
  const promoData = [
    { id: 1, title: 'Mã giảm giá 50% cho vé tháng', price: '10.000' },
    { id: 2, title: 'Mã giảm giá 10% vé xe buýt', price: '1.000' },
  ];

  return (
    <div className="rewards-page">
      
      {/* === PHẦN ẢNH NỀN VÀ HEADER === */}
      <div className="rewards-header-image" style={{ backgroundImage: `url(${headerImageUrl})` }}>
        <div className="header-overlay">
          {/* Bạn có thể dùng icon thật thay cho chữ '<' */}
          <span className="back-arrow" onClick={() => navigate(-1)}>&lt;</span>
          <h1>Rewards</h1>
        </div>
      </div>

      {/* === PHẦN NỘI DUNG CHÍNH (Thẻ và Lịch sử) === */}
      <div className="rewards-main-content">

        {/* --- THẺ BALANCE (Được kéo đè lên ảnh) --- */}
        <div className="balance-card">
          <span className="balance-title">Balance</span>
          <div className="balance-amount">
            <h2>3.123</h2>
            <span className="leaf-icon">🍃</span>
          </div>
          <div className="action-buttons">
            <button className="btn-secondary">How to earn</button>
            <button className="btn-primary" onClick={() => navigate('/leaderboard')}>Leaderboard</button>
          </div>
          <button className="btn-plant">Planting Trees</button>
        </div>

        {/* --- LỊCH SỬ GIAO DỊCH --- */}
        <div className="history-section">
          <div className="section-header">
            <h3>History</h3>
            <a href="#" className="see-more">See more</a>
          </div>
          <div className="history-list">
            {historyData.map((item) => (
              <div key={item.id} className="history-item">
                <div className="item-icon-placeholder"></div> {/* Placeholder cho icon */}
                <span className="item-text">{item.title}</span>
                <span className={`item-value ${item.type}`}>
                  {item.type === 'positive' ? '+' : ''}{item.amount} 🍃
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* --- KHUYẾN MÃI --- */}
        <div className="promo-section">
          <div className="section-header">
            <h3>Promotions and Discount</h3>
          </div>
          <div className="promo-list">
            {promoData.map((promo) => (
              <div key={promo.id} className="promo-card">
                <div className="promo-icon-placeholder"></div> {/* Placeholder cho logo HCMC Metro */}
                <span className="promo-text">{promo.title}</span>
                <span className="promo-price">{promo.price} 🍃</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* === THANH ĐIỀU HƯỚNG DƯỚI CÙNG === */}
      {/* (Giả sử đây là component cố định) */}
      <nav className="bottom-nav">
        <button className="nav-item active" onClick={() => navigate('/reward')}>
          <span>Rewards</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/journal')}>
          <span>Journal</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/home')}>
          <span>Home</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/map')}>
          <span>Map</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/leaderboard')}>
          <span>Leaderboard</span>
        </button>
      </nav>
    </div>
  );
}