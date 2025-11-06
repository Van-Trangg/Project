import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import '../styles/Auth.css'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [msg, setMsg] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    // client-side email format validation
    const emailTrim = email.trim()
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailTrim || !emailRe.test(emailTrim)) {
      setMsg('Please enter a valid email address')
      return
    }

    try{
      const { data } = await login({ email: emailTrim, password })
      setMsg(`Welcome ${data.user.email}`)
    }catch(e){ setMsg('Login failed') }
  }

  // Forgot password state & handler
  const navigate = useNavigate()

  return (
    <div className="auth-root">
      <div className="auth-top">
        <div className="auth-circle">
          <h1 className="auth-title">Login</h1>
        </div>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <label className="field">
          <div className="field-label">Email</div>
          <div className="field-input">
            <span className="field-icon">✉️</span>
            <input placeholder="email@gmail.com" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
        </label>

        <label className="field">
          <div className="field-label">Password</div>
          <div className="field-input">
            <span className="field-icon">🔒</span>
            <input
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e=>setPassword(e.target.value)}
            />
            <button
              type="button"
              className="icon-eye"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(s => !s)}
            >
              {showPassword ? '👁' : 'no'}
            </button>
          </div>
        </label>

  <div className="forgot" role="button" tabIndex={0} onClick={() => navigate('/reset-password')}>Forgot Password</div>

        <button className="auth-btn" type="submit">Login</button>

        <div className="signup">Don't have an account? <a href="/signup">Sign up</a></div>

        {msg && <div className="auth-msg">{msg}</div>}
      </form>

      
    </div>
  )
}