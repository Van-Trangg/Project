import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import { listPlaces, getPois, percentageChecked, getNearestMap, checked} from '../api/map'
import '../styles/Map.css'
import 'leaflet/dist/leaflet.css';
import { checkedInIcon, customIcon, customIconHere } from '../components/Pin';
import rewardOutlineIcon from '../public/reward-outline.png';
import rewardSolidIcon from '../public/reward-solid.png';
import homeOutlineIcon from '../public/home-outline.png';
import homeSolidIcon from '../public/home-solid.png';
import journalOutlineIcon from '../public/journal-outline.png';
import journalSolidIcon from '../public/journal-solid.png';
import mapOutlineIcon from '../public/map-outline.png';
import mapSolidIcon from '../public/map-solid.png'
import leaderboardOutlineIcon from '../public/leaderboard-outline.png';
import leaderboardSolidIcon from '../public/leaderboard-solid.png'

const CITY_PREVIEWS = {
  1: 'src/public/Map/hcmc.png',
  2: 'src/public/Map/pq.png',
};

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
  const { state } = useLocation(); 
  const { r_poi, redirect } = state || {};
  const [redirectFlag, setRedirectFlag] = useState(redirect);
  const [maps, setMaps] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedMap, setSelectedMap] = useState(null);
  const [pois, setPois] = useState([]);
  const [checkinEgligible, setCheckinEligible] = useState(false);
  const [loadingMaps, setLoadingMaps] = useState(true);
  const [loadingPois, setLoadingPois] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [percentLoading, setPercentLoading] = useState(false);
  const [percentCache, setPercentCache] = useState({});  
  const [checkInCache, setcheckInCache] = useState({});
  const [mapZoom, setMapZoom] = useState(13);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [budgetFilter, setBudgetFilter] = useState(false);
  const [nearbyFilter, setNearbyFilter] = useState(false);

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

  //Lock scrolling when pin popup is open
  // useEffect(() => {
  //   document.body.style.overflow = "hidden";
  //   return () => {
  //     document.body.style.overflow = "";
  //   };
  // }, [selectedPin]);
  
  // Load POIs + percentages + user's personal check-in status
  useEffect(() => {
    if (!selectedMap || loadingPois || percentLoading) return;

    setLoadingPois(true);
    setPercentLoading(true);
    setPercentCache({});
    setcheckInCache({}); 

    getPois(selectedMap.id)
      .then(res => {
        const poisList = res.data || [];

        // Fetch percentage + personal checked status for each POI in parallel
        const allPromises = poisList.map(poi => {
          return Promise.all([
            percentageChecked(poi.id)
              .then(r => r.data?.percent ?? 0)
              .catch(() => 0),
            checked(poi.id) 
              .then(r => !!r.data?.checked)
              .catch(() => false)
          ]).then(([percent, hasChecked]) => ({
            poi,
            percent,
            hasChecked
          }));
        });

        return Promise.all(allPromises).then(results => ({
          pois: poisList,
          details: results
        }));
      })
      .then(({ pois, details }) => {
        setPois(pois);
        console.log(pois);
        // Build both caches
        const newPercentCache = {};
        const newCheckInCache = {};

        details.forEach(({ poi, percent, hasChecked }) => {
          newPercentCache[poi.id] = percent;
          newCheckInCache[poi.id] = hasChecked;
        });

        setPercentCache(newPercentCache);
        setcheckInCache(newCheckInCache);

        console.log('Updated caches:', { newPercentCache, newCheckInCache });
        setInitialLoadComplete(true);
      })
      .catch(err => {
        console.error('Failed to load map data:', err);
        setPois([]);
        setPercentCache({});
        setcheckInCache({});
        setInitialLoadComplete(true);
      })
      .finally(() => {
        setLoadingPois(false);
        setPercentLoading(false);
      });
  }, [selectedMap]);

  useEffect(() => {
    if (!redirectFlag || !initialLoadComplete) return;
    const targetMap = maps.find(m => m.id === r_poi?.map_id);
    if (targetMap) setSelectedMap(targetMap);
    else selectedMap(maps[0]);
    mapRef.current.flyTo([r_poi.lat, r_poi.lng], 14, {
      duration: 1,
    });
    setTimeout(() => {
      setSelectedPin(r_poi);
      validateGPS(r_poi);
    }, 1100);
    
    
    setRedirectFlag(false);
  }, [maps, redirectFlag, initialLoadComplete]);

  const handleCityChange = (city) => {
    if (city.id === 2) setMapZoom(12);
    else setMapZoom(13);
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
    navigate(`/chat`); 
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
    console.log(poi.id);
    setCheckinEligible(distance <= 200000);
  };

  const filteredPois = pois.filter(poi => {
    let include = true;
    if (checkInCache[poi.id]) return true;
    
    // Apply nearby filter if enabled
    if (nearbyFilter && userLocation) {
      const distance = haversineDistance(userLocation.lat, userLocation.lng, poi.lat, poi.lng);
      include = include && distance <= 30; // 30km radius
    }
    
    // Apply budget filter if enabled
    if (budgetFilter) {
      if (poi.money_required) include = include && poi.money <= 60000;
    }
    
    return include;
  });

  return (
  <div className="map-page">
    <div className="location-bar">
      <div className='spacer'></div>
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
      
      {!dropdownOpen && (<div className = 'filter-bar'>
          <button 
            className={`filter-button ${nearbyFilter ? 'active' : ''}`}
            onClick={() => setNearbyFilter(!nearbyFilter)}
          >
            Gần đây
          </button>
          <button 
            className={`filter-button ${budgetFilter ? 'active' : ''}`}
            onClick={() => setBudgetFilter(!budgetFilter)}
          >
            Tiết kiệm
          </button>
        </div>)}
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
                  style={{ backgroundImage: `url(${CITY_PREVIEWS[city.id]})` }}
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
            zoom={mapZoom}                     
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            whenCreated={(map) => { 
              mapRef.current = map;
              console.log('Map instance saved'); 
            }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            />  
            {filteredPois.map((pin) => (
              <Marker
                className = 'map-pin'
                key={pin.id}
                position={[pin.lat, pin.lng]}
                icon = {checkInCache[pin.id] ? checkedInIcon : customIcon}
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
                  Bạn đang ở đây
                </div>
              </Popup>
            </Marker>
          </MapContainer>
          <div className = 'bubble-container'>
            <button 
              className = 'chat-bubble'
              onClick={handleChat}
            >
              <img src = '/src/public/chat.png' className = 'chat-icon'></img>
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
            ? `${percentCache[selectedPin.id]}%`: '–'} người dùng đã check-in tại đây
          </div>
          <p className="popup-desc">{selectedPin.description}</p>
        </div>
        {checkInCache[selectedPin?.id] ? (
          // User has already checked in → disabled button
          <>
            <span className="travel-reminder">Bạn đã check-in tại đây</span>
            <button className="checkin-btn-disabled">Check-in</button>
          </>
        ) : checkinEgligible ? (
          // User is close enough and hasn't checked in → allow check-in
          <button className="checkin-btn" onClick={handleCheckIn}>Check-in</button>
        ) : (
          // User is too far away
          <>
            <span className="travel-reminder">Hãy di chuyển đến địa danh để mở khóa</span>
            <button className="checkin-btn-disabled">Check-in</button>
          </>
        )}
      </div>
    </div>
    )}
    <nav className="bottom-nav">
      <button className="nav-item" onClick={() => navigate('/reward')}>
        <img src={rewardOutlineIcon} alt="Rewards" className="icon-outline" />
        <img src={rewardSolidIcon} alt="Rewards" className="icon-solid" />
        <span>Phần thuởng</span>
      </button>
      <button className="nav-item" onClick={() => navigate('/journal')}>
        <img src={journalOutlineIcon} alt="Journal" className="icon-outline" />
        <img src={journalSolidIcon} alt="Journal" className="icon-solid" />
        <span>Nhật ký</span>
      </button>
      <button className="nav-item" onClick={() => navigate('/home')}>
        <img src={homeOutlineIcon} alt="Home" className="icon-outline" />
        <img src={homeSolidIcon} alt="Home" className="icon-solid" />
        <span>Trang chủ</span>
      </button>
      <button className="nav-item active" onClick={() => navigate('/map')}>
        <img src={mapOutlineIcon} alt="Map" className='icon-outline' />
        <img src={mapSolidIcon} alt='Map' className='icon-solid' />
        <span>Bản đồ</span>
      </button>
      <button className="nav-item" onClick={() => navigate('/leaderboard')}>
        <img src={leaderboardOutlineIcon} alt='Leaderboard' className='icon-outline' />
        <img src={leaderboardSolidIcon} alt='Leaderboard' className='icon-solid' />
        <span>Bảng xếp hạng</span>
      </button>
    </nav>
  </div>
);
}
