import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { verifyReset, forgotPassword } from '../api/auth'
import '../styles/ResetPassword.css'
import backIcon from '../public/back.png'

export default function VerifyCode(){
  const navigate = useNavigate()
  const { state } = useLocation()
  const email = state?.email || ''
  const flow = state?.flow || 'reset'
  const [digits, setDigits] = useState(['', '', '', ''])
  const inputs = [useRef(null), useRef(null), useRef(null), useRef(null)]
  const [msg, setMsg] = useState('')
  const [invalid, setInvalid] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  useEffect(() => {
    if (!email) navigate('/reset-password')
    // focus first
    inputs[0].current?.focus()
  }, [])

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    setMsg('')
    setInvalid(false)
    if (value && index < inputs.length - 1) {
      inputs[index+1].current.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prev = inputs[index-1].current
      prev.focus()
      const next = [...digits]
      next[index-1] = ''
      setDigits(next)
    }
  }

  const handlePaste = (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData('text')
    if (!/^[0-9]{4}$/.test(paste)) return
    const arr = paste.split('')
    setDigits(arr)
    arr.forEach((d, i) => inputs[i].current.value = d)
  }

  const code = digits.join('')
  const canNext = code.length === 4 && !loading

  const submit = async () => {
    if (!canNext) return
    setLoading(true)
    setMsg('')
    try{
      await verifyReset({ email, code })
      // on successful verification, branch based on flow
      if (flow === 'signup') {
        // for account activation, show the signup complete screen
        navigate('/signup-complete')
      } else {
        // default: password reset flow -> set new password
        navigate('/set-new-password', { state: { email, code } })
      }
    }catch(err){
      setInvalid(true)
      setMsg(err?.response?.data?.message || 'Invalid code')
    }finally{ setLoading(false) }
  }

  const resend = async () => {
    try{
      await forgotPassword({ email })
      setResendMsg('We resent the code to your email')
    }catch(e){
      setResendMsg('Could not resend. Try again later.')
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-top">
        <div className="reset-title-wrap">
          <h1 className="auth-title">{flow === 'signup' ? 'ACCOUNT ACTIVATION' : 'CHECK YOUR EMAIL'}</h1>
        </div>
        <div className="auth-header">
          <button className="back-arrow" onClick={() => navigate(-1)} style={{ width: 20, height: 20, padding: 0, background: 'transparent', border: 'none' }}>
            <img src={backIcon} alt="Back" style={{ width: '100%', height: '100%' }} />
          </button>
        </div>
      </div>

      <div className="auth-form" style={{ marginTop: 12 }}>
  <p style={{ color: '#6b6b6b', marginTop: 0 }}>{flow === 'signup' ? `We sent an activation code to ${email}. Enter your 4-digit code` : `We sent a reset request to ${email}. Enter your 4-digit code`}</p>

        {invalid && <div style={{ color: '#d97a3a' }}>{msg}</div>}

        <div className="code-row" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <div key={i} className="code-cell">
              <input
                ref={inputs[i]}
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
              />
            </div>
          ))}
        </div>

        <button className="auth-btn" onClick={submit} disabled={!canNext} style={{ marginTop: 18, minHeight: 54, borderRadius: 28 }}>
          {loading ? 'Checking...' : 'Next'}
        </button>

        <div style={{ marginTop: 12, color: '#666' }}>
          Haven't received your email yet? <button className="linkish" onClick={resend}>Resend email</button>
        </div>
        {resendMsg && <div style={{ marginTop: 8, color: '#666' }}>{resendMsg}</div>}
      </div>
    </div>
  )
}
