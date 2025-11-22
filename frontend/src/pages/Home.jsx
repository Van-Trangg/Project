import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css'; 

// Import hình ảnh
import ecopointsIcon from '../public/ecopoint.png';
import sunIcon from '../public/sun.png';
import treeIcon from '../public/tree.png';
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

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // URL API gốc
  const API_BASE_URL = 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('access_token');

        if (!token) {
          setError("Bạn chưa đăng nhập. Đang chuyển về trang Login...");
          setLoading(false);
          setTimeout(() => navigate('/login'), 2000); 
          return;
        }

        // Gọi API lấy dữ liệu trang chủ
        const response = await fetch(`${API_BASE_URL}/home`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}` 
          }
        }); 

        if (!response.ok) {
          if (response.status === 401) {
            setError("Token không hợp lệ. Vui lòng đăng nhập lại.");
            localStorage.removeItem('access_token');
            setTimeout(() => navigate('/login'), 2000);
          } else {
            throw new Error('Lỗi mạng hoặc server (Backend sập?)');
          }
        } else {
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
  }, [navigate]);

  // --- RENDERING STATES ---
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="loading">Lỗi: {error}</div>;
  if (!data) return <div className="loading">Không có dữ liệu.</div>;

  const {
    userName,
    avatarUrl,
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

  // --- HÀM XỬ LÝ NHẬN THƯỞNG ---
  const handleClaimReward = async (index) => {
    const selectedReward = data.dailyRewards[index];

    // Chỉ xử lý nếu là "Hôm nay" và "Chưa nhận"
    if (selectedReward.isToday && !selectedReward.claimed) {
      
      // 1. Cập nhật giao diện NGAY LẬP TỨC (Optimistic UI)
      const newData = { ...data };
      newData.dailyRewards[index].claimed = true;
      newData.ecopoints += selectedReward.points; 
      newData.progressCurrent += selectedReward.points;
      
      // [QUAN TRỌNG] Tự tăng streak lên 1 để hiển thị ngay
      newData.dailyStreak += 1; 
      newData.checkIns += 1; // Cập nhật cả số tổng check-in nữa

      setData(newData);

      // 2. Gọi API ngầm để lưu vào Database thật
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/home/claim-reward`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Cập nhật lại toàn bộ thông tin mới nhất từ Server trả về
            setData(prevData => ({
                ...prevData,
                ecopoints: result.new_ecopoints,
                progressCurrent: result.new_progress,
                currentTitle: result.new_title, 
                progressMax: result.new_max,
                // [QUAN TRỌNG] Cập nhật lại streak thật từ backend để đồng bộ
                dailyStreak: result.new_streak,
                checkIns: result.new_streak // Giả sử checkIns = dailyStreak
            }));
            console.log("Đã cập nhật danh hiệu & streak mới");
        }

      } catch (err) {
        console.error("Lỗi khi lưu điểm danh:", err);
        // Nếu lỗi thì có thể rollback lại state cũ ở đây nếu cần
      }
    }
  };

  const progressPercent = (progressCurrent / progressMax) * 100;

  return (
    <div className="homepage-body">
      
      {/* === 1. AVATAR USER (Góc phải) === */}
      <div className="profile-avatar" onClick={() => navigate('/profile')}>
        {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="avatar-img" 
            />
        ) : (
            <span className="avatar-placeholder">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </span> 
        )}
      </div>

      {/* === 2. HEADER CHÀO MỪNG === */}
      <div className="home-header">
        <h1>Good morning, {userName}</h1>
        <p>Up for a new adventure today?</p>
      </div>

      {/* === 3. LƯỚI THỐNG KÊ 2x2 === */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/reward')}>
          <div className="stat-card-header">
            <span className="title">Ecopoints</span>
          </div>
           <img src={ecopointsIcon} alt="leaf" className="middle-leaf-icon" />
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

      {/* === 4. PHẦN TIẾN TRÌNH (PROGRESS) === */}
      <div className="home-section">
        <div className="section-header">
          <img src={treeIcon} alt="tree" className="progress-icon tree-icon" />
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

      {/* === 5. PHẦN THƯỞNG HÀNG NGÀY === */}
      <div className="home-section">
        <div className="section-header">
          <img src={sunIcon} alt="sun" className="section-title-icon sun-icon" />
          <div className="text-content">
            <h3>Daily Rewards</h3>
            <p>Your current streak: {dailyStreak}</p>
          </div>
        </div>
        <div className="horizontal-scroll-list">
          {dailyRewards.map((reward, index) => (
            <div
              key={reward.date}
              className={`
                reward-card 
                ${reward.claimed ? 'claimed' : (reward.isToday ? 'today' : '')}
              `}
              onClick={() => handleClaimReward(index)}
              style={{ cursor: (reward.isToday && !reward.claimed) ? 'pointer' : 'default' }}
            >
              <span className="points">{reward.points}</span>
              <img src={ecopointsIcon} alt="leaf" className="reward-leaf-icon" />
              <span className="date">{reward.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* === 6. THANH ĐIỀU HƯỚNG DƯỚI CÙNG === */}
      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/reward')}>
          <img src={rewardOutlineIcon} alt="Rewards" className="icon-outline" />
          <img src={rewardSolidIcon} alt="Rewards" className="icon-solid" />
          <span>Rewards</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/journal')}>
          <img src={journalOutlineIcon} alt="Journal" className="icon-outline" />
          <img src={journalSolidIcon} alt="Journal" className="icon-solid" />
          <span>Journal</span>
        </button>
        <button className="nav-item active" onClick={() => navigate('/home')}>
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