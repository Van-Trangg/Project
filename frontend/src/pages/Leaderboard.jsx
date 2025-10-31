
import { useEffect, useState } from 'react'
import { getLeaderboard } from '../api/leaderboard'

export default function Leaderboard(){
  const [rows, setRows] = useState([])
  useEffect(()=>{ getLeaderboard().then(r => setRows(r.data)) }, [])

  return (
    <div style={{ padding:16 }}>
      <h1 style={{ fontSize:20, marginBottom:8 }}>Leaderboard</h1>
      <ol style={{ paddingLeft:16 }}>
        {rows.map(r => (
          <li key={r.id}>{r.user_name} – {r.points} pts</li>
        ))}
      </ol>
    </div>
  )
}