import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { setNewPassword } from '../api/auth'
import '../styles/ResetPassword.css'

// icons from src/public
import lockIcon from '../public/lock.png'
import showIcon from "../public/don't_eye.png"
import dontEyeIcon from '../public/show.png'
import backIcon from '../public/back.png'

export default function SetNewPassword(){
  const navigate = useNavigate()
  const { state } = useLocation()
  const email = state?.email || ''
  const code = state?.code || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  if (!email || !code) {
    // redirect back to start if missing context
    navigate('/reset-password')
    return null
  }

  const validPwd = password.length >= 8
  const match = password === confirm && confirm.length > 0
  const canUpdate = validPwd && match && !loading

  const submit = async () => {
    if (!canUpdate) {
      setMsg('Please make sure passwords match and have at least 8 characters')
      return
    }
    setLoading(true)
    setMsg('')
    try{
      await setNewPassword({ email, code, password })
      navigate('/reset-complete')
    }catch(err){
      setMsg(err?.response?.data?.message || 'Could not update password')
    }finally{ setLoading(false) }
  }

  return (
    <div className="auth-root">
      <div className="auth-top">
        <div className="reset-title-wrap">
          <h1 className="auth-title">SET A NEW PASSWORD</h1>
        </div>
        <div className="auth-header">
          <button className="back-arrow" onClick={() => navigate(-1)} style={{ width: 20, height: 20, padding: 0, background: 'transparent', border: 'none' }}>
            <img src={backIcon} alt="Back" style={{ width: '100%', height: '100%' }} />
          </button>
        </div>
      </div>

      <div className="auth-form" style={{ marginTop: 18 }}>
        <p style={{ color: '#6b6b6b', marginTop: 0 }}>Create a new password. Ensure it differs from previous ones for security.</p>

        <label className="field">
          <div className="field-label">New Password</div>
          <div className="field-input">
            <img src={lockIcon} alt="lock" className="field-icon" />
            <input
              placeholder="Enter your password"
              type={show1 ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button type="button" className="icon-eye" onClick={() => setShow1(s => !s)} aria-label={show1 ? 'Hide password' : 'Show password'}>
              <img src={show1 ? dontEyeIcon : showIcon} alt={show1 ? 'Hide' : 'Show'} style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </label>

        <label className="field">
          <div className="field-label">Confirm Password</div>
          <div className="field-input">
            <img src={lockIcon} alt="lock" className="field-icon" />
            <input
              placeholder="Enter your password"
              type={show2 ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
            <button type="button" className="icon-eye" onClick={() => setShow2(s => !s)} aria-label={show2 ? 'Hide password' : 'Show password'}>
              <img src={show2 ? dontEyeIcon : showIcon} alt={show2 ? 'Hide' : 'Show'} style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </label>

        {msg && <div style={{ color: '#d97a3a', marginTop: 8 }}>{msg}</div>}

        <button className="auth-btn" onClick={submit} disabled={!canUpdate} style={{ marginTop: 18, minHeight: 54, borderRadius: 28 }}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  )
}
