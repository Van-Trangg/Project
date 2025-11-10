// Leaderboard.jsx
import { useEffect, useState } from "react";
import "../styles/Leaderboard.css";
//import { getLeaderboard } from '../api/leaderboard'

// Podium component for the top 3
function Podium({ user_name, points, id, color }) {
  return (
    <div className="podium">
      <div className="top-info">
        <div className="avatar" />
        <div className="name">{user_name}</div>
        {/* Fixed: Use the points prop directly instead of p.points */}
        <div className="points">{points}</div>
      </div>
      <div className="base" style={{ backgroundColor: color }}>
        <div className="rank">{id}</div>
      </div>
    </div>
  );
}

// Main Leaderboard Component
export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  //  useEffect(()=>{ getLeaderboard().then(r => setRows(r.data)) }, [])
  useEffect(() => {
    const mockData = [
      { id: 1, user_name: "Name", points: 3123 },
      { id: 2, user_name: "Name", points: 2453 },
      { id: 3, user_name: "Name", points: 1100 },
      { id: 4, user_name: "Name", points: 1000 },
      { id: 5, user_name: "Name", points: 987 },
      { id: 6, user_name: "Name", points: 870 },
      { id: 7, user_name: "Name", points: 750 },
      { id: 8, user_name: "Name", points: 300 },
      { id: 9, user_name: "Name", points: 240 },
      { id: 10, user_name: "Name", points: 100 },
    ];
    setTimeout(() => {
      setRows(mockData);
    }, 100);
  }, []);

  // --- PREVENTS BLANK PAGE ---
  // If rows is not yet an array, show a loading message
  if (!rows || rows.length === 0) {
    return <div className="leaderboard-container"><div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div></div>;
  }

  const top3 = rows.slice(0, 3);
  const others = rows.slice(3);
  const myRank = rows.find(p => p.id === 7);

  return (
    <div className="leaderboard-container">
      {/* Fixed Header + Podium */}
      <div className="fixed-top">
        <h1 className="title">Leaderboard</h1>
        <div className="podium-area">
          {/* 2nd Place */}
          <div className="place place-2">
            {top3[1] && <Podium {...top3[1]} color="#EFF5D2" />}
          </div>
          {/* 1st Place */}
          <div className="place place-1">
            {top3[0] && <Podium {...top3[0]} color="#8FA31E" />}
          </div>
          {/* 3rd Place */}
          <div className="place place-3">
            {top3[2] && <Podium {...top3[2]} color="#EFF5D2" />}
          </div>
        </div>
      </div>

      {/* Scrollable list */}
      <div className="scroll-section">
        <div className="list">
          {others.map(p => (
            <div key={p.id} className="row">
              <div className="rank">{p.id}</div>
              <div className="user-details">
                <div className="name">{p.user_name}</div>
                <div className="points">{p.points}</div>
              </div>

              <div className="avatar" />
            </div>
          ))}
        </div>
      </div>

      {/* Fixed My Rank */}
      <div className="my-rank">
        <div className="lr">
          <div className="label">My Rank</div>
          <div className="rank">{myRank?.id}</div>
        </div>
        <div className="avatar" />
        <div className="name">{myRank?.user_name}</div>
        <div className="points">{myRank?.points}</div>
      </div>
    </div>
  );
}