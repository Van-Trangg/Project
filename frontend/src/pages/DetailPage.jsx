// src/pages/DetailPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DetailPage.css';
import ecopointsIcon from '../public/ecopoint.png'

export default function DetailPage() {
  const navigate = useNavigate();

  const currentPromo = {
    id: 1,
    // logo: '/metro-logo.png', // <--- ĐÃ BỎ LOGO METRO
    price: '10.000',
    title: 'Mã giảm giá 50% cho vé tháng',
    deadline: '12/12/2025',
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...`,
  };

  const relatedPromos = [
    { id: 1, title: 'Promotion', icon: '/placeholder-promo-icon.png' },
    { id: 2, title: 'Promotion', icon: '/placeholder-promo-icon.png' },
    { id: 3, title: 'Promotion', icon: '/placeholder-promo-icon.png' },
  ];

  return (
    <div className="promo-detail-page">
      
      {/* === HEADER ĐƠN GIẢN === */}
      <div className="detail-header">
        <span className="back-arrow" onClick={() => navigate(-1)}>&lt;</span>
        <h1>Detail</h1>
      </div>

      {/* === NỘI DUNG CHÍNH (Card khuyến mãi) === */}
      <div className="detail-main-content">
        <div className="promo-detail-card">
          {/* Hàng trên cùng: Chỉ còn Giá và Icon Lá */}
          <div className="detail-card-header">
            {/* <div className="card-header-left"> 
                 <img src={currentPromo.logo} alt="Metro Logo" className="metro-logo-icon" />
                 <span className="metro-text">HCMC Metro</span>
               </div> 
               <--- ĐÃ BỎ KHỐI NÀY
            */}
            
            {/* Giờ chỉ còn phần giá và lá ở bên phải */}
            <div className="card-header-right-alone"> {/* <--- ĐỔI TÊN CLASS MỚI */}
              <span className="promo-price-value">{currentPromo.price}</span>
              <img src={ecopointsIcon} alt="leaf" className="promo-leaf-icon" />
            </div>
          </div>

          {/* (Các phần còn lại giữ nguyên) */}
          <h2 className="promo-title">{currentPromo.title}</h2>
          <p className="promo-deadline">
            <span className="deadline-label">Redemption deadline:</span> {currentPromo.deadline}
          </p>
          <p className="promo-description">{currentPromo.description}</p>
          <button className="btn-redeem">Redeem</button>
        </div>

        {/* === PHẦN "YOU MIGHT ALSO LIKE" (Giữ nguyên) === */}
        <div className="also-like-section">
          <div className="section-header-compact">
            <h3>You might also like</h3>
          </div>
          <div className="related-promo-list">
            {relatedPromos.map((promo) => (
              <div key={promo.id} className="related-promo-card">
                <div className="related-promo-icon-placeholder"></div>
                <span className="related-promo-text">{promo.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}