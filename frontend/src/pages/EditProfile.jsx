import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile, updateProfileMultipart } from '../api/profile'
import backIcon from '../public/back.png'
import newBackIcon from '../public/new_back.png'
import camIcon from '../public/camera.png'
import showIcon from "../public/don't_eye.png"
import dontEyeIcon from '../public/show.png'
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
  const [showPhotoOptions, setShowPhotoOptions] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    getProfile().then(r => {
      const user = r.data
      // normalize common alternate field names from backend
      const bioVal = user.bio || user.about || user.description || ''
      const fullNameVal = user.full_name || user.name || user.display_name || ''
      const nicknameVal = user.nickname || user.username || user.handle || ''
      const phoneVal = user.phone || user.phone_number || user.mobile || ''
      const addressVal = user.address || user.location || user.place || ''
      const emailVal = user.email || user.mail || user.email_address || ''
      setForm({
        full_name: fullNameVal,
        nickname: nicknameVal,
        bio: bioVal,
        phone: phoneVal,
        address: addressVal,
        email: emailVal,
        avatar_url: user.avatar_url || null, 
        avatar: null, 
      })
    }).catch(() => setForm({
        full_name: '', nickname: '', bio: '', phone: '', address: '', email: '', avatar_url: null, avatar: null
    }))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSelect = (e) => {
    const f = e.target.files && e.target.files[0]
    if (f) {
      const previewUrl = URL.createObjectURL(f)
      setPreview(previewUrl)
      console.log('Ảnh mới:', f)
      // also keep a reference to the file in the form so it can be uploaded on save
      setForm(prev => ({ ...prev, avatar: f }))
    }
  }

  // revoke object URL when preview changes or component unmounts
  useEffect(() => {
    return () => {
      if (preview) {
        try { URL.revokeObjectURL(preview) } catch (err) { /* ignore */ }
      }
    }
  }, [preview])

  const handleSave = async () => {
    if (!form) return
    setSaving(true)
    try {
      await updateProfileMultipart(form)
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
        <div
            className="edit-avatar"
            style={{ 
              backgroundImage: `url(${preview || form.avatar_url || ''})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        <button
          className="camera-small"
          type="button"
          onClick={() => setShowPhotoOptions(true)}
          title="Change photo"
        >
          <img src={camIcon} alt="Camera" />
        </button>

        {/* Hidden file inputs: one for library, one with capture for camera */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleSelect(e)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => handleSelect(e)}
        />

        {/* Photo options modal */}
        {showPhotoOptions && (
          <div className="photo-options-overlay" onClick={() => setShowPhotoOptions(false)}>
            <div className="photo-options" onClick={(e) => e.stopPropagation()}>
              <h3 className="photo-options-title">Change Profile Picture</h3>
              <button
                type="button"
                onClick={() => {
                  setShowPhotoOptions(false)
                  fileInputRef.current && fileInputRef.current.click()
                }}
                className="btn"
              >
                Chọn từ thư viện
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPhotoOptions(false)
                  cameraInputRef.current && cameraInputRef.current.click()
                }}
                className="btn"
              >
                Chụp ảnh
              </button>

              <button type="button" onClick={() => setShowPhotoOptions(false)} className="btn btn-secondary">
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar preview handling */}

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
            <button className="eye" type="button" onClick={() => setShowPhone(s => !s)} aria-label={showPhone ? 'Hide' : 'Show'}>
              <img src={showPhone ? dontEyeIcon : showIcon} alt={showPhone ? 'Hide' : 'Show'} style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </label>

        <label className="pill-row">
          <span className="label">Location</span>
          <div className="pill-input">
            <input type={showLocation ? 'text' : 'password'} name="address" value={form.address} onChange={handleChange} placeholder="Location" />
            <button className="eye" type="button" onClick={() => setShowLocation(s => !s)} aria-label={showLocation ? 'Hide' : 'Show'}>
              <img src={showLocation ? dontEyeIcon : showIcon} alt={showLocation ? 'Hide' : 'Show'} style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </label>

        <label className="pill-row">
          <span className="label">Email</span>
          <div className="pill-input">
            <input type={showEmail ? 'text' : 'password'} name="email" value={form.email} onChange={handleChange} placeholder="Email" />
            <button className="eye" type="button" onClick={() => setShowEmail(s => !s)} aria-label={showEmail ? 'Hide' : 'Show'}>
              <img src={showEmail ? dontEyeIcon : showIcon} alt={showEmail ? 'Hide' : 'Show'} style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </label>
      </div>

    </div>
  )
}
