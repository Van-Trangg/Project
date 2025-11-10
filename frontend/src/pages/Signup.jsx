import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Auth.css'
import '../styles/Signup.css'
import { register } from '../api/auth'

export default function Signup() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [confirm, setConfirm] = useState('')
    const [showConfirm, setShowConfirm] = useState(false)
    const [msg, setMsg] = useState('')
    const navigate = useNavigate()

    const submit = async (e) => {
        e.preventDefault()
        setMsg('')
        if (password !== confirm) {
            setMsg('Passwords do not match')
            return
        }
        try {
            await register({ email, password })
            // after registering, go to the verification screen so the user can enter the code
            // pass a flow flag so VerifyCode knows this is an account activation flow
            navigate('/verify-code', { state: { email: email.trim(), flow: 'signup' } })

        } catch (err) {
            console.error(err)
            const detail = err.response?.data?.detail
            if (typeof detail === 'string') {
                setMsg(detail)
            } else {
                setMsg('Invalid data. Please check email or password.')
            }
        }
    }

    return (
        // Thêm class 'signup-page' để áp dụng style mới
        <div className="auth-root signup-page">
            <div className="auth-top">
                <div className="auth-circle">
                    {/* Tiêu đề này sẽ bị ẩn bởi CSS và thay bằng tiêu đề mới */}
                    <h1 className="auth-title">SIGN UP</h1>
                </div>
                {/* Thêm header mới cho trang signup */}
                <div className="auth-header">
                    <button className="back-arrow" onClick={() => navigate(-1)}>‹</button>
                    <h1 className="auth-title-signup">SIGN UP</h1>
                </div>
            </div>

            <form className="auth-form" onSubmit={submit}>
                <p className="auth-sub">Start your journey today.</p>

                <label className="field">
                    <div className="field-label">Email</div>
                    <div className="field-input">
                        <span className="field-icon">✉️</span>
                        <input placeholder="email@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                </label>

                <label className="field">
                    <div className="field-label">Password</div>
                    <div className="field-input">
                        <span className="field-icon">🔒</span>
                        <input placeholder="Enter your password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} />
                        <button
                            type="button"
                            className="icon-eye"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            onClick={() => setShowPassword(s => !s)}
                        >
                            {/* Cập nhật icon cho nhất quán */}
                            {showPassword ? '👁️' : '🙈'}
                        </button>
                    </div>
                </label>

                <label className="field">
                    <div className="field-label">Confirm Password</div>
                    <div className="field-input">
                        <span className="field-icon">🔒</span>
                        <input placeholder="Enter your password" type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} />
                        <button
                            type="button"
                            className="icon-eye"
                            aria-label={showConfirm ? 'Hide password' : 'Show password'}
                            onClick={() => setShowConfirm(s => !s)}
                        >
                            {/* Cập nhật icon cho nhất quán */}
                            {showConfirm ? '👁️' : '🙈'}
                        </button>
                    </div>
                </label>

                <button className="auth-btn" type="submit">Next</button>

                {msg && <div className="auth-msg">{msg}</div>}
            </form>
        </div>
    )
}