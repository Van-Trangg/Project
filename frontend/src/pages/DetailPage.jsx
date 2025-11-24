import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/DetailPage.css';

// Import icon
import ecopointsIcon from '../public/ecopoint.png';

export default function DetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Nhận dữ liệu từ trang Reward gửi sang
  const { item } = location.state || {};
  
  const API_BASE_URL = 'http://127.0.0.1:8000'; 

  const [showModal, setShowModal] = useState(false);
  const [isRedeemed, setIsRedeemed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State để lưu thông tin thành công từ Server (để hiện trong Modal)
  const [successInfo, setSuccessInfo] = useState(null);

  // 2. Nếu user vào thẳng link mà không có item -> Quay về Reward
  useEffect(() => {
    if (!item) {
        navigate('/reward');
    }
  }, [item, navigate]);

  if (!item) return null;

  // Tạo dữ liệu hiển thị đầy đủ
  const displayItem = {
    ...item,
    deadline: item.deadline || '31/12/2025',
    description: item.description || `Đây là phần quà "${item.title}" dành riêng cho bạn. Hãy sử dụng Ecopoints tích lũy được để đổi ngay nhé!`,
  };

  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    return parseInt(priceStr.replace(/\./g, ''), 10);
  };

  // --- HÀM GỌI API ĐỔI QUÀ ---
  const handleConfirmRedeem = async () => {
    setIsLoading(true);
    try {
        const token = localStorage.getItem('access_token');
        const priceInt = parsePrice(displayItem.price);

        // Gọi về Backend để trừ điểm
        const response = await fetch(`${API_BASE_URL}/home/redeem`, { 
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: displayItem.title,
                price: priceInt
            })
        });

        const data = await response.json();

        if (data.success) {
            setIsRedeemed(true);
            // Không đóng Modal ngay, mà lưu data để hiện thông báo đẹp
            setSuccessInfo(data); 
        } else {
            alert("Lỗi: " + data.message);
            setShowModal(false);
        }

    } catch (error) {
        console.error("Lỗi đổi quà:", error);
        alert("Lỗi kết nối server.");
        setShowModal(false);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
      setShowModal(false);
      setSuccessInfo(null);
  };

  return (
    <div className="promo-detail-page">
      
      {/* Header */}
      <div className="detail-header">
        <span className="back-arrow" onClick={() => navigate(-1)}>&lt;</span>
        <h1>Detail</h1>
      </div>

      {/* Nội dung chính */}
      <div className="detail-main-content">
        <div className="promo-detail-card">
          
          <div className="detail-card-header">
            <div className="card-header-right-alone"> 
              <span className="promo-price-value">{displayItem.price}</span>
              <img src={ecopointsIcon} alt="leaf" className="promo-leaf-icon" />
            </div>
          </div>

          <h2 className="promo-title">{displayItem.title}</h2>
          
          <p className="promo-deadline">
            <span className="deadline-label">Redemption deadline:</span> {displayItem.deadline}
          </p>
          
          <p className="promo-description">{displayItem.description}</p>
          
          <button 
            className={`btn-redeem ${isRedeemed ? 'redeemed' : ''}`}
            onClick={() => {
              if (!isRedeemed) setShowModal(true); 
            }}
            disabled={isRedeemed || isLoading} 
          >
            {isLoading ? 'Processing...' : (isRedeemed ? 'Redeemed' : 'Redeem')}
          </button>
        </div>

        {/* [MERGED] Giữ lại phần Gợi ý thêm từ nhánh của bạn */}
        <div className="also-like-section">
          <div className="section-header-compact">
            <h3>You might also like</h3>
          </div>
          <div className="related-promo-list">
             <div className="related-promo-card">
                <div className="related-promo-icon-placeholder"></div>
                <span className="related-promo-text">Promotion A</span>
             </div>
             <div className="related-promo-card">
                <div className="related-promo-icon-placeholder"></div>
                <span className="related-promo-text">Promotion B</span>
             </div>
          </div>
        </div>

      </div>

      {/* === MODAL POPUP (XỬ LÝ 2 TRẠNG THÁI) === */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            
            {/* TRƯỜNG HỢP 1: Chưa đổi -> Hiện câu hỏi xác nhận */}
            {!successInfo ? (
                <>
                    <p className="modal-text">
                    Use <span className="highlight-text">{displayItem.price} Ecopoints</span> to redeem this reward?
                    </p>
                    <div className="modal-actions">
                    <button className="btn-modal-no" onClick={() => setShowModal(false)} disabled={isLoading}>
                        No
                    </button>
                    <button className="btn-modal-yes" onClick={handleConfirmRedeem} disabled={isLoading}>
                        {isLoading ? '...' : 'Yes'}
                    </button>
                    </div>
                </>
            ) : (
            /* TRƯỜNG HỢP 2: Đã đổi thành công -> Hiện thông báo đẹp trong App */
                <div style={{textAlign: 'center', padding: '10px'}}>
                    <div style={{fontSize: '40px', marginBottom: '10px'}}>🎉</div>
                    <h3 style={{color: '#556B2F', margin: '0 0 10px 0'}}>Thành công!</h3>
                    
                    <p style={{color: '#555', fontSize: '14px', marginBottom: '5px'}}>
                        Bạn đã đổi quà thành công.
                    </p>
                    
                    <div style={{background: '#f1f8e9', padding: '10px', borderRadius: '10px', margin: '15px 0'}}>
                        <p style={{margin: 0, color: '#333', fontSize: '12px'}}>Số dư mới của bạn:</p>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '5px'}}>
                            <strong style={{fontSize: '24px', color: '#7CB342'}}>
                                {successInfo.new_balance.toLocaleString('de-DE')}
                            </strong>
                            <img src={ecopointsIcon} alt="leaf" style={{width: '20px', height: '20px'}} />
                        </div>
                    </div>

                    <button 
                        className="btn-modal-yes" 
                        style={{width: '100%', marginTop: '10px', padding: '12px'}}
                        onClick={handleCloseSuccessModal}
                    >
                        Tuyệt vời!
                    </button>
                </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}