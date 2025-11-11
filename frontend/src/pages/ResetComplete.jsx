import { useNavigate } from 'react-router-dom'
import '../styles/ResetPassword.css'
import backIcon from '../public/back.png'

export default function ResetComplete(){
  const navigate = useNavigate()
  return (
    <div className="auth-root">
      <div className="auth-top">
        <div className="reset-title-wrap">
          <h1 className="auth-title">PASSWORD RESET</h1>
        </div>
        <div className="auth-header">
          <button className="back-arrow" onClick={() => navigate(-1)} style={{ width: 20, height: 20, padding: 0, background: 'transparent', border: 'none' }}>
            <img src={backIcon} alt="Back" style={{ width: '100%', height: '100%' }} />
          </button>
        </div>
      </div>

      <div className="auth-form" style={{ marginTop: 24 }}>
        <p style={{ color: '#6b6b6b', marginTop: 0 }}>Your password has been successfully reset. Click confirm to set a new password</p>

        <button className="auth-btn" onClick={() => navigate('/login')} style={{ marginTop: 18, minHeight: 54, borderRadius: 28 }}>
          Confirm
        </button>
      </div>
    </div>
  )
}
