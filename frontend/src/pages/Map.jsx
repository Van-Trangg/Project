import { useEffect, useState } from 'react'
import { listPlaces } from '../api/map'

export default function Map(){
  const [places, setPlaces] = useState([])
  useEffect(()=>{ listPlaces().then(r => setPlaces(r.data)) }, [])

  return (
    <div style={{ padding:16 }}>
      <h1 style={{ fontSize:20, marginBottom:8 }}>Eco Map</h1>
      <ul style={{ padding:0, listStyle:'none', display:'grid', gap:12 }}>
        {places.map(p => (
          <li key={p.id} style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>
            <strong>{p.name}</strong>
            <div>Eco score: {p.eco_score}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}