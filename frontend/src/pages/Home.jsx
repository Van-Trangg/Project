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
      setLoading(true);
      setError(null);
      
      try {
        // 1. Lấy token mà file Login.jsx đã lưu
        const token = localStorage.getItem('access_token'); // <-- Tên key LẤY TỪ LOGIN.JSX

        // 2. Kiểm tra xem đã đăng nhập chưa
        if (!token) {
          setError("Bạn chưa đăng nhập. Đang chuyển về trang Login...");
          setLoading(false);
          // Chuyển về trang login sau 2 giây
          setTimeout(() => navigate('/login'), 2000); 
          return;
        }

        // 3. Gửi token trong Headers (ĐÂY LÀ PHẦN SỬA LỖI 401)
        const response = await fetch('http://127.0.0.1:8000/home', {
          method: 'GET',
          headers: {
            // "Giơ thẻ" (token) cho "người gác cổng"
            'Authorization': `Bearer ${token}` 
          }
        }); 

        if (!response.ok) {
          if (response.status === 401) {
            // Lỗi 401 (Token sai hoặc hết hạn)
            setError("Token không hợp lệ. Vui lòng đăng nhập lại.");
            localStorage.removeItem('access_token'); // Xóa token hỏng
            setTimeout(() => navigate('/login'), 2000);
          } else {
            // Các lỗi khác (500, v.v.)
            throw new Error('Lỗi mạng hoặc server (Backend sập?)');
          }
        } else {
          // THÀNH CÔNG!
          const data = await response.json();
          setData(data); 
        }

      } catch (error) {
        console.error("Không thể gọi API backend:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [navigate]);// Chỉ chạy 1 lần

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
      <div className="profile-avatar" onClick={() => navigate('/profile')}>
          <span className="avatar-placeholder"></span> 
      </div>
      <div className="home-header">
        <h1>Good morning, {userName}</h1>
        <p>Up for a new adventure today?</p>
      </div>

      {/* === LƯỚI THỐNG KÊ 2x2 === */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/reward')}>
          <div className="stat-card-header">
            <span className="title">Ecopoints</span>
          </div>
          <div className="value">{ecopoints.toLocaleString('de-DE')}</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/profile')}>
          <div className="stat-card-header">
            <span className="title">Badges</span>
            </div>
          <div className="value">{badges}</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/leaderboard')}>
          <div className="stat-card-header">
            <span className="title">Rank</span>
            </div>
          <div className="value">#{rank}</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/journal')}>
          <div className="stat-card-header">
            <span className="title">Check-ins</span>
            </div>
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
        <button className="nav-item" onClick={() => navigate('/reward')}>
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