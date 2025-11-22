import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Reward.css'; // Tận dụng lại CSS của trang Reward
import ecopointsIcon from '../public/ecopoint.png';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Gọi API lấy toàn bộ lịch sử
        const response = await fetch(`${API_BASE_URL}/home/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            setHistory(data);
        }
      } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  // Hàm format ngày giờ cho đẹp (VD: 25/10/2023 14:30)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="rewards-page" style={{ minHeight: '100vh', background: '#f5f9f0' }}>
      
      {/* Header */}
      <div className="header-overlay">
          <span className="back-arrow" onClick={() => navigate(-1)}>&lt;</span>
          <h1>Transaction History</h1>
      </div>

      <div className="rewards-main-content">
        {loading ? (
            <div style={{textAlign: 'center', padding: '20px', color: '#556B2F'}}>Loading...</div>
        ) : history.length === 0 ? (
            <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>Chưa có giao dịch nào.</div>
        ) : (
            <div className="history-list">
                {history.map((item) => (
                <div key={item.id} className="history-item" style={{marginBottom: '10px'}}>
                    {/* Icon bên trái */}
                    <div className="item-icon-placeholder" style={{background: item.type === 'positive' ? '#E8F5E9' : '#FFEBEE'}}>
                        <span style={{fontSize: '20px'}}>
                            {item.type === 'positive' ? '📥' : '📤'}
                        </span>
                    </div>
                    
                    {/* Nội dung giữa */}
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                        <span className="item-text" style={{fontWeight: 'bold'}}>{item.title}</span>
                        <span style={{fontSize: '11px', color: '#888'}}>{formatDate(item.created_at)}</span>
                    </div>

                    {/* Số tiền bên phải */}
                    <span className={`item-value ${item.type}`} style={{fontSize: '16px'}}>
                        {item.type === 'positive' ? '+' : '-'}{item.amount}
                        <div className="icon-wrapper" style={{marginLeft: '4px'}}>
                            <img src={ecopointsIcon} alt="leaf" className="leaf-icon" />
                        </div>
                    </span>
                </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}