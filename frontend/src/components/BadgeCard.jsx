import React from 'react'

export default function BadgeCard({ badge, unlocked, onClick, className = '' }){
  const cost = badge.threshold || 0
  // image can be either a filename (served from /badges/<filename>) or a full URL
  const imgSrc = badge && badge.image ? (String(badge.image).startsWith('http') ? badge.image : `/badges/${badge.image}`) : null

  return (
    <div className={`badge-card ${unlocked ? 'unlocked' : 'locked'} ${className}`} onClick={() => onClick && onClick(badge)}>
      <div className="stamp">
        {imgSrc ? (
          <img src={imgSrc} alt={badge.badge || 'badge'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
        ) : (
          <div className="stamp-inner">{badge.badge ? badge.badge.charAt(0) : '🏅'}</div>
        )}
      </div>
      <div className="badge-meta">
        <div className="badge-title">{badge.badge}</div>
        <div className="badge-cost">{cost} pts</div>
      </div>
    </div>
  )
}
