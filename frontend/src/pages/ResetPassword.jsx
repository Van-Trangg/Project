import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../api/auth'
import '../styles/ResetPassword.css'

// icons from src/public
import emailIcon from '../public/email.png'

export default function ResetPassword(){
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const valid = emailRe.test(email.trim())

  const handleNext = async () => {
    if (!valid) { setMsg('Please enter a valid email address'); return }
    setLoading(true)
    setMsg('')
    setNotFound(false)
  try{
  const { data } = await forgotPassword({ email: email.trim() })
  // on success navigate to verify-code and pass email in state
  navigate('/verify-code', { state: { email: email.trim() } })
    }catch(err){
      const serverMsg = err?.response?.data?.message
      // if server indicates no account, show the orange message and keep Next disabled
      if (err?.response?.status === 404 || /no account/i.test(serverMsg || '')){
        setNotFound(true)
        setMsg(serverMsg || 'There is no account linked to the email you provided')
      }else{
        setMsg(serverMsg || 'Could not send reset link. Please try again later.')
      }
    }finally{ setLoading(false) }
  }

return (
    <div className="auth-root">
        <div className="auth-top">
            <div className="reset-title-wrap">
                <h1 className="auth-title">PASSWORD RESET</h1>
            </div>
        </div>

        <div className="auth-form" style={{ marginTop: 24 }}>
            <p style={{ color: '#757575', marginTop: 0, fontWeight: 'bold' }}>Please enter your email to reset password</p>

            <label className="field">
                <div className="field-label">Email</div>
        <div className="field-input" style={{ borderColor: notFound ? '#d97a3a' : undefined }}>
                    <img src={emailIcon} alt="email" className="field-icon" />
          <input placeholder="email@gmail.com" value={email} onChange={e=>{ setEmail(e.target.value); setMsg(''); setNotFound(false) }} />
        </div>
            </label>

            {msg && <div style={{ color: notFound ? '#d97a3a' : '#c3824e', marginTop: 8 }}>{msg}</div>}

            <button
                className="auth-btn"
                onClick={handleNext}
                disabled={!valid || loading || notFound}
                style={{ marginTop: 18, minHeight: 54, borderRadius: 28 }}
            >
                {loading ? 'Sending...' : 'Next'}
            </button>
        </div>
    </div>
)
}
