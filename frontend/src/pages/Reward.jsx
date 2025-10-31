import { useEffect, useState } from 'react'
import { listRewards } from '../api/reward'

export default function Reward(){
  const [items, setItems] = useState([])
  useEffect(()=>{ listRewards().then(r => setItems(r.data)) }, [])

  return (
    <div style={{ padding:16 }}>
      <h1 style={{ fontSize:20, marginBottom:8 }}>Rewards</h1>
      <ul style={{ padding:0, listStyle:'none', display:'grid', gap:12 }}>
        {items.map(b => (
          <li key={b.id} style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>
            <strong>{b.badge}</strong> – unlock at {b.threshold} pts
          </li>
        ))}
      </ul>
    </div>
  )
}