import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import { listPlaces, getPois } from '../api/map'
import '../styles/Map.css'
import 'leaflet/dist/leaflet.css';
import { customIcon } from '../components/Pin';

export default function Map() {
  const [maps, setMaps] = useState([])
  const [selectedMap, setSelectedMap] = useState(null)
  const [pois, setPois] = useState([])
  const [loadingMaps, setLoadingMaps] = useState(true);
  const [loadingPois, setLoadingPois] = useState(false);
  const [userId] = useState(1) // TODO: get from auth context
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
    setLoadingMaps(true);
    listPlaces()
      .then(res => {
        setMaps(res.data)
        setSelectedMap(res.data[0])
      })
      .catch(err => console.error('Failed to load maps', err))
      .finally(() => setLoadingMaps(false));
  }, [])

  // Load POIs when map changes
  useEffect(() => {
    if (!selectedMap) return;
    setLoadingPois(true);
    if (selectedMap) {
      getPois(selectedMap.id, userId)
        .then(res => setPois(res.data || []))
        .catch(err => {
          console.error('Failed to load POIs', err);
          setPois([]);
      })
      .finally(() => setLoadingPois(false));
    }
  }, [selectedMap, userId])

  const handleCityChange = (city) => {
    setSelectedMap(city)
    setDropdownOpen(false)
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
    {dropdownOpen && ( 
      <div className="city-fullscreen-overlay">
        <div className="overlay-inner" onClick={(e) => e.stopPropagation()}>
          <div className="city-grid">
            {maps.map((city) => (
              <button
                key={city.id}
                className="city-card"
                onClick={() => {handleCityChange(city);}}
              >
                <div className="city-image"
                  style={{ backgroundImage: `url(${city.image})` }}
                />
                <p className="city-name">{city.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
    {!dropdownOpen && (
      <div className="map-container">
        {/* {loading ? (
          <div className="map-loading">Loading map…</div>
        ) : (
          <div
            className="map-placeholder"
            style={{ backgroundImage: `url(${mapPlaceholder})` }}
          >
            {pois.map((pin) => {
              const pos = latLngToPercent(pin.lat, pin.lng, selectedMap)
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
        )} */}
      {loadingMaps ? (
        <div className="map-loading">Loading map…</div>
      ) :(
      <MapContainer
        center={[selectedMap.center_lat, selectedMap.center_lng]}
        zoom={13}                     
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />  
        {pois.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            
            icon = {customIcon}
            eventHandlers={{
              click: () => setSelectedPin(pin),
            }}
          >
          </Marker>
        ))}
      </MapContainer>
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