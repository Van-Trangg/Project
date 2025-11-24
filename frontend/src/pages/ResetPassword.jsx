import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../api/auth'
import '../styles/ResetPassword.css'
import backIcon from '../public/back.png'

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
    if (!valid) { setMsg('Vui lòng nhập địa chỉ email hợp lệ'); return }
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
        setMsg(serverMsg || 'Không tìm thấy tài khoản liên kết với email này')
      }else{
        setMsg(serverMsg || 'Không thể gửi liên kết đặt lại. Vui lòng thử lại sau.')
      }
    }finally{ setLoading(false) }
  }

return (
    <div className="auth-root">
        <div className="auth-top">
      <div className="reset-title-wrap">
        <h1 className="auth-title">ĐẶT LẠI MẬT KHẨU</h1>
      </div>
      <div className="auth-header">
                <button className="back-arrow" onClick={() => navigate(-1)} style={{ width: 20, height: 20, padding: 0, background: 'transparent', border: 'none' }}>
                  <img src={backIcon} alt="Quay lại" style={{ width: '100%', height: '100%' }} />
                </button>
      </div>
        </div>

        <div className="auth-form" style={{ marginTop: 24 }}>
            <p style={{ color: '#757575', marginTop: 0, fontWeight: 'bold' }}>Vui lòng nhập email để đặt lại mật khẩu</p>

            <label className="field">
                <div className="field-label">Địa chỉ Email</div>
        <div className="field-input" style={{ borderColor: notFound ? '#d97a3a' : undefined }}>
                    <img src={emailIcon} alt="Email" className="field-icon" />
          <input placeholder="ví dụ: email@gmail.com" value={email} onChange={e=>{ setEmail(e.target.value); setMsg(''); setNotFound(false) }} />
        </div>
            </label>

            {msg && <div style={{ color: notFound ? '#d97a3a' : '#c3824e', marginTop: 8 }}>{msg}</div>}

            <button
                className="auth-btn"
                onClick={handleNext}
                disabled={!valid || loading || notFound}
                style={{ marginTop: 18, minHeight: 54, borderRadius: 28 }}
            >
                {loading ? 'Đang gửi...' : 'Tiếp theo'}
            </button>
        </div>
    </div>
)
}
