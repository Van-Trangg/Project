import React, { useState } from 'react'
import crownIcon from '../public/crown.png'
import { baseURL } from '../api/apiClient'
export default function BadgeCard({ badge, unlocked, onClick, className = '' }){
  const cost = badge.threshold || 0

  const handleClick = () => {
    if (onClick) onClick(badge)
  }
  // image can be either:
  // - a full URL (starts with 'http'),
  // - an absolute public path (starts with '/'), e.g. '/back.png',
  // - or a filename served from /badges/<filename>
const imgSrc = badge && badge.image
    ? (String(badge.image).startsWith('http')
        ? badge.image 
        : (String(badge.image).startsWith('/') 
            ? badge.image 
            : `${baseURL}/badges/${badge.image}`) 
      )
    : null

  return (
    <div className={`badge-card ${unlocked ? 'unlocked' : 'locked'} ${className}`} onClick={handleClick}>
      <div className="stamp">
        {imgSrc ? (
          <img src={imgSrc} alt={badge.badge || 'badge'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
        ) : (
          <div className="stamp-inner">{badge.badge ? badge.badge.charAt(0) : '🏅'}</div>
        )}
        {/* crown overlay for rare badges */}
        {badge && badge.rare && (
          <img src={crownIcon} alt="rare" className="badge-crown" />
        )}
      </div>
      <div className="badge-meta">
        <div className="badge-title">{badge.badge}</div>
        <div className="badge-cost">{cost} pts</div>
      </div>
    </div>
  )
}
