import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listRewardsForUser, listRewards } from '../api/reward'
import BadgeCard from '../components/BadgeCard'
import '../styles/Badges.css'
import backIcon from '../public/back.png'

function groupByThreshold(items){
  const map = {}
  items.forEach(it => {
    const key = it.threshold || 0
    if (!map[key]) map[key] = []
    map[key].push(it)
  })
  // return sorted by threshold ascending
  return Object.keys(map).map(k => ({ threshold: Number(k), items: map[k] })).sort((a,b)=>a.threshold-b.threshold)
}

export default function Badges(){
  const navigate = useNavigate()
  const [badges, setBadges] = useState([])
  const [versions, setVersions] = useState([])
  const [user, setUser] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(()=>{
    // try to fetch user-specific rewards (includes unlocked flag and eco_points)
    listRewardsForUser().then(r => {
      const payload = r.data || { versions: [] }
      setUser({ eco_points: payload.eco_points })
      setVersions(payload.versions || [])
    }).catch(()=>{
      // fallback to public listing if user not authenticated
      listRewards().then(r => {
        // public listing returns an array of versions (from backend)
        setVersions(r.data || [])
      }).catch(()=>{
        setVersions([])
      })
    })
  }, [])

  const handleClick = (badge) => {
    setSelected(badge)
  }

  const closeModal = () => setSelected(null)

  // If backend returned unlocked flags we prefer them; otherwise fall back to comparing points
  const isUnlocked = (badge) => {
    if (badge && typeof badge.unlocked === 'boolean') return badge.unlocked
    if (!user) return false
    return (user.eco_points || 0) >= (badge.threshold || 0)
  }

  return (
    <div className="badges-page">

      <header className="badges-header">
      {/* top-left back button to match other pages */}
      <button className="back-btn" onClick={() => navigate('/profile')} title="Back">
        <img src={backIcon} alt="Back" />
      </button>
        <h1>Badges</h1>
        <p className="badges-sub">Collect badges by reaching milestones. Your current points: <strong>{user ? user.total_eco_points : '—'}</strong></p>
      </header>

      <div className="badges-grid">
        {versions.map(v => (
          <section className="badge-version" key={v.version}>
            <h2 className="version-title">{v.title || `Version ${v.version}`}</h2>
            <div className="version-list">
              {v.badges.map(b => (
                <BadgeCard key={b.id} badge={b} unlocked={isUnlocked(b)} onClick={handleClick} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {selected && (
        <div className="badge-modal" onClick={closeModal}>
          <div className="badge-modal-inner" onClick={e=>e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <div className="modal-stamp">
              <div className="stamp-large">{selected.badge ? selected.badge.charAt(0) : '🏅'}</div>
            </div>
            <h2 className="modal-title">{selected.badge}</h2>
            <div className="modal-info">Requires <strong>{selected.threshold}</strong> pts to unlock.</div>
            <div className="modal-actions">
              {isUnlocked(selected.threshold) ? (
                <button className="btn primary">Unlocked</button>
              ) : (
                <button className="btn disabled">Locked</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
