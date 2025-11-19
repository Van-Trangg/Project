import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listBadgesForUser, listBadges } from '../api/reward'
import BadgeCard from '../components/BadgeCard'
import '../styles/Badges.css'
import backIcon from '../public/back.png'
import { baseURL } from '../api/apiClient'
import newBackIcon from '../public/new_back.png'

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
  const [backHovering, setBackHovering] = useState(false)
  const [backActive, setBackActive] = useState(false)
  const [badges, setBadges] = useState([])
  const [versions, setVersions] = useState([])
  const [user, setUser] = useState(null)
  const [selected, setSelected] = useState(null)
  const imgFor = (img) => {
    if (!img) return null
    const s = String(img)
    if (s.startsWith('http') || s.startsWith('/')) return img
    // Use full backend static URL so images load when frontend served from dev server
    return `${baseURL}/badges/${img}`
  }

  useEffect(()=>{
    // try to fetch user-specific badges (includes unlocked flag and eco_points)
    listBadgesForUser().then(r => {
      const payload = r.data || { versions: [] }
      // keep both keys so UI can read either `eco_points` or `total_eco_points`
      setUser({ eco_points: payload.eco_points, total_eco_points: payload.eco_points })
      setVersions(payload.versions || [])
    }).catch(()=>{
      // fallback to public listing if user not authenticated
      listBadges().then(r => {
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
      <button
        className="back-btn"
        onClick={() => { setBackActive(true); navigate('/profile'); setTimeout(()=>setBackActive(false), 150) }}
        onMouseEnter={() => setBackHovering(true)}
        onMouseLeave={() => { setBackHovering(false); setBackActive(false) }}
        onMouseDown={() => setBackActive(true)}
        onMouseUp={() => setBackActive(false)}
        title="Back"
        style={{ zIndex: 1000, transform: backHovering ? 'translateY(-2px) scale(1.03)' : 'none', transition: 'transform .12s ease' }}
      >
        <img src={(backActive || backHovering) ? newBackIcon : backIcon} alt="Back" />
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

            <div className="modal-image-wrap">
              {imgFor(selected.image) ? (
                <img className="modal-image" src={imgFor(selected.image)} alt={selected.badge} />
              ) : (
                <div className="stamp-large">{selected.badge ? selected.badge.charAt(0) : '🏅'}</div>
              )}
            </div>

            <div className="modal-title-pill">{selected.badge}</div>
            <div className="modal-sub">
              <strong>Obtained on {new Date().toLocaleDateString()}</strong>
            </div>

            <div className="modal-desc">{selected.description}</div>
          </div>
        </div>
      )}
    </div>
  )
}
