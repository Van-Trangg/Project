import React, { useState } from 'react'
import '../styles/Onboarding.css'

import img1 from '../public/Onboarding-1.png'
import img2 from '../public/Onboarding-2.png'
import img3 from '../public/Onboarding-3.png'
import img4 from '../public/Onboarding-4.png'
import overview1 from '../public/Onboarding-overview-1.png'

export default function Onboarding() {
  const slides = [
    // --- TRANG MỚI THÊM VÀO ĐÂY ---
    { 
      title: 'Chào mừng bạn đến với', 
      highlight: 'GreenJourney', 
      image: overview1 // Bạn có thể thay bằng ảnh Logo hoặc ảnh bìa khác
    },
    // -------------------------------
    { title: 'Chào mừng đến với', highlight: 'GreenJourney', image: img1 },
    { title: 'Rewards for', highlight: 'going green', image: img2 },
    { title: 'Check in at', highlight: 'green hotspots', image: img3 },
    { title: 'Record your', highlight: 'story', image: img4 },
    { title: 'Start today.', highlight: '', image: overview1 }
  ]

  const [index, setIndex] = useState(0)

  // Lấy dữ liệu của slide hiện tại
  const s = slides[index]

  function go(n) {
    const next = Math.max(0, Math.min(slides.length - 1, n))
    setIndex(next)
  }

  return (
    <div className="onboarding-root">
      
      {/* Slide Content */}
      <div className="onboarding-content fade-in" key={index}>
        
        <div className="onboarding-image-wrap">
          <img src={s.image} alt={`onboarding-${index}`} className="onboarding-image" />
        </div>

        <div className="onboarding-text">
          <h1 className="onboarding-title">{s.title}</h1>
          {s.highlight && <h2 className="onboarding-highlight">{s.highlight}</h2>}
        </div>

        {/* Nút tham gia chỉ hiện ở slide cuối cùng */}
        {index === slides.length - 1 && (
          <div className="onboarding-cta-wrap">
            <button className="onboarding-cta">Tham gia ngay</button>
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
          ❮
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
          ❯
        </button>
      </div>
    </div>
  )
}