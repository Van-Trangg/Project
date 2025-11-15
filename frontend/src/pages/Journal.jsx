// Journal.jsx
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { listJournalsByPOI } from '../api/journal' // Assuming this API exists
import '../styles/Journal.css'

const CITIES = [
  { id: 1, name: 'Ho Chi Minh City', lat: 10.762622, lng: 106.660172, image: '/src/public/Map/hcmc.png' },
  { id: 2, name: 'Phu Quoc', lat: 21.028511, lng: 105.804817, image: '/src/public/Map/pq.png' },
];

// The ALL_DATA constant is no longer needed as we will fetch from the API.
// const ALL_DATA = [ ... ];

export default function Journal() {

  // --- STATE MANAGEMENT ---
  const [locations, setLocations] = useState([]); // State to hold API data
  const [loading, setLoading] = useState(true);     // State for loading status
  const [error, setError] = useState(null);         // State for error handling

  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [centeredCardId, setCenteredCardId] = useState(null); // Initialize to null
  const [selectedLocation, setSelectedLocation] = useState(null);
  const scrollContainerRef = useRef(null);

  // --- API DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Assuming your API returns data in the format: { data: [...] }
        const response = await listJournalsByPOI();
        const fetchedLocations = response.data;
        
        setLocations(fetchedLocations);
        
        // Set the first location as the centered card after data is fetched
        if (fetchedLocations.length > 0) {
          setCenteredCardId(fetchedLocations[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch journal locations:", err);
        setError("Failed to load locations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on component mount

  // --- HANDLER FUNCTIONS ---
  const handleCityChange = (city) => {
    setSelectedCity(city);
    setDropdownOpen(false);
  };

  const handleLocationClick = (locationId) => {
    // Find the full location object from the fetched API data
    const locationDetails = locations.find(l => l.id === locationId);
    if (locationDetails) {
      setSelectedLocation(locationDetails);
    }
  };

  const handleBackToJournals = () => {
    setSelectedLocation(null);
  };

  const handleLocationJournal = () => {
    if (selectedLocation) {
      // Navigate and pass the ENTIRE location object in the state
      navigate(`/location/${selectedLocation.id}`, { state: { location: selectedLocation } });
    }
  };

  // --- INTERSECTION OBSERVER ---
  useEffect(() => {
    // Don't run the observer if locations are still loading or empty
    if (loading || locations.length === 0) return;

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const options = {
      root: scrollContainer,
      rootMargin: '-100px 0px -100px 0px',
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setCenteredCardId(Number(entry.target.dataset.id));
        }
      });
    }, options);

    const cards = scrollContainer.querySelectorAll('.journal-card');
    cards.forEach(card => observer.observe(card));

    return () => {
      cards.forEach(card => observer.unobserve(card));
      observer.disconnect();
    };
  }, [loading, locations, dropdownOpen, selectedLocation]); // Added dependencies

  // --- CONDITIONAL RENDERING ---

  // 1. Show a loading message while fetching data
  if (loading) {
    return (
      <div className='journal-container'>
        <div className="loading-message">Loading locations...</div>
      </div>
    );
  }

  // 2. Show an error message if the API call fails
  if (error) {
    return (
      <div className='journal-container'>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // 3. If a location is selected, show the location details view
  if (selectedLocation) {
    return (
      <div className='journal-container'>
        <div className='location-details'>
          <button className='back-button' onClick={handleBackToJournals}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <img src={selectedLocation.image} alt={selectedLocation.title} className='journal-location-image' />
           <div id='location-name'>{selectedLocation.title}</div>
          <p className='location-description'>{selectedLocation.longDescription}</p>
          <button className='location-action-button' onClick={handleLocationJournal}>View Journal</button>
        </div>
      </div>
    );
  }

  // 4. Otherwise, show the main journal list view using fetched data
  return (
    <div className='journal-container'>
      <h1 id='title'>Journal</h1>
      <div className='location_box'>
        <span className='city_name'>{selectedCity.name}</span>
        <button
          className="dropdown-toggle"
          onClick={() => setDropdownOpen(prev => !prev)}
        >
          <svg className="dropdown-arrow" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>
      </div>

      {/*dropdown*/}
      {dropdownOpen && (
        <div className="dropdown_open">
          <div
            className="overlay-inner"
            onClick={(e) => e.stopPropagation()}
          >
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

      {/* Main Journal List (shown when dropdown is closed) */}
      {!dropdownOpen && (
        <div className='location_region'>
          <p className='jn_des'>Ready to write down your experience?</p>
          <div className='place_pad' ref={scrollContainerRef}>
            <div className="horizontal-scroll-container">
              {/* Use the 'locations' state from the API instead of ALL_DATA */}
              {locations.map(location => (
                <div
                  key={location.id}
                  className={`journal-card ${location.id !== centeredCardId ? 'inactive' : ''}`}
                  data-id={location.id}
                >
                  <img src={location.image} alt={location.title} className="journal-image" />
                  {/* Conditionally render button and description only for the centered card */}
                  {location.id === centeredCardId && (
                    <>
                      <button
                        className="journal-button"
                        onClick={() => handleLocationClick(location.id)}
                      >
                        {location.title}
                      </button>
                      <p className="journal-description">{location.description}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}