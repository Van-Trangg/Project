import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HistoryPage.css'; 
import ecopointsIcon from '../public/ecopoint.png';

export default function HistoryPage() {
  const navigate = useNavigate();
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="history-page" style={{position: 'relative'}}>
      
      <div className="history-header">
        <span className="back-arrow" onClick={() => navigate(-1)}>&lt;</span>
        <h1>Transaction History</h1>
      </div>

      <div className="history-list-full">
        
        {loading && <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>Đang tải dữ liệu...</div>}

        {!loading && history.length === 0 && (
            <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>Chưa có giao dịch nào.</div>
        )}

        {!loading && history.map((item) => (
          <div 
            key={item.id} 
            className="history-item" 
            style={{marginBottom: '10px', cursor: 'pointer'}}
            onClick={() => setSelectedItem(item)}
          >
            <div className="item-icon-placeholder" style={{background: item.type === 'positive' ? '#E8F5E9' : '#FFEBEE'}}>
                <span style={{fontSize: '20px'}}>
                    {item.type === 'positive' ? '📥' : '📤'}
                </span>
            </div>
            
            <div style={{flex: 1, paddingRight: '10px'}}>
                <span className="item-text" style={{display: 'block'}}>{item.title}</span>
                <span style={{fontSize: '12px', color: '#888'}}>
                    {formatDate(item.created_at)}
                </span>
            </div>

            <span className={`item-value ${item.type}`} style={{fontSize: '16px'}}>
              <span>
                {item.type === 'positive' ? '+' : '-'}{item.amount}
              </span>
              <img src={ecopointsIcon} alt="leaf" className="leaf-icon" />
            </span>
          </div>
        ))}
      </div>

      {/* === POPUP CHI TIẾT === */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            
            <h3 style={{marginTop: 0, color: '#556B2F'}}>Chi tiết giao dịch</h3>
            
            <div style={{textAlign: 'center', margin: '20px 0'}}>
                <div style={{
                    width: '60px', height: '60px', borderRadius: '50%', 
                    background: selectedItem.type === 'positive' ? '#E8F5E9' : '#FFEBEE',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '30px', margin: '0 auto 10px'
                }}>
                    {selectedItem.type === 'positive' ? '📥' : '📤'}
                </div>
                <h2 style={{margin: 0, color: selectedItem.type === 'positive' ? '#7CB342' : '#E53935'}}>
                    {selectedItem.type === 'positive' ? '+' : '-'}{selectedItem.amount}
                </h2>
                <p style={{margin: '5px 0', color: '#888', fontSize: '14px'}}>Ecopoints</p>
            </div>

            <div style={{textAlign: 'left', background: '#f9f9f9', padding: '15px', borderRadius: '10px'}}>
                <p style={{margin: '5px 0'}}><strong>Nội dung:</strong> {selectedItem.title}</p>
                <p style={{margin: '5px 0'}}><strong>Thời gian:</strong> {formatDate(selectedItem.created_at)}</p>
                
                {/* Hiển thị Mã Giao Dịch */}
                <p style={{margin: '5px 0'}}>
                    <strong>Mã GD:</strong> <span style={{fontFamily: 'monospace', fontSize: '16px', letterSpacing: '1px', color: '#333'}}>
                        #{selectedItem.code || selectedItem.id} 
                    </span>
                </p>

                <p style={{margin: '5px 0'}}><strong>Trạng thái:</strong> <span style={{color: 'green'}}>Thành công</span></p>
            </div>

            <button 
                style={{
                    marginTop: '20px', width: '100%', padding: '12px', 
                    background: '#556B2F', color: 'white', border: 'none', 
                    borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                }}
                onClick={() => setSelectedItem(null)}
            >
                Đóng
            </button>

          </div>
        </div>
      )}

    </div>
  );
}