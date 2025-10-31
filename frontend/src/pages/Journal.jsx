import { useEffect, useState } from 'react'
import { listJournals } from '../api/journal'

export default function Journal(){
  const [items, setItems] = useState([])
  useEffect(()=>{ listJournals().then(r => setItems(r.data)) }, [])

  return (
    <div style={{ padding:16 }}>
      <h1 style={{ fontSize:20, marginBottom:8 }}>Travel Journal</h1>
      {items.length === 0 && <p>No journals yet.</p>}
      <ul style={{ padding:0, listStyle:'none', display:'grid', gap:12 }}>
        {items.map(j => (
          <li key={j.id} style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>
            <h3 style={{ marginBottom:4 }}>{j.title}</h3>
            <p style={{ color:'#4b5563' }}>{j.content}</p>
            <small>Eco score: {j.eco_score}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}