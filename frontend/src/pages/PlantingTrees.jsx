// src/pages/PlantingTrees.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PlantingTrees.css'; // <--- Import file CSS mới

// Import hình ảnh cây (tree.png) từ thư mục assets
// (Bạn cần tạo thư mục 'assets' trong 'src' và đặt tree.png vào đó)
import treeImg from '../public/tree.png';

export default function PlantingTrees() {
  const navigate = useNavigate();

  // Dữ liệu giả cho thống kê
  const myTrees = 12;
  const everyoneTrees = 15830;

  return (
    <div className="planting-page">
      
      {/* === HEADER ĐƠN GIẢN === */}
      <div className="planting-header">
        <span className="back-arrow" onClick={() => navigate(-1)}>&lt;</span>
        <h1>Planting Trees</h1>
      </div>

      {/* === NỘI DUNG CHÍNH === */}
      <div className="planting-content">

        {/* 1. KHUNG THỐNG KÊ (Xanh nhạt, bo góc trên) */}
        <div className="stats-frame">
          
          {/* Cột bên trái */}
          <div className="stat-item">
            <span className="stat-label">My Trees</span>
            <span className="stat-value">{myTrees}</span>
          </div>

          {/* Vạch ngăn giữa */}
          <div className="stat-divider"></div>

          {/* Cột bên phải */}
          <div className="stat-item">
            <span className="stat-label">Everyone's Trees</span>
            <span className="stat-value">{everyoneTrees.toLocaleString('de-DE')}</span>
          </div>
        </div>

        {/* 2. HÌNH ẢNH CÂY Ở GIỮA */}
        <div className="tree-image-container">
          <img src={treeImg} alt="Tree" />
          <p className="tree-planting-text">Plant a tree with 1,000 Ecopoints!</p>
          <button className="btn-plant-tree" onClick={() => navigate('/map')}>Plant Now</button>
        </div>

      </div>

      {/* (Component <nav className="bottom-nav">...</nav> của bạn sẽ ở đây 
           nếu nó được đặt trong App.jsx, nếu không, hãy thêm vào đây) */}
    </div>
  );
}