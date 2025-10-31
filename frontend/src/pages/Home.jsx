import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/apiClient'

export default function Home(){
  const [data, setData] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{ api.get('/home').then(r => setData(r.data)) }, [])

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Welcome 👋</h1>
      <p style={{ color:'#4b5563', marginBottom: 16 }}>GreenJourney – travel greener, earn eco points.</p>

      {/* Nút chuyển đến User Profile */}
      <button onClick={()=> navigate('/profile')} style={btnPrimary}>Go to Profile</button>

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Features</h2>
        <ul style={{ display:'flex', gap:12, padding:0, listStyle:'none', flexWrap:'wrap' }}>
          {data?.features?.map(f => (
            <li key={f} style={chip}>{f}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const btnPrimary = { padding: '10px 14px', borderRadius: 12, border:'1px solid #065f46', background:'#10b98120', color:'#065f46' }
const chip = { padding:'6px 10px', border:'1px solid #e5e7eb', borderRadius: 999 }