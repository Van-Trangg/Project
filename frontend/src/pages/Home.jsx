// src/components/Home.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { api } from '../api/apiClient'; // Tắt API thật

// Import CSS cho trang Home
import '../styles/Home.css'; 

// === BẠN CHƯA IMPORT CÁC ICON NÀY ===
// import leafIcon from '../public/icons/leaf.png';
// import treeIcon from '../public/icons/tree-heart.png';
// import sunIcon from '../public/icons/sun.png';


// --- Thêm Mock Data ---
const mockData = {
  userName: "Your Name",
  ecopoints: 3123,
  badges: 54,
  rank: 100,
  checkIns: 3,
  currentTitle: "Friend of the Trees",
  progressCurrent: 1670,
  progressMax: 2000,
  dailyStreak: 23,
  dailyRewards: [
    { date: "25/10", points: 10, claimed: true, isToday: false },
    { date: "26/10", points: 10, claimed: false, isToday: true },
    { date: "27/10", points: 10, claimed: false, isToday: false },
    { date: "28/10", points: 10, claimed: false, isToday: false },
  ]
};
// --- Hết Mock Data ---

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null); // Tạm thời không dùng
  const navigate = useNavigate();

  // Dùng Mock Data thay vì gọi API
  useEffect(() => {
    console.log("Đang dùng mock data!");
    const timer = setTimeout(() => {
      setData(mockData);
    }, 500); // Tải nhanh hơn
    return () => clearTimeout(timer);
  }, []);

  // [CHECK LỖI] Đặt check "null" lên trước là ĐÚNG
  if (!data) return <div className="loading">Loading...</div>;

  // [AN TOÀN] Bây giờ data chắc chắn có
  const {
    userName,
    ecopoints,
    badges,
    rank,
    checkIns,
    currentTitle,
    progressCurrent,
    progressMax,
    dailyStreak,
    dailyRewards = []
  } = data;

  const progressPercent = (progressCurrent / progressMax) * 100;

  return (
    <div className="homepage-body">
      {/* === HEADER CHÀO MỪNG === */}
      <div className="home-header">
        <h1>Good morning, {userName}</h1>
        <p>Up for a new adventure today?</p>
      </div>

      {/* === LƯỚI THỐNG KÊ 2x2 === */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="title">Ecopoints</span>
            {/* [LỖI Ở ĐÂY 1] Biến "leafIcon" không tồn tại 
              Bạn phải comment (vô hiệu hóa) nó đi
            */}
            {/* <img src={leafIcon} alt="Ecopoints" /> */}
          </div>
          <div className="value">{ecopoints.toLocaleString('de-DE')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><span className="title">Badges</span></div>
          <div className="value">{badges}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><span className="title">Rank</span></div>
          <div className="value">#{rank}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><span className="title">Check-ins</span></div>
          <div className="value">{String(checkIns).padStart(2, '0')}</div>
        </div>
      </div>

      {/* === PHẦN TIẾN TRÌNH (PROGRESS) === */}
      <div className="home-section">
        <div className="section-header">
          {/* [LỖI Ở ĐÂY 2] Biến "treeIcon" không tồn tại
          */}
          {/* <img src={treeIcon} alt="Title" /> */}
          <div className="text-content">
            <h3>{currentTitle}</h3>
            <p>Progress until next title</p>
          </div>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {progressCurrent}/{progressMax}
        </div>
      </div>

      {/* === PHẦN THƯỞNG HÀNG NGÀY === */}
      <div className="home-section">
        <div className="section-header">
          {/* [LỖI Ở ĐÂY 3] Biến "sunIcon" không tồn tại
          */}
          {/* <img src={sunIcon} alt="Rewards" /> */}
          <div className="text-content">
            <h3>Daily Rewards</h3>
            <p>Your current streak: {dailyStreak}</p>
          </div>
        </div>
        <div className="horizontal-scroll-list">
          {dailyRewards.map((reward) => (
            <div
              key={reward.date}
              className={`
                reward-card 
                ${reward.isToday ? 'today' : ''}
                ${reward.claimed ? 'claimed' : ''}
              `}
            >
              <span className="points">{reward.points}</span>
              <span className="date">{reward.date}</span>
              {/* [LỖI Ở ĐÂY 4] Biến "leafIcon" không tồn tại
              */}
              {/* <img src={leafIcon} alt="leaf" className="leaf-icon" /> */}
            </div>
          ))}
        </div>
      </div>

      {/* === THANH ĐIỀU HƯỚNG DƯỚI CÙNG (ĐÃ BỎ ICON) === */}
      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/rewards')}>
          <span>Rewards</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/journal')}>
          <span>Journal</span>
        </button>
        <button className="nav-item active" onClick={() => navigate('/home')}>
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