// src/pages/HistoryPage.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HistoryPage.css'; // <--- Import file CSS mới

export default function HistoryPage() {
  const navigate = useNavigate();

  // Dữ liệu tạm thời dựa trên ảnh của bạn
  const fullHistoryData = [
    { id: 1, title: 'Điểm danh', amount: 123, type: 'positive' },
    { id: 2, title: 'Vouncher 10%', amount: -123, type: 'negative' },
    { id: 3, title: 'Điểm danh', amount: 123, type: 'positive' },
    { id: 4, title: 'Check-in', amount: 123, type: 'positive' },
    { id: 5, title: 'Điểm danh', amount: 123, type: 'positive' },
    { id: 6, title: 'Di chuyển bằng xe đạp', amount: 123, type: 'positive' },
    { id: 7, title: 'Điểm danh', amount: 123, type: 'positive' },
    { id: 8, title: 'Vouncher 50%', amount: -123, type: 'negative' },
    { id: 9, title: 'Điểm danh', amount: 123, type: 'positive' },
    { id: 10, title: 'Vouncher 10%', amount: -123, type: 'negative' },
    // Bạn có thể thêm nhiều item hơn ở đây
  ];

  return (
    <div className="history-page">
      
      {/* === PHẦN HEADER ĐƠN GIẢN === */}
      <div className="history-header">
        <span className="back-arrow" onClick={() => navigate(-1)}>&lt;</span>
        <h1>History</h1>
      </div>

      {/* === DANH SÁCH LỊCH SỬ ĐẦY ĐỦ === */}
      <div className="history-list-full">
        {fullHistoryData.map((item) => (
          <div key={item.id} className="history-item">
            <div className="item-icon-placeholder"></div> {/* Placeholder cho icon */}
            <span className="item-text">{item.title}</span>
            <span className={`item-value ${item.type}`}>
              {/* Phần 1: Chữ số */}
              <span>
                {item.type === 'positive' ? '+' : ''}{item.amount}
              </span>
              
              {/* Phần 2: Icon lá */}
              {/* (Giả sử bạn dùng ecopoint.png từ public) */}
              <img 
                src="/ecopoint.png" 
                alt="leaf" 
                className="leaf-icon" 
              />
            </span>
          </div>
        ))}
      </div>
      
      {/* (Trang này không cần Bottom Nav, nhưng nếu muốn 
           bạn có thể thêm component <nav className="bottom-nav">...</nav> vào đây) */}
    </div>
  );
}