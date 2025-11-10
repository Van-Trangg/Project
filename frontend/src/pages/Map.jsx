import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { listPlaces, getPois } from '../api/map'
import mapPlaceholder from '../public/map-placeholder.png'
import '../styles/Map.css'

// const CITIES = [
//   { id: 1, name: 'Ho Chi Minh City', lat: 10.762622, lng: 106.660172, image: '/src/public/Map/hcmc.png'},
//   { id: 2, name: 'Phu Quoc', lat: 21.028511, lng: 105.804817, image: '/src/public/Map/pq.png'},
// ]

// const PINS = [
//   { id: 1, lat: 10.7769, lng: 106.7009, image: '/src/public/Map/dkhi.png', checkInRate: '46%', title: 'Đảo Khỉ', desc: 'Đảo Khỉ Cần Giờ là điểm đến lý tưởng cho những ai yêu thích thiên nhiên và khám phá thế giới động vật hoang dã. Chỉ cách trung tâm Sài Gòn khoảng 50km, đảo Khỉ Cần Giờ thu hút du khách bởi hàng nghìn chú khỉ tinh nghịch cùng không gian rừng ngập mặn xanh mát, yên bình.' },
//   { id: 2, lat: 10.7626, lng: 106.6822, title: 'Bến Nghé', desc: 'Historic riverside area' },
//   { id: 3, lat: 10.7554, lng: 106.6753, title: 'Mai Chí Thọ', desc: 'Modern boulevard' },
// ]

export default function Map() {
  const [maps, setMaps] = useState([])
  const [selectedMap, setSelectedMap] = useState(null)
  const [pois, setPois] = useState([])
  const [loading, setLoading] = useState(true);
  const [userId] = useState(1) // TODO: get from auth context
  //const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  
  const navigate = useNavigate();
  const handleCheckIn = () => {
    if (selectedPin) {
      navigate(`/checkin/${selectedPin.id}`, { state: { poi: selectedPin, map: selectedMap } }); // go to specific check-in page
    }
  }
  // Load maps
  useEffect(() => {
    listPlaces()
      .then(res => {
        setMaps(res.data)
        setSelectedMap(res.data[0])
      })
      .catch(err => console.error('Failed to load maps', err))
  }, [])

  // Load POIs when map changes
  useEffect(() => {
    if (selectedMap) {
      setLoading(true)
      getPois(selectedMap.id, userId)
        .then(res => {
          setPois(res.data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [selectedMap, userId])

  const handleCityChange = (city) => {
    setSelectedMap(city)
    setDropdownOpen(false)
  }

  // Convert lat/lng to % on static map (HCM bounds)
  const latLngToPercent = (lat, lng) => {
    const minLat = 10.70, maxLat = 10.85
    const minLng = 106.60, maxLng = 106.75
    const top = ((lat - minLat) / (maxLat - minLat)) * 100
    const left = ((lng - minLng) / (maxLng - minLng)) * 100
    return { top: `${top}%`, left: `${left}%` }
  }
  useEffect(() => {
    if (selectedPin) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPin]);

  return (
  <div className="map-page">
    {/* Top Location Bar */}
    <div className="location-bar">
      <div className="spacer"></div>
      <span className="location-text">{selectedMap?.name || 'Loading...'}</span>
      <button 
        className="dropdown-toggle"
        onClick={() => setDropdownOpen(prev => !prev)}
      >
        <svg className="dropdown-arrow" viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      <div className="spacer"></div>
    </div>

    {/* FULL-SCREEN CITY OVERLAY – COVERS EVERYTHING */}
    {dropdownOpen && ( 
      <div className="city-fullscreen-overlay">
        <div 
          className="overlay-inner" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="city-grid">
            {maps.map((city) => (
              <button
                key={city.id}
                className="city-card"
                onClick={() => {handleCityChange(city);}}
              >
                <div 
                  className="city-image"
                  style={{ backgroundImage: `url(${city.image || '/default-city.jpg'})` }}
                />
                <p className="city-name">{city.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
    {/* Map Container */}
    {!dropdownOpen && (
      <div className="map-container">
        {loading ? (
          <div className="map-loading">Loading map…</div>
        ) : (
          <div
            className="map-placeholder"
            style={{ backgroundImage: `url(${mapPlaceholder})` }}
          >
            {pois.map((pin) => {
              const pos = latLngToPercent(pin.lat, pin.lng)
              return (
                <button
                  key={pin.id}
                  className="map-pin"
                  style={{
                    top: pos.top,
                    left: pos.left,
                  }}
                  onClick={() => setSelectedPin(pin)}
                >
                  <span className="pin-icon"></span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )}
    {/* Pin Popup */}
    {selectedPin && (
    <div className="pin-popup-overlay">
      <div className="pin-popup-card">
        <button className="popup-close-btn" onClick={() => setSelectedPin(null)}>
          ×
        </button> 
        <div
          className="popup-image"
          style={{
            backgroundImage: `url(${selectedPin.image || '/Map/popup-default.jpg'})`,
          }}
        />
        <div className="popup-content">
          <h3 className="popup-title">{selectedPin.name}</h3>
          <div className="popup-stat">
            {selectedPin.score + '%'|| '10%'} of users have checked in here
          </div>
          <p className="popup-desc">{selectedPin.description}</p>
        </div>
        <button className="checkin-btn" onClick={handleCheckIn}>Check-in</button>
      </div>
    </div>
    )}
  </div>
);
}