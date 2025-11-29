import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Reward.css'; 

// --- IMPORT HÌNH ẢNH ---
import ecopointsIcon from '../public/ecopoint.png'; 
import rewardOutlineIcon from '../public/reward-outline.png';
import rewardSolidIcon from '../public/reward-solid.png';
import homeOutlineIcon from '../public/home-outline.png';
import homeSolidIcon from '../public/home-solid.png';
import journalOutlineIcon from '../public/journal-outline.png';
import journalSolidIcon from '../public/journal-solid.png';
import mapOutlineIcon from '../public/map-outline.png';
import mapSolidIcon from '../public/map-solid.png';
import leaderboardOutlineIcon from '../public/leaderboard-outline.png';
import leaderboardSolidIcon from '../public/leaderboard-solid.png';
import backArrowImg from '../public/back.png';

export default function Reward() {
  const navigate = useNavigate();
  
  const [rewardData, setRewardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchRewardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/home/rewards`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Không tải được dữ liệu");

        const data = await response.json();
        setRewardData(data);

      } catch (err) {
        console.error(err);
        setError("Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    };

    fetchRewardData();
  }, [navigate]);

  if (loading) return <div className="rewards-page loading-center">Đang tải ví của bạn...</div>;
  if (error) return <div className="rewards-page loading-center">{error}</div>;
  if (!rewardData) return null;

  const { balance, history, promotions } = rewardData;

  // --- HÀM CHUYỂN ĐỔI GIÁ TIỀN TỪ CHUỖI SANG SỐ ---
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    return parseInt(priceStr.replace(/\./g, ''), 10);
  };

  // --- XỬ LÝ KHI CLICK VÀO QUÀ ---
  const handlePromoClick = (promo) => {
    const price = parsePrice(promo.price);

    if (balance >= price) {
      // Gửi dữ liệu 'promo' sang trang Detail
      navigate('/detail', { state: { item: promo } });
    } else {
      const missingPoints = price - balance;
      alert(`Bạn không đủ Ecopoints! Cần thêm ${missingPoints.toLocaleString('de-DE')} điểm nữa.`);
    }
  };

  return (
    <div className="rewards-page">
      <div className="header-overlay">
          <span className="back-arrow" onClick={() => navigate(-1)}>
            <img src={backArrowImg} alt="Back" className="back-arrow-img" />
          </span>
          <h1>Đổi thưởng</h1>
        </div>

      <div className="rewards-main-content">

        {/* --- BALANCE CARD --- */}
        <div className="balance-card">
          <span className="balance-title">Điểm hiện có</span>
          <div className="balance-amount">
            <h2>{balance.toLocaleString('de-DE')}</h2>
            <img src={ecopointsIcon} alt="leaf" className="balance-leaf-icon" />
          </div>
          <div className="action-buttons">
            <button className="btn-secondary" onClick={() => navigate('/how-to-earn')}> Cách nhận điểm</button>
            <button className="btn-primary" onClick={() => navigate('/leaderboard')}>Bảng xếp hạng</button>
          </div>
          <button className="btn-plant" onClick={() => navigate('/stats')}>Xem thống kê</button>
          <button className="btn-plant" onClick={() => navigate('/planting-trees')}>Trồng cây</button>
        </div>

        {/* --- HISTORY --- */}
        <div className="history-section">
          <div className="section-header">
            <h3>Lịch sử</h3>
            <span className="see-more" onClick={() => navigate('/history')}>Thêm</span>
          </div>
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <div className="item-icon-placeholder" style={{background: item.type === 'positive' ? '#E8F5E9' : '#FFEBEE'}}>
                  <span style={{fontSize: '20px'}}>
                    {item.type === 'positive' ? '📥' : '📤'}
                  </span>
                </div>
                <span className="item-text">{item.title}</span>
                
                {/* --- [ĐÃ SỬA] THÊM DẤU TRỪ Ở ĐÂY --- */}
                <span className={`item-value ${item.type}`}>
                  {item.type === 'positive' ? '+' : '-'}{item.amount}
                  <div className="icon-wrapper">
                    <img src={ecopointsIcon} alt="leaf" className="leaf-icon" />
                  </div>
                </span>

              </div>
            ))}
          </div>
        </div>

        {/* --- PROMOTIONS --- */}
        <div className="promo-section">
          <div className="section-header">
            <h3>Khuyến mãi & ưu đãi</h3>
          </div>
          <div className="promo-list">
            {promotions.map((promo) => {
              const price = parsePrice(promo.price);
              const isAffordable = balance >= price;

              return (
                <div 
                  key={promo.id} 
                  className="promo-card" 
                  onClick={() => handlePromoClick(promo)}
                  style={{ 
                    opacity: isAffordable ? 1 : 0.6,
                    cursor: isAffordable ? 'pointer' : 'not-allowed',
                    backgroundColor: isAffordable ? '#fff' : '#f9f9f9'
                  }}
                >
                  <div className="promo-icon-placeholder" style={{ filter: isAffordable ? 'none' : 'grayscale(100%)',display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{fontSize: '25px'}}>
                      📥
                    </span>
                  </div>
                  <div className="promo-info">
                      <span className="promo-text" style={{ color: isAffordable ? '#333' : '#999' }}>{promo.title}</span>
                      <span className="promo-price" style={{ color: isAffordable ? '#556B2F' : '#999' }}>
                          {promo.price}
                          <div className="icon-wrapper">
                              <img 
                                src={ecopointsIcon} 
                                alt="leaf" 
                                className="promo-leaf-icon" 
                                style={{ filter: isAffordable ? 'none' : 'grayscale(100%)' }}
                              />
                          </div>
                      </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* --- BOTTOM NAV --- */}
      <nav className="bottom-nav">
        <button className="nav-item active" onClick={() => navigate('/reward')}>
            <img src={rewardSolidIcon} alt="Rewards" className="icon-solid" />
            <span>Phần thưởng</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/journal')}>
            <img src={journalOutlineIcon} alt="Journal" className="icon-outline" />
            <span>Nhật ký</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/home')}>
            <img src={homeOutlineIcon} alt="Home" className="icon-outline" />
            <span>Trang chủ</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/map')}>
            <img src={mapOutlineIcon} alt="Map" className='icon-outline' />
            <span>Bản đồ</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/leaderboard')}>
            <img src={leaderboardOutlineIcon} alt='Leaderboard' className='icon-outline' />
            <span>Bảng xếp hạng</span>
        </button>
      </nav>
    </div>
  );
}