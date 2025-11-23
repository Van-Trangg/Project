// Journal.jsx
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { listJournalsByPOI } from '../api/journal' // Assuming this API exists
import '../styles/Journal.css'
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

const CITIES = [
  { id: 1, name: 'Ho Chi Minh City', lat: 10.762622, lng: 106.660172, image: '/src/public/Map/hcmc.png' },
  { id: 2, name: 'Phu Quoc', lat: 21.028511, lng: 105.804817, image: '/src/public/Map/pq.png' },
];

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
        // FIX: Pass the selected city's id as map_id to filter the results
        const response = await listJournalsByPOI(selectedCity.id);
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
  }, [selectedCity]); // Add selectedCity as a dependency to re-fetch when city changes

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
        <nav className="bottom-nav">
          <button className="nav-item" onClick={() => navigate('/reward')}>
            <img src={rewardOutlineIcon} alt="Rewards" className="icon-outline" />
            <img src={rewardSolidIcon} alt="Rewards" className="icon-solid" />
            <span>Rewards</span>
          </button>
          <button className="nav-item active" onClick={() => navigate('/journal')}>
            <img src={journalOutlineIcon} alt="Journal" className="icon-outline" />
            <img src={journalSolidIcon} alt="Journal" className="icon-solid" />
            <span>Journal</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/home')}>
            <img src={homeOutlineIcon} alt="Home" className="icon-outline" />
            <img src={homeSolidIcon} alt="Home" className="icon-solid" />
            <span>Home</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/map')}>
            <img src={mapOutlineIcon} alt="Map" className='icon-outline' />
            <img src={mapSolidIcon} alt='Map' className='icon-solid' />
            <span>Map</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/leaderboard')}>
            <img src={leaderboardOutlineIcon} alt='Leaderboard' className='icon-outline' />
            <img src={leaderboardSolidIcon} alt='Leaderboard' className='icon-solid' />
            <span>Leaderboard</span>
          </button>
        </nav>
      </div>
    );
  }

  // 2. Show an error message if the API call fails
  if (error) {
    return (
      <div className='journal-container'>
        <div className="error-message">{error}</div>
        <nav className="bottom-nav">
          <button className="nav-item" onClick={() => navigate('/reward')}>
            <img src={rewardOutlineIcon} alt="Rewards" className="icon-outline" />
            <img src={rewardSolidIcon} alt="Rewards" className="icon-solid" />
            <span>Rewards</span>
          </button>
          <button className="nav-item active" onClick={() => navigate('/journal')}>
            <img src={journalOutlineIcon} alt="Journal" className="icon-outline" />
            <img src={journalSolidIcon} alt="Journal" className="icon-solid" />
            <span>Journal</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/home')}>
            <img src={homeOutlineIcon} alt="Home" className="icon-outline" />
            <img src={homeSolidIcon} alt="Home" className="icon-solid" />
            <span>Home</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/map')}>
            <img src={mapOutlineIcon} alt="Map" className='icon-outline' />
            <img src={mapSolidIcon} alt='Map' className='icon-solid' />
            <span>Map</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/leaderboard')}>
            <img src={leaderboardOutlineIcon} alt='Leaderboard' className='icon-outline' />
            <img src={leaderboardSolidIcon} alt='Leaderboard' className='icon-solid' />
            <span>Leaderboard</span>
          </button>
        </nav>
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
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <img src={selectedLocation.image} alt={selectedLocation.title} className='journal-location-image' />
          <div id='location-name'>{selectedLocation.title}</div>
          <p className='location-description'>{selectedLocation.longDescription}</p>
          <div className='location-action-button' onClick={handleLocationJournal}>
            <svg
              viewBox="0 0 24 24"
              class="icon"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round">
              <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="8" y1="13" x2="16" y2="13"></line>
              <line x1="8" y1="17" x2="16" y2="17"></line>
            </svg>
          </div>
        </div>
        <nav className="bottom-nav">
          <button className="nav-item" onClick={() => navigate('/reward')}>
            <img src={rewardOutlineIcon} alt="Rewards" className="icon-outline" />
            <img src={rewardSolidIcon} alt="Rewards" className="icon-solid" />
            <span>Rewards</span>
          </button>
          <button className="nav-item active" onClick={() => navigate('/journal')}>
            <img src={journalOutlineIcon} alt="Journal" className="icon-outline" />
            <img src={journalSolidIcon} alt="Journal" className="icon-solid" />
            <span>Journal</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/home')}>
            <img src={homeOutlineIcon} alt="Home" className="icon-outline" />
            <img src={homeSolidIcon} alt="Home" className="icon-solid" />
            <span>Home</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/map')}>
            <img src={mapOutlineIcon} alt="Map" className='icon-outline' />
            <img src={mapSolidIcon} alt='Map' className='icon-solid' />
            <span>Map</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/leaderboard')}>
            <img src={leaderboardOutlineIcon} alt='Leaderboard' className='icon-outline' />
            <img src={leaderboardSolidIcon} alt='Leaderboard' className='icon-solid' />
            <span>Leaderboard</span>
          </button>
        </nav>
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
            className="overlay-inner-journal"
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
      
      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/reward')}>
          <img src={rewardOutlineIcon} alt="Rewards" className="icon-outline" />
          <img src={rewardSolidIcon} alt="Rewards" className="icon-solid" />
          <span>Rewards</span>
        </button>
        <button className="nav-item active" onClick={() => navigate('/journal')}>
          <img src={journalOutlineIcon} alt="Journal" className="icon-outline" />
          <img src={journalSolidIcon} alt="Journal" className="icon-solid" />
          <span>Journal</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/home')}>
          <img src={homeOutlineIcon} alt="Home" className="icon-outline" />
          <img src={homeSolidIcon} alt="Home" className="icon-solid" />
          <span>Home</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/map')}>
          <img src={mapOutlineIcon} alt="Map" className='icon-outline' />
          <img src={mapSolidIcon} alt='Map' className='icon-solid' />
          <span>Map</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/leaderboard')}>
          <img src={leaderboardOutlineIcon} alt='Leaderboard' className='icon-outline' />
          <img src={leaderboardSolidIcon} alt='Leaderboard' className='icon-solid' />
          <span>Leaderboard</span>
        </button>
      </nav>
    </div>
  );
}