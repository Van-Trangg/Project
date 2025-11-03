import { useState } from 'react'
import { login } from '../api/auth'
import '../styles/Auth.css'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    try{
      const { data } = await login({ email, password })
      setMsg(`Welcome ${data.user.email}`)
    }catch(e){ setMsg('Login failed') }
  }

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
            <input placeholder="Enter your password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button type="button" className="icon-eye" aria-hidden>👁</button>
          </div>
        </label>

        <div className="forgot">Forgot Password</div>

        <button className="auth-btn" type="submit">Login</button>

        <div className="signup">Don't have an account? <a href="/signup">Sign up</a></div>

        {msg && <div className="auth-msg">{msg}</div>}
      </form>
    </div>
  )
}