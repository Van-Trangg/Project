import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react'
import { checkin, confirmVehicle, checked, getProgress, percentageChecked } from '../api/map'
import { getProfile } from '../api/profile'
import '../styles/Map.css'

const VEHICLES = {
  bike: { name: "Bicycle", bonus: 20, image: '/src/public/Map/bike.png' },
  bus: { name: "Bus", bonus: 10, image: '/src/public/Map/bus.png' },
  ev_scooter: { name: "Motorbike", bonus: 0, image: '/src/public/Map/scooter.png' },
  car: { name: "Car", bonus: 0, image: '/src/public/Map/car.png' }
}

export default function CheckIn() {
  const { state } = useLocation();  
  const { poi, map } = state || {};
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [step, setStep] = useState("confirm");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [percentCheckedIn, setPercent] = useState(0);
  const [maxProgress, setMaxProgress] = useState(0);
  const [receipt, setReceipt] = useState(null)
  const [checkedIn, setCheckedIn] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  
  // Load user profile
  useEffect(() => {
    setLoadingProfile(true);
    getProfile()
      .then(r => setUser(r.data))
      .catch(err => {
          console.error('Failed to load profile', err)
      })
    console.log('User profile loaded in check-in page');
    console.log(user);
    checked(poi.id)
      .then(res => {
        setCheckedIn(res.data.checked);
      })
      .catch(err => {
          console.error('Failed to check check-in status', err);
      })
    getProgress()
      .then(res => {
        setCurrentProgress(res.data.progressCurrent);
        setMaxProgress(res.data.progressMax);
      })
      .catch(err => {
          console.error('Failed to load progress', err)
      })
    percentageChecked(poi.id)
      .then(res => {
        setPercent(res.data.percent);
      })
      .catch(err => {
          console.error('Failed to load percentage checked-in', err)
      })
      .finally(setLoadingProfile(false));
  }, [])

  //Animation
  useEffect(() => {
    document.body.classList.remove('page-transitioning');
    
    const pageContent = document.querySelector('.check-in-page');
    if (pageContent) {
      pageContent.classList.add('page-enter');
    }
  }, []);

  // Mock GPS
  const mockGps = {
    user_lat: poi.lat + 0.0001,
    user_lng: poi.lng + 0.0001
  }

  const handleCheckIn = async () => {
    if (isCheckingIn) return;

    setIsCheckingIn(true);
    try {
      const res = await checkin({
        user_id: user.id,
        poi_id: poi.id,
        //Caafn theem route laays user latlng
        user_lat: mockGps.user_lat,
        user_lng: mockGps.user_lng,
      });

    // Validate response
    if (!res?.data) {
      throw new Error("Invalid response from server");
    }
    setReceipt(res.data);
    setStep('receipt');
    } catch (err) {
      // Safely extract error message
      const message = err.response?.data?.detail || err.message || "Check-in failed. Please try again.";
      alert(message);
      console.error("Check-in error:", err);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckInTemp = () => {
    window.scrollTo(0, 0);
    setStep('receipt');
  }

  const handleConfirmVehicle = async () => {
    if (!selectedVehicle) return
    try {
      const res = await confirmVehicle(receipt.checkin_id, selectedVehicle)
      setReceipt(res.data)
      setStep('receipt')
    } catch (err) {
      alert('Bonus failed')
    }
  }

  const handleConfirmVehTemp = () => {
    setStep('receipt');
  }

  if (!poi) return <div>Location not found</div>

const handleCancel = () => {
  navigate(-1); 
}

  return (
    <div className = 'check-in-page'>
      {step === 'confirm' && (
        <>
          <div className = 'top-bar'>
            <button 
              className = 'exit-btn'
              onClick = {() => handleCancel()}
              > 
              <img src = '/src/public/x.png'></img>
            </button>
            <span className = 'title'>Check-in Point</span>
          </div>
          <div className = 'city-name-prof'>
            <span> {map.name}</span>
            <div className = 'line'></div>
          </div>
          <div className = 'location'>
            <div className = 'location-image'
            style={{
              backgroundImage: `url(${poi.image || '/Map/popup-default.jpg'})`,
            }}
            ></div>
            <div className = 'location-name'>{poi.name}</div>
            <div className="popup-stat-checkin">
              {percentCheckedIn + '%' || '20%'} of users have checked in here
            </div>
          </div>
          <div className = {`popup-card ${checkedIn ? 'checked-in' : ''}`}>
            <img src = '/src/public/spark.png' className = 'spark'></img>
            <span className = 'first-rew'>First Check-in Reward</span>
            <div className = 'point'>
              <span>{poi.score}</span>
              <img className ='ecopoint-icon' src = '/src/public/ecopoint.png'/>
            </div>
            <div className = 'checkin-progress-bar'>
              <div className = 'prog-title'>Progress until next title</div>
              <span className = 'track-bar'>
                <span 
                className = 'fill-bar'
                style={{ width: `${(currentProgress / maxProgress) * 100}%` }}
                > </span>
                {!checkedIn && (
                  <span className = 'expectant-bar'
                  style={{ width: `${((currentProgress + poi.score*3) / maxProgress) * 100}%` }}
                  ></span>)}
              </span>
              {!checkedIn ? (
                <div className = 'prog-num'>{currentProgress + '+' + poi.score + '/' + maxProgress}</div>
              ) : (
                <div className = 'prog-num-disabled'>{currentProgress+ '/' + maxProgress}</div>
              )}
            </div>
            {!checkedIn ? (
              <button className="checkin-btn" onClick={handleCheckIn}>Confirm</button>
            ) : (
              <button className="checkin-btn-disabled">Checked in</button>
            )}
          </div>
        </>
      )}
      {/* {step === 'survey' && (
      <>
        <button className = 'exit-btn' onClick = {() => {
          setSelectedVehicle(null) ; 
          setStep('confirm')
          }}
        >
          <img src = '/src/public/back.png'/>
        </button>
        <div className = 'vehicle-message'>
          <p className = 'congratulatory'>Check-in complete!<br/>You have been awarded</p>
          <div className = 'point-survey'>
            <span>receipt.earned_points</span>
            <img className ='ecopoint-icon' src = '/src/public/ecopoint.png'/>
          </div>
          <span className = 'line-vehicle'></span>
          <p className = 'message'>To receive more points, please confirm transportation used during travel.</p>
        </div>
        <div className = 'vehicle-grid'>
          {Object.entries(VEHICLES).map(([key, v]) => (
              <button
                key={key}
                className={`vehicle-card ${selectedVehicle === key ? 'selected' : ''}`}
                onClick={() => {
                  if (!selectedVehicle || selectedVehicle !== key) setSelectedVehicle(key);
                  else setSelectedVehicle(null);
                }}
              >
                <div 
                  className="vehicle-image"
                  style={{ backgroundImage: `url(${v.image})` }}
                />
                <p className="vehicle-name">{v.name}</p>
              </button>
            ))}
        </div>
        <button 
        className={`checkin-btn ${selectedVehicle?.id == 0 ? 'inactive' : ''}`}
        onClick={handleConfirmVehTemp}
        >
          Submit
        </button>
      </>
      )} */}
      {step === 'receipt' && (
        <div className = 'receipt'>
          <div className = 'spacer'></div>
          <div className = 'vehicle-message'>
              {/* {bonusTest && (
              //   <>
              //     <p className = 'congratulatory'>Congratulations!<br/>For your green effort, you have received a bonus of</p>
              //     <div className = 'point-survey'>
              //       <span>{poi.score}</span>
              //       <img className ='ecopoint-icon' src = '/src/public/ecopoint.png'/>
              //     </div>
              //     <span className = 'line-vehicle'></span>
              //   </>
              // )} */}
              <p className = 'congratulatory'>At this location, you have gained a total of</p>
              <div className = 'point-survey'>
                <span className = 'checkin-score'> {poi.score}</span>
                <img className ='ecopoint-icon' src = '/src/public/ecopoint.png'/>
              </div>
              <p className = 'congratulatory'>Impressive!<br/>Thank you for your commitment towards improving our environment.</p>
          </div>
          <div className = 'spacer'></div>
          <div className = 'popup-card-receipt'>
            <div className="popup-stat-receipt">
              Your new balance
            </div>
            <div className = 'total-balance'>
              <span>{user.eco_points}</span> 
              <img className ='ecopoint-icon' src = '/src/public/ecopoint.png'/>
            </div>
            <button className="checkin-btn" onClick={handleCancel}>Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
}