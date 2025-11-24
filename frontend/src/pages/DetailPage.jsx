import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/DetailPage.css';

import ecopointsIcon from '../public/ecopoint.png';

export default function DetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { item } = location.state || {};
  
  const API_BASE_URL = 'http://127.0.0.1:8000'; 

  const [showModal, setShowModal] = useState(false);
  const [isRedeemed, setIsRedeemed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!item) {
        navigate('/reward');
    }
  }, [item, navigate]);

  if (!item) return null;

  // --- [MỚI] Ưu tiên dùng dữ liệu từ Backend ---
  const displayItem = {
    ...item,
    // Nếu backend có deadline thì dùng, không thì dùng mặc định
    deadline: item.deadline || '31/12/2025', 
    // Nếu backend có description thì dùng, không thì dùng text mẫu
    description: item.description || `Đây là phần quà "${item.title}" dành riêng cho bạn. Hãy sử dụng Ecopoints tích lũy được để đổi ngay nhé!`,
  };

  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    return parseInt(priceStr.replace(/\./g, ''), 10);
  };

  const handleConfirmRedeem = async () => {
    setIsLoading(true);
    try {
        const token = localStorage.getItem('access_token');
        const priceInt = parsePrice(displayItem.price);

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
            setShowModal(false);
            alert(`Thành công! Số dư mới của bạn là: ${data.new_balance.toLocaleString('de-DE')}`);
        } else {
            alert("Lỗi: " + data.message);
            setShowModal(false);
        }

    } catch (error) {
        console.error("Lỗi đổi quà:", error);
        alert("Lỗi kết nối server.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="promo-detail-page">
      
      <div className="detail-header">
        <span className="back-arrow" onClick={() => navigate(-1)}>&lt;</span>
        <h1>Detail</h1>
      </div>

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
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p className="modal-text">
              Use <span className="highlight-text">{displayItem.price} Ecopoints</span> to redeem this reward?
            </p>
            <div className="modal-actions">
              <button className="btn-modal-no" onClick={() => setShowModal(false)}>No</button>
              <button className="btn-modal-yes" onClick={handleConfirmRedeem}>Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}