import { useEffect, useState } from 'react'
import { getProfile } from '../api/profile'

export default function Profile(){
  const [user, setUser] = useState(null)
  useEffect(()=>{ getProfile().then(r => setUser(r.data)) }, [])

  if(!user) return <div style={{ padding:16 }}>Loading…</div>
  return (
    <div style={{ padding:16 }}>
      <h1 style={{ fontSize:20, marginBottom:8 }}>Your Profile</h1>
      <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:16 }}>
        <p><strong>Name:</strong> {user.full_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Eco Points:</strong> {user.eco_points}</p>
      </div>
    </div>
  )
}