import { useNavigate } from 'react-router-dom'
import '../styles/ResetPassword.css'

export default function ResetComplete(){
  const navigate = useNavigate()
  return (
    <div className="auth-root">
      <div className="auth-top">
        <div className="reset-title-wrap">
          <h1 className="auth-title">PASSWORD RESET</h1>
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
