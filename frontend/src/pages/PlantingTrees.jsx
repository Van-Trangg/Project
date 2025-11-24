import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PlantingTrees.css'; 

// Import hình ảnh cây (Đảm bảo file này có trong public hoặc src)
// Nếu dùng public thì đổi thành: const treeImg = "/tree.png";
import treeImg from '../public/tree.png'; 

export default function PlantingTrees() {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ myTrees: 0, everyoneTrees: 0 });
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = 'http://127.0.0.1:8000';

  // 1. Load thống kê cây khi vào trang
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/home/tree-stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setStats({ 
                myTrees: data.my_trees, 
                everyoneTrees: data.everyone_trees 
            });
        }
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // 2. Xử lý nút Plant Now (Trừ điểm -> Chuyển Map)
  const handlePlantNow = async () => {
    const confirm = window.confirm("Bạn có muốn dùng 1.000 Ecopoints để trồng 1 cây không?");
    if (!confirm) return;

    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/home/plant-tree`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            // Trồng xong thì chuyển sang Map để xem (hoặc chọn vị trí)
            navigate('/map'); 
        } else {
            alert(result.message); // Báo lỗi nếu không đủ tiền
        }

    } catch (err) {
        console.error("Lỗi kết nối:", err);
        alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  return (
    <div className="planting-page">
      
      {/* === HEADER === */}
      <div className="planting-header">
        <span className="back-arrow" onClick={() => navigate(-1)}>&lt;</span>
        <h1>Planting Trees</h1>
      </div>

      {/* === NỘI DUNG CHÍNH === */}
      <div className="planting-content">

        {/* 1. KHUNG THỐNG KÊ */}
        <div className="stats-frame">
          
          {/* Cột bên trái */}
          <div className="stat-item">
            <span className="stat-label">My Trees</span>
            <span className="stat-value">
                {loading ? "..." : stats.myTrees}
            </span>
          </div>

          {/* Vạch ngăn giữa */}
          <div className="stat-divider"></div>

          {/* Cột bên phải */}
          <div className="stat-item">
            <span className="stat-label">Everyone's Trees</span>
            <span className="stat-value">
                {loading ? "..." : stats.everyoneTrees.toLocaleString('de-DE')}
            </span>
          </div>
        </div>

        {/* 2. HÌNH ẢNH CÂY & NÚT BẤM */}
        <div className="tree-image-container">
          <img src={treeImg} alt="Tree" />
          <p className="tree-planting-text">Plant a tree with 1,000 Ecopoints!</p>
          
          <button className="btn-plant-tree" onClick={handlePlantNow}>
            Plant Now
          </button>
        </div>

      </div>
    </div>
  );
}