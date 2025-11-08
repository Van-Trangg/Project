// src/components/Home.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css'; 

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // <-- 1. THÊM STATE LOADING
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true); // 2. BẮT ĐẦU LOADING
      setError(null);   // Xóa lỗi cũ
      
      try {
        const response = await fetch('http://127.0.0.1:8000/home'); 

        if (!response.ok) {
          throw new Error('Lỗi mạng hoặc server (Backend sập?)');
        }

        const data = await response.json();
        setData(data); // 3. SET DATA (THÀNH CÔNG)

      } catch (error) {
        console.error("Không thể gọi API backend:", error);
        setError(error.message); // 4. SET LỖI (THẤT BẠI)
      } finally {
        setLoading(false); // 5. LUÔN TẮT LOADING (Dù thành công hay lỗi)
      }
    };

    fetchHomeData();
  }, []); // Chỉ chạy 1 lần

  // --- SỬA LẠI THỨ TỰ CHECK ---

  // 1. Check Loading (Luôn check đầu tiên)
  if (loading) return <div className="loading">Loading...</div>;

  // 2. Check Lỗi (Check thứ 2)
  if (error) return <div className="loading">Lỗi: {error} (Backend của bạn đã chạy chưa?)</div>;

  // 3. Check Data (Check cuối cùng)
  // (Nếu không loading, không lỗi, mà vẫn không có data thì là lỗi)
  if (!data) return <div className="loading">Không có dữ liệu.</div>;


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
        <div className="stat-card" onClick={() => navigate('/rewards')}>
          <div className="stat-card-header">
            <span className="title">Ecopoints</span>
            {/* <img src={leafIcon} alt="Ecopoints" /> */}
          </div>
          <div className="value">{ecopoints.toLocaleString('de-DE')}</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/profile')}>
          <div className="stat-card-header"><span className="title">Badges</span></div>
          <div className="value">{badges}</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/leaderboard')}>
          <div className="stat-card-header"><span className="title">Rank</span></div>
          <div className="value">#{rank}</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/journal')}>
          <div className="stat-card-header"><span className="title">Check-ins</span></div>
          <div className="value">{String(checkIns).padStart(2, '0')}</div>
        </div>
      </div>

      {/* === PHẦN TIẾN TRÌNH (PROGRESS) === */}
      <div className="home-section">
        <div className="section-header">
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