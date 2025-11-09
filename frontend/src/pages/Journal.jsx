import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom' // Import useNavigate
import { listJournals } from '../api/journal'
import '../styles/Journal.css'

const CITIES = [
  { id: 1, name: 'Ho Chi Minh City', lat: 10.762622, lng: 106.660172, image: '/src/public/Map/hcmc.png' },
  { id: 2, name: 'Phu Quoc', lat: 21.028511, lng: 105.804817, image: '/src/public/Map/pq.png' },
]

// Sample journal entries data
const SAMPLE_JOURNALS = [
  {
    id: 1,
    title: 'Đảo Khỉ',
    description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Assumenda libero pariatur repellat nam sint, amet architecto fugit saepe?',
    longDescription: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Assumenda libero pariatur repellat nam sint, amet architecto fugit saepe? Illo voluptate sit dolore officiis cum. Iste, beatae corrupti! Doloribus fugit reprehenderit eaque illum, fuga, quo placeat expedita iusto labore maxime animi! Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    image: 'https://static.vinwonders.com/2022/03/dao-khi-nha-trang.jpg'
  },
  {
    id: 2,
    title: 'Can Gio Mangrove',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officiis quaerat ab necessitatibus exercitationem rem veritatis recusandae.',
    longDescription: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officiis quaerat ab necessitatibus exercitationem rem veritatis recusandae, eos natus. Maxime officia odit modi reprehenderit. Dicta itaque, corporis maiores exercitationem minus accusantium! Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    image: 'https://picsum.photos/seed/mangrove/300/400.jpg'
  },
  {
    id: 3,
    title: 'Wildlife Sanctuary',
    description: 'Discover diverse wildlife in their natural habitat',
    longDescription: 'Discover diverse wildlife in their natural habitat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    image: 'https://picsum.photos/seed/wildlife/300/400.jpg'
  },
  {
    id: 4,
    title: 'River Adventure',
    description: 'Navigate through the winding rivers of the delta',
    longDescription: 'Navigate through the winding rivers of the delta. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    image: 'https://picsum.photos/seed/river/300/400.jpg'
  }
]

export default function Journal() {
  const [items, setItems] = useState([])
  useEffect(() => { listJournals().then(r => setItems(r.data)) }, [])
  
  // Add navigate hook
  const navigate = useNavigate();

  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // State to track the ID of the centered card
  const [centeredCardId, setCenteredCardId] = useState(SAMPLE_JOURNALS[0].id);
  // State to track the selected location for detailed view
  const [selectedLocation, setSelectedLocation] = useState(null);
  const scrollContainerRef = useRef(null);

  const handleCityChange = (city) => {
    setSelectedCity(city)
    setDropdownOpen(false)
  }

  // Handler for location click - sets the selected location to show details
  const handleLocationClick = (journalId) => {
    const journal = SAMPLE_JOURNALS.find(j => j.id === journalId);
    if (journal) {
      setSelectedLocation(journal);
    }
  }

  // Handler to go back to journal view
  const handleBackToJournals = () => {
    setSelectedLocation(null);
  }

  // Handler to navigate to location journal page
  const handleLocationJournal = () => {
    if (selectedLocation) {
      // Navigate to location journal page with location data
      navigate(`/location/${selectedLocation.id}`, { state: { location: selectedLocation } });
    }
  }

  // IntersectionObserver to detect the centered card
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const options = {
      root: scrollContainer,
      rootMargin: '-100px 0px -100px 0px', // Adjust to detect when card is in center
      threshold: 0.5 // Fire when 50% of the element is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setCenteredCardId(Number(entry.target.dataset.id));
        }
      });
    }, options);

    // Observe all journal cards
    const cards = scrollContainer.querySelectorAll('.journal-card');
    cards.forEach(card => observer.observe(card));

    // --- THIS IS THE FIX ---
    // Cleanup observer on component unmount or when dependencies change
    return () => {
      cards.forEach(card => observer.unobserve(card));
      observer.disconnect();
    };
  }, [dropdownOpen, selectedLocation]); // <-- ADD selectedLocation TO THE DEPENDENCY ARRAY

  // --- CONDITIONAL RENDERING ---
  // If a location is selected, show the location details view
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
          <button className='location-action-button' onClick={handleLocationJournal}>Test</button>
        </div>
      </div>
    );
  }

  // Otherwise, show the main journal list view
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
              {SAMPLE_JOURNALS.map(journal => (
                <div 
                  key={journal.id} 
                  className={`journal-card ${journal.id !== centeredCardId ? 'inactive' : ''}`}
                  data-id={journal.id}
                >
                  <img src={journal.image} alt={journal.title} className="journal-image" />
                  {/* Conditionally render button and description only for the centered card */}
                  {journal.id === centeredCardId && (
                    <>
                      <button 
                        className="journal-button"
                        onClick={() => handleLocationClick(journal.id)} // <-- CLICK HANDLER
                      >
                        {journal.title}
                      </button>
                      <p className="journal-description">{journal.description}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}