import { useEffect, useState } from "react";
import { Link } from 'react-router-dom'
import "../styles/Leaderboard.css";
import { useNavigate } from 'react-router-dom'
import { getLeaderboard, getMyRank } from '../api/leaderboard'

function Podium({ user_name, points, rank, color, id, avatar, isMyRank }) {
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    if (isMyRank) {
      navigate(`/Profile`);
    } else {
      navigate(`/profile/view/${id}`, { state: { user: { user_name, points, rank, id } } });
    }
  };

  return (
    <div className={`podium ${isMyRank ? 'my-podium' : ''}`}>
      <div className="top-info">
        <div className="avatar" onClick={handleAvatarClick}>
          <img src={avatar} />
        </div>
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

  const OtherAvatarDirect = (p) => {
    navigate(`/profile/view/${p.id}`, { state: { user: p } });
  };

  // --- UPDATED STATE ---
  const [rows, setRows] = useState([]);
  const [myRankData, setMyRankData] = useState(null); // State for your specific rank data
  const [isLoading, setIsLoading] = useState(true);   // Unified loading state
  const [error, setError] = useState(null);           // State for handling errors

  // --- UPDATED useEffect to fetch both data sources ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch both the leaderboard and your rank at the same time
        const [leaderboardResponse, myRankResponse] = await Promise.all([
          getLeaderboard(),
          getMyRank()
        ]);

        setRows(leaderboardResponse.data);
        setMyRankData(myRankResponse.data);
        console.log('Leaderboard data:', leaderboardResponse.data);
        console.log('My rank data:', myRankResponse.data);
      } catch (err) {
        console.error("Failed to fetch leaderboard data:", err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  // --- IMPROVED LOADING AND ERROR HANDLING ---
  if (isLoading) {
    return <div className="leaderboard-container"><div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div></div>;
  }

  if (error) {
    return <div className="leaderboard-container"><div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div></div>;
  }
  
  // Handle case where the leaderboard might be empty
  if (!rows || rows.length === 0) {
    return <div className="leaderboard-container"><div style={{ textAlign: 'center', marginTop: '50px' }}>Leaderboard is empty.</div></div>;
  }

  const top3 = rows.slice(0, 3);
  const others = rows.slice(3);

  // Check if my rank is in top 10
  const isInTop10 = myRankData && myRankData.rank <= 10;

  return (
    <div className="leaderboard-container">
      {/* Fixed Header + Podium */}
      <div className="fixed-top">
        <h1 rank="title">Leaderboard</h1>
        <div className="podium-area">
          {/* 2nd Place */}
          <div className="place place-2">
            {top3[1] && <Podium 
              {...top3[1]} 
              color="#EFF5D2" 
              isMyRank={myRankData && top3[1].rank === myRankData.rank}
            />}
          </div>
          {/* 1st Place */}
          <div className="place place-1">
            {top3[0] && <Podium 
              {...top3[0]} 
              color="#8FA31E" 
              isMyRank={myRankData && top3[0].rank === myRankData.rank}
            />}
          </div>
          {/* 3rd Place */}
          <div className="place place-3">
            {top3[2] && <Podium 
              {...top3[2]} 
              color="#EFF5D2" 
              isMyRank={myRankData && top3[2].rank === myRankData.rank}
            />}
          </div>
        </div>
      </div>

      {/* Scrollable list */}
      <div className="scroll-section">
        <div className="list">
          {others.map(p => {
            const isMyRow = myRankData && p.rank === myRankData.rank;
            return (
              <div 
                key={p.rank} 
                className={`row ${isMyRow ? 'my-row' : ''}`}
              >
                <div className="rank">{p.rank}</div>
                <div className="user-details">
                  <div className="name">{p.user_name}</div>
                  <div className="points">{p.points}</div>
                </div>
                <div className="avatar" onClick={() => isMyRow ? navigate(`/Profile`) : OtherAvatarDirect(p)} >
                  <img className="list_avatar" src={p.avatar} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Only render this section if myRankData has been successfully fetched and rank is outside top 10 */}
      {myRankData && !isInTop10 && (
        <div className="my-rank">
          <div className="lr">
            <div className="label">My Rank</div>
            <div className="rank">{myRankData.rank}</div>
          </div>
          <div className="avatar" onClick={() => navigate(`/Profile`)}>
            <img src={myRankData.avatar}/>
          </div>
          <div className="name">{myRankData.user_name}</div>
          <div className="points">{myRankData.points}</div>
        </div>
      )}
    </div>
  );
}