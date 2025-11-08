import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react'
import { listPlaces } from '../api/map'
import '../styles/Map.css'

const PINS = [
  { id: 1, lat: 10.7769, lng: 106.7009, image: '/src/public/Map/dkhi.png', checkInRate: '46%', title: 'Đảo Khỉ', desc: 'Đảo Khỉ Cần Giờ là điểm đến lý tưởng cho những ai yêu thích thiên nhiên và khám phá thế giới động vật hoang dã. Chỉ cách trung tâm Sài Gòn khoảng 50km, đảo Khỉ Cần Giờ thu hút du khách bởi hàng nghìn chú khỉ tinh nghịch cùng không gian rừng ngập mặn xanh mát, yên bình.' },
  { id: 2, lat: 10.7626, lng: 106.6822, title: 'Bến Nghé', desc: 'Historic riverside area' },
  { id: 3, lat: 10.7554, lng: 106.6753, title: 'Mai Chí Thọ', desc: 'Modern boulevard' },
]
const Transports = [
  {id: 0, name: "None"},
  {id: 1, name: "Bicycle", image: '/src/public/Map/bike.png'},
  {id: 2, name: "Bus", image: '/src/public/Map/bus.png'},
  {id: 3, name: "Motorbike", image: '/src/public/Map/scooter.png'},
  {id: 4, name: "Car", image: '/src/public/Map/car.png'}
]

export default function CheckIn() {
  const { locationId } = useParams();  
  const location = PINS.find(p => p.id === Number(locationId));
  const navigate = useNavigate();

  const [showSurvey, setShowSurvey] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(Transports[0]);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const handleCheckInProcess = () => {
    //if is first check in {setEarnedPoints(100)}
    setShowSurvey(true);
  }
const handleConfirmTransport = () => {
    if (selectedTransport == Transports[1] || selectedTransport == Transports[3]) {
      setEarnedPoints(150);
    }
    if (selectedTransport && selectedTransport.id !== 0) {
      setShowSurvey(false);
      setShowReceipt(true);
    }
  }

const handleCancel = () => {
  setSelectedTransport(null);
  setEarnedPoints(0);
  navigate(-1); 
}

  //sau này check state người dùng đã checkin tại đây chưa => tắt hiển thị expectant bar + làm mờ chữ
  return (
    <div className = 'check-in-page'>
      {!showSurvey && !showReceipt && (
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
            <span> {locationId <= 3 ? 'Ho Chi Minh City' : 'Phu Quoc'}</span>
            <div className = 'line'></div>
          </div>
          <div className = 'location'>
            <div className = 'location-image'
            style={{
              backgroundImage: `url(${location.image || '/Map/popup-default.jpg'})`,
            }}
            ></div>
            <div className = 'location-name'>{location.title}</div>
            <div className="popup-stat">
              {location.checkInRate || '10%'} of users have checked in here
            </div>
          </div>
          <div className = 'popup-card'>
            <img src = '/src/public/spark.png' className = 'spark'></img>
            <span className = 'first-rew'>First Check-in Reward</span>
            <div className = 'point'>
              <span>100</span>
              <img className ='ecopoint-icon' src = '/src/public/ecopoint.png'/>
            </div>
            <div className = 'progress-bar'>
              <div className = 'prog-title'>Progress until next title</div>
              <span className = 'track-bar'>
                <span className = 'fill-bar'></span>
                <span className = 'expectant-bar'></span>
              </span>
              <div className = 'prog-num'>1600+ 200/2000</div>
            </div>
            <button className="checkin-btn" onClick={handleCheckInProcess}>Confirm</button>
          </div>
        </>
      )}
      {showSurvey && !showReceipt && (
      <>
        <button className = 'back-btn' onClick = {() => {
          setSelectedTransport(null) ; 
          setShowSurvey(false)
          }}
        >
          <img src = '/src/public/back.png'/>
        </button>
        <div className = 'vehicle-message'>
          <p className = 'congratulatory'>Check-in complete!<br/>You have been awarded</p>
          <div className = 'point-survey'>
            <span>100</span>
            <img className ='ecopoint-icon' src = '/src/public/ecopoint.png'/>
          </div>
          <span className = 'line-vehicle'></span>
          <p className = 'message'>To receive more points, please confirm transportation used during travel.</p>
        </div>
        <div className = 'vehicle-grid'>
          {Transports.map((trans) => (
            trans.id !== 0 && (  
              <button
                key={trans.id}
                className={`vehicle-card ${selectedTransport?.id === trans.id ? 'selected' : ''}`}
                onClick={() => {
                  if (!selectedTransport || selectedTransport.id !== trans.id) setSelectedTransport(Transports[trans.id]);
                  else setSelectedTransport(null);
                }}
              >
                <div 
                  className="vehicle-image"
                  style={{ backgroundImage: `url(${trans.image})` }}
                />
                <p className="vehicle-name">{trans.name}</p>
              </button>
              )
            ))}
        </div>
        <button 
        className={`checkin-btn ${selectedTransport?.id == 0 ? 'inactive' : ''}`}
        onClick={handleConfirmTransport}
        >
          Submit
        </button>
      </>
      )}
      {!showSurvey && showReceipt && (
        <div className = 'receipt'>
          <div className = 'vehicle-message'>
              <p className = 'congratulatory'>Congratulations!<br/>For your green effort, you have received a bonus of</p>
              <div className = 'point-survey'>
                <span>50</span>
                <img className ='ecopoint-icon' src = '/src/public/ecopoint.png'/>
              </div>
              <span className = 'line-vehicle'></span>
              <p className = 'congratulatory'>At this location, you have gained a total of</p>
              <div className = 'point-survey'>
                <span>150</span>
                <img className ='ecopoint-icon' src = '/src/public/ecopoint.png'/>
              </div>
              <p className = 'congratulatory'>Impressive!<br/>Thank you for your commitment towards improving our environment.</p>
              <div className = 'popup-card-receipt'>
                <div className="popup-stat-receipt">
                  Your new balance
                </div>
              <div className = 'total-balance'>
                <span>3.150</span>
                <img className ='ecopoint-icon' src = '/src/public/ecopoint.png'/>
              </div>
              <button className="checkin-btn" onClick={handleCancel}>Confirm</button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}