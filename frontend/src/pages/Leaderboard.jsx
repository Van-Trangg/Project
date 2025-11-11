// Leaderboard.jsx
import { useEffect, useState } from "react";
import "../styles/Leaderboard.css";
import { useNavigate } from 'react-router-dom'
import { getLeaderboard } from '../api/leaderboard'


function Podium({ user_name, points, rank, color, id }) {
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    navigate(`/OtherProfile/${id}`, { state: { user: { user_name, points, rank, id } } });
  };

  return (
    <div className="podium">
      <div className="top-info">
        <div className="avatar" onClick={handleAvatarClick}></div>
        <div className="name">{user_name}</div>
        <div className="points">{points}</div>
      </div>
      <div className="base" style={{ backgroundColor: color }}>
        <div className="rank">{rank}</div>
      </div>
    </div>
  );
}

// Main Leaderboard Component
export default function Leaderboard() {

  const navigate = useNavigate();

  const MyAvatarDirect = () => { navigate(`/Profile`) }
  const OtherAvatarDirect = (p) => {
    navigate(`/OtherProfile/${p.id}`, { state: { user: p } });
  };


  const [rows, setRows] = useState([]);
  useEffect(() => { getLeaderboard().then(r => setRows(r.data)) }, [])
  // --- PREVENTS BLANK PAGE ---
  // If rows is not yet an array, show a loading message
  if (!rows || rows.length === 0) {
    return <div className="leaderboard-container"><div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div></div>;
  }

  const top3 = rows.slice(0, 3);
  const others = rows.slice(3);
  const myRank = rows.find(p => p.rank === 7);

  return (
    <div className="leaderboard-container">
      {/* Fixed Header + Podium */}
      <div className="fixed-top">
        <h1 rank="title">Leaderboard</h1>
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
            <div key={p.rank} className="row">
              <div className="rank">{p.rank}</div>
              <div className="user-details">
                <div className="name">{p.user_name}</div>
                <div className="points">{p.points}</div>
              </div>

              <div className="avatar" onClick={() => OtherAvatarDirect(p)} />
            </div>
          ))}
        </div>
      </div>

      {/* Fixed My Rank */}
      <div className="my-rank">
        <div className="lr">
          <div className="label">My Rank</div>
          <div className="rank">{myRank?.rank}</div>
        </div>
        <div className="avatar" onClick={MyAvatarDirect}></div>
        <div className="name">{myRank?.user_name}</div>
        <div className="points">{myRank?.points}</div>
      </div>
    </div>
  );
}