import React, { useEffect, useState, useRef } from 'react'
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
const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('vi-VN');
};
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

  // modal image rotation (drag to rotate around Y axis)
  const [modalRotation, setModalRotation] = useState(0)
  const [modalDragging, setModalDragging] = useState(false)
  const modalDraggingRef = useRef(false)
  const modalStartX = useRef(0)
  const modalStartRotation = useRef(0)
  const modalMoved = useRef(false)
  // Increase modal sensitivity so large image rotates more with less pointer movement
  const MODAL_SENSITIVITY = 1.0

  // inertia refs
  const modalVelocityRef = useRef(0) // deg per ms
  const modalLastXRef = useRef(0)
  const modalLastTimeRef = useRef(0)
  const modalAnimRef = useRef(null)

  // smoothing: use exponential decay (friction) during inertia
  // Lower friction => slower decay => smoother, longer spin
  const FRICTION = 0.0009 // per ms; smaller value = longer, smoother inertia

  const onModalPointerMove = (e) => {
    if (!modalDraggingRef.current) return
    const clientX = (e && e.clientX) || 0
    const delta = clientX - modalStartX.current
    if (Math.abs(delta) > 3) modalMoved.current = true

    const nextRot = modalStartRotation.current + delta * MODAL_SENSITIVITY
    setModalRotation(nextRot)

    // compute instantaneous velocity (px per ms) and convert to deg/ms
    const now = performance.now()
    const lastT = modalLastTimeRef.current || now
    const lastX = modalLastXRef.current || clientX
    const dt = Math.max(1, now - lastT)
    const dx = clientX - lastX
    const velPxPerMs = dx / dt
    // apply a light EMA for velocity for smoother feeling
    const instVel = velPxPerMs * MODAL_SENSITIVITY
    // increase smoothing (more weight to previous velocity) for steadier inertia
    modalVelocityRef.current = modalVelocityRef.current * 0.92 + instVel * 0.08
    modalLastXRef.current = clientX
    modalLastTimeRef.current = now
  }

  const stopModalInertia = () => {
    if (modalAnimRef.current) {
      cancelAnimationFrame(modalAnimRef.current)
      modalAnimRef.current = null
    }
    modalVelocityRef.current = 0
  }

  const onModalPointerUp = (e) => {
    if (!modalDraggingRef.current) return
    modalDraggingRef.current = false
    setModalDragging(false)
    window.removeEventListener('pointermove', onModalPointerMove)
    window.removeEventListener('pointerup', onModalPointerUp)

    // if there was movement, start inertia using RAF with exponential decay
    if (modalMoved.current && Math.abs(modalVelocityRef.current) > 0.0002) {
      let v = modalVelocityRef.current
      let lastTs = null
      const step = (ts) => {
        if (lastTs == null) lastTs = ts
        const dt = ts - lastTs
        lastTs = ts
        // update rotation
        setModalRotation(r => r + v * dt)
        // apply friction (exponential decay)
        v = v * Math.exp(-FRICTION * dt)
        // stop when velocity is tiny
        if (Math.abs(v) > 0.0002) {
          modalAnimRef.current = requestAnimationFrame(step)
        } else {
          modalAnimRef.current = null
          modalVelocityRef.current = 0
        }
      }
      if (modalAnimRef.current) cancelAnimationFrame(modalAnimRef.current)
      modalAnimRef.current = requestAnimationFrame(step)
    }

    modalMoved.current = false
    modalLastTimeRef.current = 0
    modalLastXRef.current = 0
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
                <img
                  className="modal-image"
                  src={imgFor(selected.image)}
                  alt={selected.badge}
                  onPointerDown={(e) => {
                    // start dragging rotation for modal image
                    // cancel any running inertia
                    stopModalInertia()
                    modalDraggingRef.current = true
                    modalMoved.current = false
                    modalStartX.current = e.clientX || 0
                    modalStartRotation.current = modalRotation
                    modalLastXRef.current = modalStartX.current
                    modalLastTimeRef.current = performance.now()
                    setModalDragging(true)
                    window.addEventListener('pointermove', onModalPointerMove)
                    window.addEventListener('pointerup', onModalPointerUp)
                  }}
                  style={{ transform: `rotateY(${modalRotation}deg)`, transition: modalDragging ? 'none' : 'transform 360ms ease-out', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                />
              ) : (
                <div className="stamp-large">{selected.badge ? selected.badge.charAt(0) : '🏅'}</div>
              )}
            </div>

            <div className="modal-title-pill">{selected.badge}</div>
            <div className="modal-sub">
              {selected.unlocked && selected.obtained_at ? (
                  <strong>Obtained on {formatDate(selected.obtained_at)}</strong>
              ) : selected.unlocked ? (
                  // Trường hợp unlocked nhưng là dữ liệu cũ chưa có ngày (migration)
                  <strong>Unlocked</strong>
              ) : (
                  <strong>Locked - Reach {selected.threshold} points</strong>
              )}
            </div>

            <div className="modal-desc">{selected.description}</div>
          </div>
        </div>
      )}
    </div>
  )
}
