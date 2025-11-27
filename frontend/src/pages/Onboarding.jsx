import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Onboarding.css'
import arrowImg from '../public/arrow-right.png'

import img1 from '../public/Onboarding-1.png'
import img2 from '../public/Onboarding-2.png'
import img3 from '../public/Onboarding-3.png'
import img4 from '../public/Onboarding-4.png'
import overview1 from '../public/Onboarding-overview-1.png'
import leafImg from '../public/ecopoint.png'
import { Navigate } from 'react-router-dom'

export default function Onboarding() {
  const navigate = useNavigate()
  const slides = [
    // --- TRANG MỚI THÊM VÀO ĐÂY ---
    { 
      title: 'Chào mừng bạn đến với', 
      highlight: (
      <>
        GreenJourney
        {/* Thêm class để tí nữa chỉnh CSS cho đẹp */}
        {/*<img src={leafImg} alt="leaf" className="highlight-icon" />*/}
      </>
    ),
      image: null // Bạn có thể thay bằng ảnh Logo hoặc ảnh bìa khác
    },
    // -------------------------------
    { title: 'Phần thưởng từ việc', highlight: 'sống xanh', image: img1 },
    { title: 'Check-in tại', highlight: 'điểm du lịch xanh', image: img2 },
    { title: 'Ghi lại', highlight: 'câu chuyện của bạn', image: img3 },
    { title: 'Cạnh tranh với', highlight: 'những người cùng đam mê', image: img4 },
    { title: '', highlight: 'Bắt đầu ngay', image: overview1 }
  ]

  const [index, setIndex] = useState(0)

  // Lấy dữ liệu của slide hiện tại
  const s = slides[index]

  function go(n) {
    const next = Math.max(0, Math.min(slides.length - 1, n))
    setIndex(next)
  }

  // Navigate to home if logged in, otherwise to login
  function finishOrLogin() {
    try {
      const token = localStorage.getItem('access_token')
      if (token) navigate('/home')
      else navigate('/login')
    } catch (err) {
      navigate('/login')
    }
  }

  return (
    <div className="onboarding-root">
      
      {/* Slide Content */}
      {index > 0 && (
        <button 
          className="close-btn" 
          onClick={() => finishOrLogin()} /* close -> home if authed, else login */
        >
          ×
        </button>
      )}
      <div 
        className={`onboarding-content fade-in ${index === 0 ? 'is-intro-page' : ''}`} 
        key={index}
      >
        
        <div className="onboarding-text">
          <h1 className="onboarding-title">{s.title}</h1>
          {s.highlight && <h2 className="onboarding-highlight">{s.highlight}</h2>}
        </div>

        {s.image && (
          <div className="onboarding-image-wrap">
            <img src={s.image} alt={`slide-${index}`} className="onboarding-image" />
          </div>
        )}

        {index === 0 && (
          <div className="onboarding-intro-footer">
            <div className="swipe-pill">
              Vuốt để khám phá
            </div>
            
            <p className="skip-text">
              Hoặc nhấn vào <span className="skip-link" onClick={() => finishOrLogin()}>đây</span> để bỏ qua
            </p>
          </div>
        )}

        {/* Nút tham gia chỉ hiện ở slide cuối cùng */}
        {index === slides.length - 1 && (
            <div className="onboarding-cta-wrap">
            <button className="onboarding-cta" onClick={() => finishOrLogin()}>Tham gia ngay</button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="onboarding-controls">
        <button 
          className="onboarding-arrow" 
          onClick={() => go(index - 1)} 
          disabled={index === 0}
        >
          <img src={arrowImg} alt="Trước" className="onboarding-arrow-img left" />
        </button>

        <div className="onboarding-dots">
          {slides.map((_, i) => (
            <button 
              key={i} 
              className={`dot ${i === index ? 'active' : ''}`} 
              onClick={() => go(i)} 
            />
          ))}
        </div>

        <button 
          className="onboarding-arrow" 
          onClick={() => go(index + 1)} 
          disabled={index === slides.length - 1}
        >
          <img src={arrowImg} alt="Tiếp" className="onboarding-arrow-img" />
        </button>
      </div>
    </div>
  )
}