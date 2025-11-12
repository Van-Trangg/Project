// src/pages/Reward.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Reward.css'; // <--- Vẫn import file CSS như cũ

export default function Reward() {
  const navigate = useNavigate();

  // Dữ liệu giả (hardcoded) cho phần History
  const historyData = [
    { id: 1, title: 'Điểm danh', amount: 123, type: 'positive' },
    { id: 2, title: 'Vouncher 10%', amount: -123, type: 'negative' },
  ];

  // Dữ liệu giả cho phần Promotions
  const promoData = [
    { id: 1, title: 'Mã giảm giá 50% cho vé tháng', price: '10.000' },
    { id: 2, title: 'Mã giảm giá 10% vé xe buýt', price: '1.000' },
  ];

  return (
    <div className="rewards-page">
      
      <div className="header-overlay">
          <span className="back-arrow" onClick={() => navigate(-1)}>&lt;</span>
          <h1>Rewards</h1>
        </div>

      {/* === PHẦN NỘI DUNG CHÍNH (Thẻ và Lịch sử) === */}
      <div className="rewards-main-content">

        {/* --- THẺ BALANCE (Đây là "khung bo góc") --- */}
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
                <div className="item-icon-placeholder"></div>
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
                <div className="promo-icon-placeholder"></div>
                <span className="promo-text">{promo.title}</span>
                <span className="promo-price">{promo.price} 🍃</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* === THANH ĐIỀU HƯỚNG DƯỚI CÙNG === */}
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