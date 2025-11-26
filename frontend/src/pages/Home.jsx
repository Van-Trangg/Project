import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css'; 
import defaultAva from '../public/avt.png';

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
import badgesIcon from '../public/badges.png';
import checkInIcon from '../public/check-in.png';
import rankIcon from '../public/rank.png';

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          const result = await response.json();
          setData(result); 
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

    // 1. Chặn click nếu không phải hôm nay hoặc đã nhận
    if (!selectedReward.isToday) return; 
    if (selectedReward.claimed) return; 

    try {
        const token = localStorage.getItem('access_token');
        
        // 2. Gọi API Backend
        const response = await fetch(`${API_BASE_URL}/home/claim-reward`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 3. THÀNH CÔNG: Cập nhật state từ dữ liệu Server
            const newData = { ...data };
            
            // Quan trọng: Đánh dấu ô này là ĐÃ NHẬN (claimed = true)
            newData.dailyRewards[index].claimed = true;
            
            // Cập nhật các chỉ số
            newData.ecopoints = result.new_ecopoints;
            newData.progressCurrent = result.new_progress;
            newData.currentTitle = result.new_title;
            newData.progressMax = result.new_max;
            newData.dailyStreak = result.new_streak;
            newData.badges = result.new_badges_cnt;

            setData(newData);
        } else {
            // Nếu server báo lỗi (VD: đã nhận rồi), hiện thông báo
            alert(result.message || "Lỗi khi nhận thưởng.");
            
            // Reload lại trang để đồng bộ dữ liệu nếu bị lệch
            if (result.message === "Hôm nay bạn đã nhận rồi!") {
                window.location.reload();
            }
        }

    } catch (err) {
        console.error("Lỗi kết nối:", err);
        alert("Lỗi kết nối tới server.");
    }
  };

  // [MERGED] Giữ lại Math.min để thanh progress không bị tràn 100%
  const progressPercent = Math.min((progressCurrent / progressMax) * 100, 100);

  // [MERGED] Thêm hàm helper getFontSize từ nhánh Main
  const getFontSize = (value) => {
    const str = value.toString();
    if (str.length > 8) return '28px'; // Ví dụ: 1.000.000.000 (Rất nhỏ)
    if (str.length > 6) return '32px'; // Ví dụ: 10.000.000
    if (str.length > 4) return '36px'; // Ví dụ: 100.000
    return '42px'; // Mặc định (<= 5 chữ số)
  };

  return (
    <div className="homepage-body">
      
      {/* === HEADER === */}
      <div className="profile-avatar" onClick={() => navigate('/profile')}>
        <img 
            src={(avatarUrl && avatarUrl !== "null") ? avatarUrl : defaultAva}
            alt="Avatar" 
            className="avatar-img" 
            onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = defaultAva; 
            }}
        />
      </div>

      <div className="home-header">
        <h1>Chào buổi sáng, {userName}</h1>
        <p>Sẵn sàng cho cuộc hành hành trình mới cho hôm nay?</p>
      </div>

      {/* === STATS GRID === */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/reward')}>
          <div className="stat-card-header">
            <span className="title">Ecopoints</span>
          </div>
           <img src={ecopointsIcon} alt="leaf" className="middle-leaf-icon" />
           {/* [MERGED] Áp dụng dynamic font size */}
          <div className="value" style={{ fontSize: getFontSize(ecopoints) }}>
            {ecopoints.toLocaleString('de-DE')}
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/profile')}>
          <div className="stat-card-header">
            <span className="title">Huy hiệu</span>
            </div>
            <img src={badgesIcon} alt="badges" className="middle-badges-icon" />
          <div className="value">{badges}</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/leaderboard')}>
          <div className="stat-card-header">
            <span className="title">Xếp hạng</span>
            </div>
            <img src={rankIcon} alt="rank" className="middle-rank-icon" />
          <div className="value">#{rank}</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/journal')}>
          <div className="stat-card-header">
            <span className="title">Check-ins</span>
            </div>
            <img src={checkInIcon} alt="check-ins" className="middle-check-in-icon" />
          <div className="value">{String(checkIns).padStart(2, '0')}</div>
        </div>
      </div>
      <div className="white-divider"></div>
      {/* === PROGRESS === */}
      <div className="home-section">
        <div className="section-header">
          <img src={treeIcon} alt="tree" className="progress-icon tree-icon" />
          <div className="text-content">
            <h3>{currentTitle}</h3>
            <p>Tiến độ danh hiệu tiếp theo</p>
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
      <div className="white-divider"></div>
      {/* === DAILY REWARDS === */}
      <div className="home-section">
        <div className="section-header">
          <img src={sunIcon} alt="sun" className="section-title-icon sun-icon" />
          <div className="text-content">
            <h3>Thưởng hàng ngày</h3>
            <p>Chuỗi đăng nhập: {dailyStreak}</p>
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
              
              {reward.claimed && <div className="check-mark" style={{position: 'absolute', top: '5px', right: '5px', color: 'white', fontSize: '12px'}}>✓</div>}
            </div>
          ))}
        </div>
      </div>

      {/* === NAVIGATION === */}
      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/reward')}>
          <img src={rewardOutlineIcon} alt="Rewards" className="icon-outline" />
          <img src={rewardSolidIcon} alt="Rewards" className="icon-solid" />
          <span>Phần thưởng</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/journal')}>
          <img src={journalOutlineIcon} alt="Journal" className="icon-outline" />
          <img src={journalSolidIcon} alt="Journal" className="icon-solid" />
          <span>Nhật ký</span>
        </button>
        <button className="nav-item active" onClick={() => navigate('/home')}>
          <img src={homeOutlineIcon} alt="Home" className="icon-outline" />
          <img src={homeSolidIcon} alt="Home" className="icon-solid" />
          <span>Trang chủ</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/map')}>
          <img src={mapOutlineIcon} alt="Map" className='icon-outline' />
          <img src={mapSolidIcon} alt='Map' className='icon-solid' />
          <span>Bản đồ</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/leaderboard')}>
          <img src={leaderboardOutlineIcon} alt='Leaderboard' className='icon-outline' />
          <img src={leaderboardSolidIcon} alt='Leaderboard' className='icon-solid' />
          <span>Bảng xếp hạng</span>
        </button>
      </nav>
    </div>
  );
}