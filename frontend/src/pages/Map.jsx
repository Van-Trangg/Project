import { useState, useEffect, useRef } from 'react'
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { listPlaces, getPois } from '../api/map'

import '../styles/Map.css'
import 'leaflet/dist/leaflet.css';
import { customIcon } from '../components/Pin';

function MapController({ onMapReady }) {
  const map = useMap(); // This is the Leaflet map instance

  useEffect(() => {
    if (map) {
      onMapReady(map);
      //console.log('Map ready via useMap');
    }
  }, [map, onMapReady]);

  return null; // Renders nothing
}

export default function Map() {
  const [maps, setMaps] = useState([])
  const [selectedMap, setSelectedMap] = useState(null)
  const [pois, setPois] = useState([])
  const [loadingMaps, setLoadingMaps] = useState(true);
  const [loadingPois, setLoadingPois] = useState(false);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const navigate = useNavigate();
  const handleCheckIn = () => {
    if (selectedPin) {
      navigate(`/checkin/${selectedPin.id}`, { state: { poi: selectedPin, map: selectedMap} }); // go to specific check-in page
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
      getPois(selectedMap.id)
        .then(res => setPois(res.data || []))
        .catch(err => {
          console.error('Failed to load POIs', err);
          setPois([]);
      })
      .finally(() => setLoadingPois(false));
    }
  }, [selectedMap])

  const handleCityChange = (city) => {
    setSelectedMap(city)
    setDropdownOpen(false)
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const mapRef = useRef(null);

  const flyToCityCenter = (e) => {
    e.stopPropagation();

    // ---- DEBUG ----
    console.log('fly button clicked');
    console.log('mapRef.current =', mapRef.current);
    console.log('selectedMap =', selectedMap);
    // --------------

    if (!mapRef.current) {
      console.warn('Map instance not ready yet');
      return;
    }
    if (!selectedMap) {
      console.warn('No city selected');
      return;
    }

    const lat = parseFloat(selectedMap.center_lat);
    const lng = parseFloat(selectedMap.center_lng);

    if (isNaN(lat) || isNaN(lng)) {
      console.error('Bad coordinates', selectedMap.center_lat, selectedMap.center_lng);
      return;
    }

    mapRef.current.flyTo([lat, lng], 13, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  };

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
        {loadingMaps ? (
          <div className="map-loading">Loading map…</div>
        ) : (
        <>
          <MapContainer
            center={[selectedMap.center_lat, selectedMap.center_lng]}
            zoom={13}                     
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            whenCreated={(map) => { 
              mapRef.current = map;
              console.log('Map instance saved'); 
            }}
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
            <MapController onMapReady={(map) => { mapRef.current = map; }} />
          </MapContainer>
          <button 
            className = 'map-center-bubble'
            onClick={flyToCityCenter}
          >
            <img src = '/src/public/focus.png' className = 'target-icon'></img>
          </button>
        </>    
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