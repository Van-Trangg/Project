import '../styles/Share.css';
import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { getMyRank } from '../api/leaderboard'
import { getTrees } from '../api/reward'
import { getProfile } from '../api/profile';
import { getRecap } from '../api/map';
import html2canvas from "html2canvas";

const userBragData = {
  profilePic: 'https://i.pravatar.cc/150?img=33', // A random user avatar
  name: 'Alex Rivera',
  handle: '@alexrivera',
  rank: 1, // Change this to 1, 2, 3, or any other number to see the different styles
  monthlyCheckins: 28,
  treesPlanted: 14,
};

const getRankDisplay = (rank) => {
  if (rank === 1) return { class: 'brag-rank-gold', text: '#1', icon: '🏆' , src: '/src/public/share-crown.png'};
  if (rank === 2) return { class: 'brag-rank-silver', text: '#2', icon: '🥈', src: '/src/public/share-trophy.png' };
  if (rank === 3) return { class: 'brag-rank-bronze', text: '#3', icon: '🥉', src: '/src/public/share-trophy.png'};
  return { class: 'brag-rank-standard', text: `#${rank}`, icon: '⭐', src:'/src/public/share-medal.png' };
};

const colorPalettes = [
  { id: 1, 
    name: 'Forest Green', 
    gradient: 'linear-gradient(135deg, #4a7c59 0%, #C6D870 100%)', 
    textColor: '#ffffff',
    subtextColor: '#F0F9CA',
    brandTextColor: '#556B2F' 
  },
  { id: 2, 
    name: 'Ocean Blue', 
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    textColor: '#ffffff',
    subtextColor: 'rgba(255, 255, 255, 0.8)',
    brandTextColor: '#2d1b69' 
  },
  { id: 3, 
    name: 'Sunset Glow', 
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
    textColor: '#ffffff',
    subtextColor: 'rgba(255, 255, 255, 0.75)',
    brandTextColor: '#8b1538', 
  },
  { id: 4, name: 'Iridescent Lavender', 
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', 
    textColor: '#2d3436',
    subtextColor: '#6b4984',
    brandTextColor: '#6b4984'  
  }, 
  { id: 5, 
    name: 'Lilac Dream', 
    gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', 
    textColor: '#2d3436',
    subtextColor: '#7d4e6d', 
    brandTextColor: '#7d4e6d' 
  }, 
  { id: 6, 
    name: 'Midnight', 
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)', 
    textColor: '#ffffff',
    subtextColor: 'rgba(255, 255, 255, 0.75)',
    brandTextColor: '#17334eff' 
  },
];

const Share = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userRank, setRank] = useState(null);
  // const [userTrees, setUserTrees] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userData, setUserData] = useState(null);
  const [rankDisplay, setRankDisplay] = useState(null);
  const [currentTheme, setCurrentTheme] = useState({
    gradient: colorPalettes[0].gradient,
    textColor: colorPalettes[0].textColor,
    subtextColor: colorPalettes[0].subtextColor,
    brandTextColor: colorPalettes[0].brandTextColor,
  });
  
  const bragRef = useRef(null);
  const handleBack = () => {
    navigate('/leaderboard');
  };

 useEffect(() => {
    console.log('Effect running!');
    
    if (loading) return;
    setLoading(true);
    
    Promise.all([
      getProfile(),
      getRecap(),
      getMyRank()
    ])
    .then(([profileRes, recapRes, rankRes]) => {
      console.log('Profile:', profileRes.data);
      console.log('Recap:', recapRes.data);
      console.log('Rank:', rankRes.data);
      setUserProfile(profileRes.data);
      setUserData(recapRes.data);
      setRank(rankRes.data);
      setRankDisplay(getRankDisplay(recapRes.data.rank));
    })
    .catch(err => {
      console.error('Failed to load data', err);
    })
    .finally(() => {
      setLoading(false);
    });

  //   getRecap()
  //     .then(res => {
  //       setUserData(res.data);
  //       setRankDisplay(getRankDisplay(res.data.rank));
  //     })
  //       .catch(err => {
  //       console.error('Failed to load data', err);
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  }, []);



  const downloadBragCard = async () => {
    if (!bragRef.current) return;

    const cardElement = bragRef.current;

    try {
      // --- Temporarily disable the animation for a clean capture ---
      cardElement.style.animation = 'none';

      // Use a small timeout to ensure the style is applied before capture
      await new Promise(resolve => setTimeout(resolve, 100)); 

      const canvas = await html2canvas(cardElement, {
        useCORS: true,
        scale: 2, // High resolution
      });

      const dataURL = canvas.toDataURL("image/png");

      // Create temp link and download
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "greenjourney-share.png";
      link.click();
    } catch (err) {
      console.error("Error generating image:", err);
    } finally {
      // --- IMPORTANT: Restore the animation after capture ---
      // We set it to an empty string to revert to the CSS-defined animation
      cardElement.style.animation = '';
    }
  };

  const handleThemeChange = (palette) => {
    setCurrentTheme({
      gradient: palette.gradient,
      textColor: palette.textColor,
      subtextColor: palette.subtextColor || palette.textColor, // <-- ADD THIS
      brandTextColor: palette.brandTextColor || palette.textColor, // <-- ADD THIS
    });
  };

  const mainCardStyle = useMemo(() => {
    const style = {
      background: currentTheme.gradient,
      color: currentTheme.textColor,
    };
    if (currentTheme.brandTextColor) {
      style['--brand-text-color'] = currentTheme.brandTextColor;
    }
    if (currentTheme.subtextColor) {
      style['--subtext-color'] = currentTheme.subtextColor;
    }
    return style;
  }, [currentTheme]); // This hook will only re-run if currentTheme changes

  return (
    <div className="brag-page-container">
        <div className="brag-page-header">
            <button className="back-button-stats" onClick = {handleBack}>
            <img src="/src/public/back.png" width="18px" height="18px" alt="Back" />
            </button>
            <h1>Chia sẻ</h1>
            <button className="download-button-share" onClick = {downloadBragCard}>
            <img src="/src/public/download.png" width="25px" height="25px" alt="Download" />
            </button>
        </div>
      <main className="brag-card" 
        ref = {bragRef} 
        style={mainCardStyle}
      >
        {/* Profile Section */}
        <header className="brag-header">
          <img src={userRank?.avatar || "https://www.shutterstock.com/image-vector/avatar-gender-neutral-silhouette-vector-600nw-2470054311.jpg"} className="brag-profile-pic" />
          <h1 className="brag-user-name">{userData?.full_name || "User"}</h1>
          <p className="brag-user-handle">{`@${userProfile?.nickname}` || "user"}</p>
          <p className="brag-user-location">{`${userProfile?.address}` || "Ho Chi Minh"}</p>
        </header>

        {/* Main Stats Section */}
        <section className="brag-stats">
          {/* Rank Display */}
          <div className = 'brag-rank-desc'> 
            <span className ='brag-rank-left'>Hạng</span>
            <span className ='brag-rank-right'>Tháng {userData?.month || 1} - {userData?.year || 2025}</span>
          </div>
          <div className={`brag-rank-display ${rankDisplay?.class}`}>
            <div className = 'left-comp'>
              {/* <span className="brag-rank-icon">{rankDisplay?.icon || "🏆"}</span> */}
              <img src={rankDisplay?.src || '/src/public/share-trophy.png'} className="brag-rank-icon"></img>
              <span className="brag-rank-text">{rankDisplay?.text || "#1"}</span>
            </div>
            <div className = 'right-comp'>
              <span className="brag-rank-score">{userData?.monthly_points ?? 0}</span>
              <img className = 'ecopoint-share' src = '/src/public/ecopoint.png'></img>
            </div>
          </div>

          {/* Other Stats */}
          <div className="brag-other-stats">
            <div className="brag-stat-item">
              <img src="/src/public/pin.png" className="brag-stat-icon"></img>
              <span className="brag-stat-value">{userData?.checkins ?? 0}</span>
              <span className="brag-stat-label">Lượt<br></br>Check-in</span>
            </div>
            <div className="brag-stat-item">
              <img src="/src/public/sprout.png" className="brag-stat-icon"></img>
              <span className="brag-stat-value">{userData?.trees ?? 0}</span>
              <span className="brag-stat-label">SỐ CÂY<br></br>ĐÃ TRỒNG</span>
            </div>
          </div>
        </section>

        <footer className="brag-footer">
          <p>Cùng tôi phát triển du lịch bền vững nhé!</p>
          <div className = 'separator-crease'></div>
          <div className = 'brand'>
            <span>GreenJourney</span>
            <img className = 'ecopoint-brand' src = '/src/public/ecopoint.png'></img>
          </div>
        </footer>
      </main>

      <div className="color-palette-bar">
        {colorPalettes.map((palette) => (
          <button
            key={palette.id}
            className="palette-button"
            style={{ background: palette.gradient }}
            onClick={() => handleThemeChange(palette)}
          />
        ))}
      </div>
    </div>
  );
};

export default Share;