import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Auth.css'
import '../styles/Signup.css'
import backIcon from '../public/back.png'
import { register } from '../api/auth'

// icons from src/public
import emailIcon from '../public/email.png'
import lockIcon from '../public/lock.png'
import showIcon from "../public/don't_eye.png"
import dontEyeIcon from '../public/show.png'

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
                                                            <button className="back-arrow" onClick={() => navigate(-1)} style={{ width: 20, height: 20, padding: 0, background: 'transparent', border: 'none' }}>
                                                                <img src={backIcon} alt="Back" style={{ width: '100%', height: '100%' }} />
                                                            </button>
                                        <h1 className="auth-title-signup">SIGN UP</h1>
                                </div>
            </div>

            <form className="auth-form" onSubmit={submit}>
                <p className="auth-sub">Start your journey today.</p>

                <label className="field">
                    <div className="field-label">Email</div>
                    <div className="field-input">
                        <img src={emailIcon} alt="email" className="field-icon" />
                        <input placeholder="email@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                </label>

                <label className="field">
                    <div className="field-label">Password</div>
                    <div className="field-input">
                        <img src={lockIcon} alt="lock" className="field-icon" />
                        <input placeholder="Enter your password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} />
                        <button
                            type="button"
                            className="icon-eye"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            onClick={() => setShowPassword(s => !s)}
                        >
                            <img src={showPassword ? dontEyeIcon : showIcon} alt={showPassword ? 'Hide' : 'Show'} style={{ width: 20, height: 20 }} />
                        </button>
                    </div>
                </label>

                <label className="field">
                    <div className="field-label">Confirm Password</div>
                    <div className="field-input">
                        <img src={lockIcon} alt="lock" className="field-icon" />
                        <input placeholder="Enter your password" type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} />
                        <button
                            type="button"
                            className="icon-eye"
                            aria-label={showConfirm ? 'Hide password' : 'Show password'}
                            onClick={() => setShowConfirm(s => !s)}
                        >
                            <img src={showConfirm ? dontEyeIcon : showIcon} alt={showConfirm ? 'Hide' : 'Show'} style={{ width: 20, height: 20 }} />
                        </button>
                    </div>
                </label>

                <button className="auth-btn" type="submit">Next</button>

                {msg && <div className="auth-msg">{msg}</div>}
            </form>
        </div>
    )
}