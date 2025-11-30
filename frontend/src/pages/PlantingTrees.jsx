import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PlantingTrees.css'; 

// --- [SỬA LỖI ẢNH] Dùng import để đảm bảo hiện ảnh đúng cấu trúc của bạn ---
import treeImg from '../public/tree.png'; 
import ecopointsIcon from '../public/ecopoint.png'; // Import thêm icon lá cho Modal
import backArrowImg from '../public/back.png';

export default function PlantingTrees() {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ myTrees: 0, everyoneTrees: 0 });
  const [loading, setLoading] = useState(true);
  
  // State quản lý Modal
  const [showModal, setShowModal] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null); 
  const [isProcessing, setIsProcessing] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  // 1. Load thống kê cây từ Server
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        // Nếu chưa đăng nhập thì thôi, không load
        if (!token) { 
             setLoading(false);
             return; 
        }

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

  // 2. Xử lý khi bấm nút Plant Now -> Mở Modal xác nhận
  const handlePlantNow = () => {
    setShowModal(true);
  };

  // 3. Gọi API Trồng cây thật sự
  const confirmPlanting = async () => {
    setIsProcessing(true);
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/home/plant-tree`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            // Lưu kết quả để hiện thông báo thành công
            setSuccessInfo(result);
            
            // Cập nhật số liệu ngay lập tức cho mượt
            setStats(prev => ({
                ...prev,
                myTrees: prev.myTrees + 1,
                everyoneTrees: prev.everyoneTrees + 1
            }));
        } else {
            alert(result.message); // Lỗi thiếu tiền thì báo alert
            setShowModal(false);
        }

    } catch (err) {
        console.error("Lỗi kết nối:", err);
        alert("Có lỗi xảy ra, vui lòng thử lại.");
        setShowModal(false);
    } finally {
        setIsProcessing(false);
    }
  };

  // 4. Đóng Modal và chuyển hướng
  const handleCloseModal = () => {
    setShowModal(false);
    setSuccessInfo(null);
  };

  return (
    <div className="planting-page">
      
      {/* === HEADER === */}
      <div className="planting-header">
        <span className="back-arrow" onClick={() => navigate(-1)}>
           <img src={backArrowImg} alt="Back" className="back-arrow-img" />
        </span>
        <h1>Trồng cây</h1>
      </div>

      {/* === NỘI DUNG CHÍNH === */}
      <div className="planting-content">

        {/* 1. KHUNG THỐNG KÊ */}
        <div className="stats-frame">
          <div className="stat-item">
            <span className="stat-label">Cây của tôi</span>
            <span className="stat-value">
                {loading ? "..." : stats.myTrees}
            </span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-label">Cây của mọi người</span>
            <span className="stat-value">
                {loading ? "..." : stats.everyoneTrees.toLocaleString('de-DE')}
            </span>
          </div>
        </div>

        {/* 2. HÌNH ẢNH CÂY & NÚT BẤM */}
        <div className="tree-image-container">
          <img src={treeImg} alt="Tree" />
          <p className="tree-planting-text">Dùng 1000 Ecopoints để trồng cây</p>
          
          <button className="btn-plant-tree" onClick={handlePlantNow}>
            Trồng cây
          </button>
        </div>

      </div>

      {/* === MODAL POPUP THÔNG BÁO (Code mới) === */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            
            {!successInfo ? (
                /* TRẠNG THÁI 1: XÁC NHẬN */
                <>
                    <h3 style={{color: '#556B2F', marginTop: 0}}>Xác nhận trồng cây</h3>
                    <p className="modal-text">
                      Bạn có muốn đổi <span className="highlight-text">1.000 Ecopoints</span> để trồng 1 cây xanh không?
                    </p>
                    <div className="modal-actions">
                      <button className="btn-modal-no" onClick={() => setShowModal(false)} disabled={isProcessing}>
                          Hủy
                      </button>
                      <button className="btn-modal-yes" onClick={confirmPlanting} disabled={isProcessing}>
                          {isProcessing ? 'Đang xử lý...' : 'Đồng ý'}
                      </button>
                    </div>
                </>
            ) : (
                /* TRẠNG THÁI 2: THÀNH CÔNG (Hiện số dư mới) */
                <div style={{textAlign: 'center', padding: '10px'}}>
                    <div style={{fontSize: '50px', marginBottom: '10px'}}>🌳</div>
                    <h3 style={{color: '#556B2F', margin: '0 0 10px 0'}}>Trồng cây thành công!</h3>
                    
                    <p style={{color: '#555', fontSize: '14px', marginBottom: '15px'}}>
                        Cảm ơn bạn đã góp phần làm xanh Trái Đất.
                    </p>
                    
                    <div style={{background: '#f1f8e9', padding: '15px', borderRadius: '12px', margin: '15px 0'}}>
                        <p style={{margin: 0, color: '#333', fontSize: '12px'}}>Số dư mới:</p>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '5px'}}>
                            <strong style={{fontSize: '24px', color: '#7CB342'}}>
                                {successInfo.new_balance.toLocaleString('de-DE')}
                            </strong>
                            <img src={ecopointsIcon} alt="leaf" style={{width: '24px', height: '24px'}} />
                        </div>
                    </div>

                    <button 
                        className="btn-modal-yes" 
                        style={{width: '100%', marginTop: '10px', padding: '12px'}}
                        onClick={handleCloseModal}
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