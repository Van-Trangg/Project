import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Auth.css'
import { register } from '../api/auth'
export default function Signup(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
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
            setMsg('Account created successfully! Redirecting to login...')
            setTimeout(() => navigate('/login'), 1000)

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
    <div className="auth-root">
      <div className="auth-top">
        <div className="auth-circle">
          <h1 className="auth-title">SIGN UP</h1>
        </div>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <p className="auth-sub">Start your journey today.</p>

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
            <input placeholder="Enter your password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button type="button" className="icon-eye" aria-hidden>👁</button>
          </div>
        </label>

        <label className="field">
          <div className="field-label">Confirm Password</div>
          <div className="field-input">
            <span className="field-icon">🔒</span>
            <input placeholder="Enter your password" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} />
            <button type="button" className="icon-eye" aria-hidden>👁</button>
          </div>
        </label>

        <button className="auth-btn" type="submit">Next</button>

        {msg && <div className="auth-msg">{msg}</div>}
      </form>
    </div>
  )
}
