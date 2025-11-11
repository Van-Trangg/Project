import { useNavigate } from 'react-router-dom'
import '../styles/Signup.css'
import backIcon from '../public/back.png'

export default function SignupComplete(){
  const navigate = useNavigate()
  return (
    <div className="auth-root signup-page">
        <div className="auth-top">
        <div className="auth-header">
          <button className="back-arrow" onClick={() => navigate(-1)} style={{ width: 20, height: 20, padding: 0, background: 'transparent', border: 'none' }}>
            <img src={backIcon} alt="Back" style={{ width: '100%', height: '100%' }} />
          </button>
        </div>
      </div>

      <div className="auth-form" style={{ textAlign: 'center', paddingTop: 8 }}>
        <div className="signup-success-circle" aria-hidden style={{ margin: '0 auto 18px', width: 120, height: 120, borderRadius: 9999, background: '#cfe482', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 style={{ color: '#556B2F', margin: '8px 0', fontWeight: 900, letterSpacing: 1 }}>YOU'RE ALL SET!</h2>
        <p style={{ color: '#757575', marginTop: 12, marginBottom: 24 }}>Congratulations!<br/>Account activation complete.</p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="auth-btn" onClick={() => navigate('/login')} style={{ minWidth: 260, minHeight: 54, borderRadius: 28 }}>
            Continue to Login
          </button>
        </div>
      </div>
    </div>
  )
}
