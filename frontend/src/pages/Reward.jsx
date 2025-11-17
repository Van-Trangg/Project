// src/pages/Reward.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Reward.css'; // <--- Vẫn import file CSS như cũ
import ecopointsIcon from '../public/ecopoint.png'; 
import rewardOutlineIcon from '../public/reward-outline.png';
import rewardSolidIcon from '../public/reward-solid.png';
import homeOutlineIcon from '../public/home-outline.png';
import homeSolidIcon from '../public/home-solid.png';
import journalOutlineIcon from '../public/journal-outline.png';
import journalSolidIcon from '../public/journal-solid.png';
import mapOutlineIcon from '../public/map-outline.png';
import mapSolidIcon from '../public/map-solid.png'
import leaderboardOutlineIcon from '../public/leaderboard-outline.png';
import leaderboardSolidIcon from '../public/leaderboard-solid.png'

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
            <img src={ecopointsIcon} alt="leaf" className="balance-leaf-icon" />
          </div>
          <div className="action-buttons">
            <button className="btn-secondary">How to earn</button>
            <button className="btn-primary" onClick={() => navigate('/leaderboard')}>Leaderboard</button>
          </div>
          <button className="btn-plant" onClick={() => navigate('/planting-trees')}>Planting Trees</button>
        </div>

        {/* --- LỊCH SỬ GIAO DỊCH --- */}
        <div className="history-section">
          <div className="section-header">
            <h3>History</h3>
            <span 
              className="see-more" 
              onClick={() => navigate('/history')}>See more
            </span>
          </div>
          <div className="history-list">
            {historyData.map((item) => (
              <div key={item.id} className="history-item">
                <div className="item-icon-placeholder"></div>
                <span className="item-text">{item.title}</span>
                <span className={`item-value ${item.type}`}>
                  {item.type === 'positive' ? '+' : ''}{item.amount}
                  <div>
                  <img src={ecopointsIcon} alt="leaf" className="leaf-icon" />
                  </div>
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
              <div 
                key={promo.id} 
                className="promo-card" 
                onClick={() => navigate('/detail')}
              >
                <div className="promo-icon-placeholder"></div>
                <span className="promo-text">{promo.title}</span>
                <span className="promo-price">{promo.price}
                  <div>
                  <img src={ecopointsIcon} alt="leaf" className="promo-leaf-icon" />
                  </div>
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* === THANH ĐIỀU HƯỚNG DƯỚI CÙNG === */}
            <nav className="bottom-nav">
              <button className="nav-item active" onClick={() => navigate('/reward')}>
                <img src={rewardOutlineIcon} alt="Rewards" className="icon-outline" />
                <img src={rewardSolidIcon} alt="Rewards" className="icon-solid" />
                <span>Rewards</span>
              </button>
              <button className="nav-item" onClick={() => navigate('/journal')}>
                <img src={journalOutlineIcon} alt="Journal" className="icon-outline" />
                <img src={journalSolidIcon} alt="Journal" className="icon-solid" />
                <span>Journal</span>
              </button>
              <button className="nav-item" onClick={() => navigate('/home')}>
                <img src={homeOutlineIcon} alt="Home" className="icon-outline" />
                <img src={homeSolidIcon} alt="Home" className="icon-solid" />
                <span>Home</span>
              </button>
              <button className="nav-item" onClick={() => navigate('/map')}>
                <img src={mapOutlineIcon} alt="Map" className='icon-outline' />
                <img src={mapSolidIcon} alt='Map' className='icon-solid' />
                <span>Map</span>
              </button>
              <button className="nav-item" onClick={() => navigate('/leaderboard')}>
                <img src={leaderboardOutlineIcon} alt='Leaderboard' className='icon-outline' />
                <img src={leaderboardSolidIcon} alt='Leaderboard' className='icon-solid' />
                <span>Leaderboard</span>
              </button>
            </nav>
    </div>
  );
}