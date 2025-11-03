import { useState, useEffect } from 'react'
import { listPlaces } from '../api/map'
import mapPlaceholder from '../public/map-placeholder.png' // ← add a placeholder image
import '../styles/Map.css'

const CITIES = [
  { id: 1, name: 'Ho Chi Minh City', lat: 10.762622, lng: 106.660172 },
  { id: 2, name: 'Phu Quoc', lat: 21.028511, lng: 105.804817 },
]

const PINS = [
  { id: 1, lat: 10.7769, lng: 106.7009, title: 'Thủ Thiêm', desc: 'Eco park & future city center' },
  { id: 2, lat: 10.7626, lng: 106.6822, title: 'Bến Nghé', desc: 'Historic riverside area' },
  { id: 3, lat: 10.7554, lng: 106.6753, title: 'Mai Chí Thọ', desc: 'Modern boulevard' },
]

export default function Map() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedPin, setSelectedPin] = useState(null)
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch places from API (fallback to static if fails)
  useEffect(() => {
    listPlaces()
      .then(r => setPlaces(r.data))
      .catch(() => console.log('Using static pins'))
      .finally(() => setLoading(false))
  }, [])

  const handleCityChange = (city) => {
    setSelectedCity(city)
    setDropdownOpen(false)
  }

  return (
  <div className="map-page">
    {/* Top Location Bar */}
    <div className="location-bar">
      <button
        className="location-selector"
        onClick={() => setDropdownOpen(prev => !prev)}
      >
        <span>{selectedCity.name}</span>
        <svg className="dropdown-arrow" viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
    </div>

    {/* FULL-SCREEN CITY OVERLAY – COVERS EVERYTHING */}
    {dropdownOpen && (
      <div className="city-fullscreen-overlay" onClick={() => setDropdownOpen(false)}>
        <div 
          className="overlay-inner" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* City List */}
          <div className="city-grid">
            {CITIES.map((city) => (
              <button
                key={city.id}
                className="city-card"
                onClick={() => {
                  handleCityChange(city);
                  setDropdownOpen(false);
                }}
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
    {/* Map Container – ONLY render when the overlay is closed */}
    {!dropdownOpen && (
      <div className="map-container">
        {loading ? (
          <div className="map-loading">Loading map…</div>
        ) : (
          <div
            className="map-placeholder"
            style={{ backgroundImage: `url(${mapPlaceholder})` }}
          >
            {/* Render Pins */}
            {PINS.map((pin) => (
              <button
                key={pin.id}
                className="map-pin"
                style={{
                  top: `${((pin.lat - 10.73) / (10.80 - 10.73)) * 100}%`,
                  left: `${((pin.lng - 106.65) / (106.73 - 106.65)) * 100}%`,
                }}
                onClick={() => setSelectedPin(pin)}
              >
                <span className="pin-icon">Pin</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )}
    {/* Pin Popup */}
    {selectedPin && (
      <div className="pin-popup" onClick={() => setSelectedPin(null)}>
        <div className="popup-content" onClick={e => e.stopPropagation()}>
          <h3>{selectedPin.title}</h3>
          <p>{selectedPin.desc}</p>
          <button className="popup-close" onClick={() => setSelectedPin(null)}>
            x
          </button>
        </div>
      </div>
    )}
  </div>
);
}