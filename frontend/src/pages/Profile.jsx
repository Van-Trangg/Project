import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile } from '../api/profile'
import editIcon from '../public/edit.png'
import newEditIcon from '../public/new_edit.png'
import exitIcon from '../public/exit.png'
import newExitIcon from '../public/new_exit.png'
import backIcon from '../public/back.png'
import newBackIcon from '../public/new_back.png'
import '../styles/Profile.css'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [hoveringEdit, setHoveringEdit] = useState(false)
  const [backHovering, setBackHovering] = useState(false)
  const [backActive, setBackActive] = useState(false)
  const [exitHovering, setExitHovering] = useState(false)
  const [exitActive, setExitActive] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getProfile()
      .then(r => setUser(r.data))
      .catch(err => {
        console.error('Failed to load profile', err)
        setError(err)
      })
  }, [])

  if (error) return <div className="loading">Không tải được profile. Vui lòng thử lại sau.</div>
  if (!user) return <div className="loading">Loading...</div>

  // normalize fields with common alternate backend keys
  const fullName = user.full_name || user.name || user.display_name || ''
  const nickName = user.nickname || user.username || user.handle || ''
  const birthdateVal = user.birthdate || user.dob || user.birthday || ''
  const phoneVal = user.phone || user.phone_number || user.mobile || ''
  const addressVal = user.address || user.location || user.place || ''
  const emailVal = user.email || user.mail || user.email_address || ''

  const startEdit = () => {
    setEditing(true)
    navigate('/edit-profile')
  }

  const cancelEdit = () => {
    setEditing(false)
    setForm(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!form) return
    setSaving(true)
    const updated = { ...user, ...form }
    setUser(updated)
    try {
      await updateProfile(form)
      setEditing(false)
      setForm(null)
    } catch (err) {
      console.error('Failed to save profile', err)
      getProfile()
        .then(r => setUser(r.data))
        .catch(() => {})
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-page">
      {/* HEADER */}
      <div className="profile-header">
        <button
          className="back-rect"
          onClick={() => { setBackActive(true); navigate(-1) }}
          onMouseEnter={() => setBackHovering(true)}
          onMouseLeave={() => setBackHovering(false)}
          title="Back">
          <img src={(backActive || backHovering) ? newBackIcon : backIcon} alt="Back" />
        </button>

        <button
  className="exit-rect"
  onClick={() => {
    setExitActive(true)
    setShowExitConfirm(true)
  }}
  onMouseEnter={() => setExitHovering(true)}
  onMouseLeave={() => setExitHovering(false)}
  title="Exit"
>
  <img
    src={exitHovering ? newExitIcon : exitIcon}
    alt="Exit"
  />
</button>

        <div className="cover-placeholder"></div>

        <button
          className="edit-btn"
          onClick={startEdit}
          onMouseEnter={() => setHoveringEdit(true)}
          onMouseLeave={() => setHoveringEdit(false)}
          title="Edit profile">
          <img src={(editing || hoveringEdit) ? newEditIcon : editIcon} alt="Edit" />
        </button>

        <div className="avatar-wrapper">
          <div className="avatar-placeholder"></div>
          {/* <button className="camera-btn">📸</button> */}
        </div>
      </div>

      {/* INFO */}
      <div className="profile-info">
        {!editing ? (
          <>
            <h2>{fullName || 'Tên tao đâu'}</h2>
            <p className="nickname">@{nickName || 'nickname?'}</p>
            <p className="profile-bio">{user.bio || user.about || user.description || 'đù má code cái này dui hé'}</p>
          </>
        ) : (
          <div className="edit-form">
            <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Full name" />
            <input name="nickname" value={form.nickname} onChange={handleChange} placeholder="Nickname" />
            <div className="form-actions">
              <button className="btn save" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button className="btn cancel" onClick={cancelEdit} disabled={saving}>Cancel</button>
            </div>
          </div>
        )}

        <div className="stats">
          <div><strong>{user.checkins || 100}</strong><p>Check-ins</p></div>
          <div><strong>{user.badges || 40}</strong><p>Badges</p></div>
          <div><strong>{user.rank || 20}</strong><p>Rank</p></div>
        </div>

        {/* THÔNG TIN CÁ NHÂN */}
        <div className="section personal-details">
          <h3>Personal details</h3>
          <div className="info-fields">
          <div className="info-block">
            <span className="info-label">Phone</span>
            <div className="info-value"><span className="value-text">{phoneVal || '-'}</span></div>
          </div>

          <div className="info-block">
            <span className="info-label">Location</span>
            <div className="info-value"><span className="value-text">{addressVal || '-'}</span></div>
          </div>

          <div className="info-block">
            <span className="info-label">Email</span>
            <div className="info-value"><span className="value-text">{emailVal || '-'}</span></div>
          </div>
          </div>
        </div>
        </div>

      {/* BADGES */}
      {/* Exit confirmation modal */}
      {showExitConfirm && (
        <div
          className="exit-confirm-overlay"
          onClick={() => setShowExitConfirm(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}
        >
          <div
            className="exit-confirm"
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#EFF5D2', padding: 28, borderRadius: 30, width: '88%', maxWidth: 320, textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.25)' }}
          >
            <button
              type="button"
              onClick={() => setShowExitConfirm(false)}
              aria-label="Close"
              style={{ position: 'absolute', right: 22, top: 18, background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' }}
            >
              ✕
            </button>
            <h3 style={{ color: '#556B2F', fontSize: 20, margin: '12px 0 18px', fontWeight: 700 }}>Are you sure you want to log out?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => { setShowExitConfirm(false); navigate('/checkout'); }}
                className="btn exit-logout-btn"
              >
                Log out
              </button>

              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="btn btn-secondary exit-back-btn"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="badges-section">
        <h3>Badges</h3>
        <div className="badge-list">
          <div className="badge-card placeholder"></div>
          <div className="badge-card placeholder"></div>
          <div className="badge-card placeholder"></div>
        </div>
      </div>
    </div>
  )
}
