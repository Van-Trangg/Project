import { useState, useEffect, useRef } from 'react'
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import { listPlaces, getPois, percentageChecked, getNearestMap } from '../api/map'

import '../styles/Map.css'
import 'leaflet/dist/leaflet.css';
import { customIcon, customIconHere } from '../components/Pin';

function MapController({ onMapReady }) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  return null; // Renders nothing
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => deg * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in km
}

export default function Map() {
  const [maps, setMaps] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedMap, setSelectedMap] = useState(null);
  const [pois, setPois] = useState([]);
  const [checkinEgligible, setCheckinEligible] = useState(false);
  const [loadingMaps, setLoadingMaps] = useState(true);
  const [loadingPois, setLoadingPois] = useState(false);
  const [percentLoading, setPercentLoading] = useState(false);
  const [percentCache, setPercentCache] = useState({});   // { poiId: percent }
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const navigate = useNavigate();
  const mapRef = useRef(null);

  //Get user current location
  useEffect(() => {
    setLoadingMaps(true);

    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by your browser');
      loadMapsFallback(); 
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setUserLocation({ lat, lng });
        console.log('User location obtained:', lat, lng);

        // Load maps
        listPlaces()
          .then(res => {
            const mapsList = res.data;
            setMaps(mapsList);

            return getNearestMap(lat, lng)
              .then(nearestRes => {
                const nearestMap = nearestRes.data;
                console.log('Nearest map:', nearestMap);

                const matchedMap = mapsList.find(m => m.id === nearestMap.id);
                if (matchedMap) {
                  setSelectedMap(matchedMap);
                } else {
                  setSelectedMap(mapsList[0]); // fallback
                }
              });
          })
          .catch(err => {
            console.error('Failed to load maps or nearest map', err);
            setSelectedMap(maps[0]); // fallback
          })
          .finally(() => {
            setLoadingMaps(false);
          });
      },
      (error) => {
        console.error('Error obtaining location', error);
        loadMapsFallback();
      }
    );
  }, []);

// Helper: Load maps without geolocation
const loadMapsFallback = () => {
  listPlaces()
    .then(res => {
      setMaps(res.data);
      setSelectedMap(res.data[0]);
    })
    .catch(err => console.error('Failed to load maps', err))
    .finally(() => setLoadingMaps(false));
};

  // Load POIs and their check-in percentages when selectedMap changes

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPin]);

  useEffect(() => {
    if (!selectedMap || loadingPois || percentLoading) return;

    setLoadingPois(true);
    setPercentLoading(true);
    setPercentCache({});               // clear cache for the previous city

    const poisPromise = getPois(selectedMap.id);

    const percentagesPromise = poisPromise.then(res => {
      const list = res.data || [];
      return Promise.all(
        list.map(poi =>
          percentageChecked(poi.id)
            .then(r => ({ id: poi.id, percent: r.data?.percent ?? 0 }))
            .catch(() => ({ id: poi.id, percent: 0 }))   // swallow errors
        )
      );
    });

    Promise.all([poisPromise, percentagesPromise])
      .then(([poisRes, percents]) => {
        setPois(poisRes.data || []);

        const cache = {};
        percents.forEach(p => (cache[p.id] = p.percent));
        setPercentCache(cache);
        console.log('Percent cache updated:', cache);
      })
      .catch(err => {
        console.error('Failed to load map data', err);
        setPois([]);
      })
      .finally(() => {
        setLoadingPois(false);
        setPercentLoading(false);
      });
  }, [selectedMap]);

  const handleCityChange = (city) => {
    setSelectedMap(city)
    setDropdownOpen(false)
  }

  const handleCheckIn = () => {
    if (selectedPin) {
      document.body.classList.add('page-transitioning');
      navigate(`/checkin/${selectedPin.id}`, { state: { poi: selectedPin, map: selectedMap, user_location: userLocation} }); // go to specific check-in page
    }
  }

  const handleChat = () => {
    document.body.classList.add('page-transitioning');
    navigate(`/chat`); // go to specific check-in page
  }

  const flyToCityCenter = (e) => {
    e.stopPropagation();

    if (!mapRef.current) {
      console.warn('Map instance not ready yet');
      return;
    }
    if (!userLocation) {
      console.warn('No information about user location');
      // Fall back to city center
      mapRef.current.flyTo([selectedMap.center_lat, selectedMap.center_lng], 13, {
        duration: 1.2,
      });
      setUserMarker(null); // Hide user marker if no location
      return;
    }

    const lat = parseFloat(userLocation.lat);
    const lng = parseFloat(userLocation.lng);

    // Fly to user location
    mapRef.current.flyTo([lat, lng], 16, {
      duration: 1.5,
  });

};

  const validateGPS = (poi) => {
    if (!userLocation) {
      alert('User location not available');
      setCheckinEligible(false);
      return false;
    } else if (!poi) {
      alert('POI data not available');
      setCheckinEligible(false);
      return false;
    }
    const distance = haversineDistance(userLocation.lat, userLocation.lng, poi.lat, poi.lng) * 1000; // in meters
    console.log(`Distance to POI (${poi.name}): ${distance.toFixed(2)} meters`);
    setCheckinEligible(distance <= 200000);
  };

  return (
  <div className="map-page">
    <div className="location-bar">
      <div className="spacer"></div>
      <div className = {`location-box ${dropdownOpen ? 'dropdown' : ''}`}>
        <span className="location-text">{selectedMap?.name || 'Loading...'}</span>
        <button 
          className="dropdown-toggle"
          onClick={() => setDropdownOpen(prev => !prev)}
        >
          <svg className="dropdown-arrow" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>
      </div>
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
                  click: () => {
                    setSelectedPin(pin);
                    validateGPS(pin);
                  }
                }}
              >
              </Marker>
            ))}
            <MapController onMapReady={(map) => { mapRef.current = map; }} />
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={customIconHere}
              zIndexOffset={1000} // Appear on top
            >
              <Popup>
                <div style={{ textAlign: 'center', fontWeight: 'bold'}}>
                  You are here
                </div>
              </Popup>
            </Marker>
          </MapContainer>
          <div className = 'bubble-container'>
            <button 
              className = 'chat-bubble'
              onClick={handleChat}
            >
              <img src = '/src/public/ai.png' className = 'chat-icon'></img>
            </button>
            <button 
              className = 'map-center-bubble'
              onClick={flyToCityCenter}
            >
              <img src = '/src/public/focus.png' className = 'target-icon'></img>
            </button>
          </div>
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
            {percentLoading ? '...' : percentCache[selectedPin?.id] !== undefined
            ? `${percentCache[selectedPin.id]}%`: '–'} of users have checked in here
          </div>
          <p className="popup-desc">{selectedPin.description}</p>
        </div>
          {checkinEgligible ? (
              <button className="checkin-btn" onClick={handleCheckIn}>Check-in</button>
            ) : (
              <>
                <span className ='travel-reminder'> Travel to location to unlock</span>
                <button className="checkin-btn-disabled">Check-in</button>
              </>
            )}
      </div>
    </div>
    )}
  </div>
);
}