import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react'
import { listPlaces } from '../api/map'
import '../styles/Map.css'

const PINS = [
  { id: 1, lat: 10.7769, lng: 106.7009, image: '/src/public/Map/dkhi.png', checkInRate: '46%', title: 'Đảo Khỉ', desc: 'Đảo Khỉ Cần Giờ là điểm đến lý tưởng cho những ai yêu thích thiên nhiên và khám phá thế giới động vật hoang dã. Chỉ cách trung tâm Sài Gòn khoảng 50km, đảo Khỉ Cần Giờ thu hút du khách bởi hàng nghìn chú khỉ tinh nghịch cùng không gian rừng ngập mặn xanh mát, yên bình.' },
  { id: 2, lat: 10.7626, lng: 106.6822, title: 'Bến Nghé', desc: 'Historic riverside area' },
  { id: 3, lat: 10.7554, lng: 106.6753, title: 'Mai Chí Thọ', desc: 'Modern boulevard' },
]


export default function CheckIn() {
  const { locationId } = useParams();  
  const location = PINS.find(p => p.id === Number(locationId));
  const navigate = useNavigate();
  const handleCancel = () => {
    navigate(-1);
  }
  const handleCheckInProcess = () => {
  }
  //sau này check state người dùng đã checkin tại đây chưa => tắt hiển thị expectant bar + làm mờ chữ
  return (
    <div className = 'check-in-page'>
      <div className = 'top-bar'>
        <button 
          className = 'back-btn'
          onClick = {() => handleCancel()}
          > 
          <img src = '/src/public/back.png'></img>
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
        <button className="checkin-btn" onClick={handleCheckInProcess()}>Confirm</button>
      </div>
    </div>
  );
}