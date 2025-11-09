import { useEffect, useState, useRef } from 'react'
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
    title: 'Đào Khi',
    description: 'Khám phá mọi trương rừng nguyên sinh ngập mặn',
    image: 'https://static.vinwonders.com/2022/03/dao-khi-nha-trang.jpg'
  },
  {
    id: 2,
    title: 'Can Gio Mangrove',
    description: 'Explore the pristine mangrove forests',
    image: 'https://picsum.photos/seed/mangrove/300/400.jpg'
  },
  {
    id: 3,
    title: 'Wildlife Sanctuary',
    description: 'Discover diverse wildlife in their natural habitat',
    image: 'https://picsum.photos/seed/wildlife/300/400.jpg'
  },
  {
    id: 4,
    title: 'River Adventure',
    description: 'Navigate through the winding rivers of the delta',
    image: 'https://picsum.photos/seed/river/300/400.jpg'
  }
]

export default function Journal() {
  const [items, setItems] = useState([])
  useEffect(() => { listJournals().then(r => setItems(r.data)) }, [])

  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // State to track the ID of the centered card
  const [centeredCardId, setCenteredCardId] = useState(SAMPLE_JOURNALS[0].id);
  const scrollContainerRef = useRef(null);

  const handleCityChange = (city) => {
    setSelectedCity(city)
    setDropdownOpen(false)
  }

  // IntersectionObserver to detect the centered card
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const options = {
      root: scrollContainer,
      rootMargin: '0px',
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

    // Cleanup observer on component unmount
    return () => {
      cards.forEach(card => observer.unobserve(card));
    };
  }, [dropdownOpen]); // Re-run observer when dropdown closes/opens to recalculate

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

      {/*dropdown closed*/}
      {
        !dropdownOpen && (
          <div className='location_region'>
            <p className='jn_des'>Ready to write down your experience?</p>
            <div className='place_pad' ref={scrollContainerRef}>
              <div className="horizontal-scroll-container">
                {SAMPLE_JOURNALS.map(journal => (
                  <div 
                    key={journal.id} 
                    className={`journal-card ${journal.id !== centeredCardId ? 'inactive' : ''}`}
                    data-id={journal.id} // Add data-id for observer
                  >
                    <img src={journal.image} alt={journal.title} className="journal-image" />
                    {/* Conditionally render button and description only for the centered card */}
                    {journal.id === centeredCardId && (
                      <>
                        <button className="journal-button">{journal.title}</button>
                        <p className="journal-description">{journal.description}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>)
      }
    </div>
  )
}