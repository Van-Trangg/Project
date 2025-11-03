import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile } from '../api/profile'
import backIcon from '../public/back.png'
import newBackIcon from '../public/new_back.png'
import '../styles/Profile.css'

export default function EditProfile() {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showPhone, setShowPhone] = useState(true)
  const [showLocation, setShowLocation] = useState(true)
  const [showEmail, setShowEmail] = useState(true)
  const navigate = useNavigate()
  const [backHovering, setBackHovering] = useState(false)
  const [backActive, setBackActive] = useState(false)

  useEffect(() => {
    getProfile().then(r => {
      const user = r.data
      // normalize common alternate field names from backend
      const bioVal = user.bio || user.about || user.description || ''
      const fullNameVal = user.full_name || user.name || user.display_name || ''
      const nicknameVal = user.nickname || user.username || user.handle || ''
      const birthdateVal = user.birthdate || user.dob || user.birthday || ''
      const phoneVal = user.phone || user.phone_number || user.mobile || ''
      const addressVal = user.address || user.location || user.place || ''
      const emailVal = user.email || user.mail || user.email_address || ''

      setForm({
        full_name: fullNameVal,
        nickname: nicknameVal,
        bio: bioVal,
        birthdate: birthdateVal,
        phone: phoneVal,
        address: addressVal,
        email: emailVal,
      })
    }).catch(() => setForm({
      full_name: '', nickname: '', bio: '', birthdate: '', phone: '', address: '', email: ''
    }))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!form) return
    setSaving(true)
    try {
      await updateProfile(form)
      navigate('/profile')
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate(-1)
  }

  if (!form) return <div className="loading">Loading...</div>

  return (
    <div className="edit-screen">
      {/* Cover with overlayed action buttons (back/save) */}
      <div className="edit-cover-wrapper">
        <div className="edit-cover" />
        <button
          className="back-btn"
          type="button"
          onClick={() => { setBackActive(true); handleCancel() }}
          onMouseEnter={() => setBackHovering(true)}
          onMouseLeave={() => setBackHovering(false)}
          title="Back">
          <img src={(backActive || backHovering) ? newBackIcon : backIcon} alt="Back" />
        </button>
        <button
          className="save-top btn save"
          type="button"
          onClick={handleSave}
          disabled={saving}
          title="Save">
          {saving ? 'Saving' : 'Save'}
        </button>
      </div>

      <div className="edit-avatar-wrapper">
        <div className="edit-avatar" />
        <button className="camera-small" type="button">📷</button>
      </div>

      <div className="edit-name">
        <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Full name" />
        <input name="nickname" value={form.nickname} onChange={handleChange} placeholder="@nickname" />
      </div>

      <div className="section">
        <h3>Bio</h3>
        <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Write something about yourself" />
      </div>

      <div className="section personal-details">
        <h3>Personal details</h3>

        <label className="pill-row">
          <span className="label">Phone</span>
          <div className="pill-input">
            <input type={showPhone ? 'text' : 'password'} name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
            <button className="eye" type="button" onClick={() => setShowPhone(s => !s)}>{showPhone ? '👁' : '👁️‍🗨️'}</button>
          </div>
        </label>

        <label className="pill-row">
          <span className="label">Location</span>
          <div className="pill-input">
            <input type={showLocation ? 'text' : 'password'} name="address" value={form.address} onChange={handleChange} placeholder="Location" />
            <button className="eye" type="button" onClick={() => setShowLocation(s => !s)}>{showLocation ? '👁' : '👁️‍🗨️'}</button>
          </div>
        </label>

        <label className="pill-row">
          <span className="label">Email</span>
          <div className="pill-input">
            <input type={showEmail ? 'text' : 'password'} name="email" value={form.email} onChange={handleChange} placeholder="Email" />
            <button className="eye" type="button" onClick={() => setShowEmail(s => !s)}>{showEmail ? '👁' : '👁️‍🗨️'}</button>
          </div>
        </label>
      </div>

    </div>
  )
}
