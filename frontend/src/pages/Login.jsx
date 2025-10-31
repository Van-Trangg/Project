import { useState } from 'react'
import { login } from '../api/auth'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    try{ const { data } = await login({ email, password }); setMsg(`Welcome ${data.user.email}`) }catch(e){ setMsg('Login failed') }
  }

  return (
    <div style={{ padding:16 }}>
      <h1 style={{ fontSize:20, marginBottom:8 }}>Login</h1>
      <form onSubmit={submit} style={{ display:'grid', gap:8, maxWidth:360 }}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={input}/>
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={input}/>
        <button style={btn}>Sign in</button>
        <div>{msg}</div>
      </form>
    </div>
  )
}

const input = { padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:12 }
const btn = { padding:'10px 14px', borderRadius:12, border:'1px solid #111827', background:'#111827', color:'#fff' }