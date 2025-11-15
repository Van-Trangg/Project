// Journal.jsx
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { listJournals } from '../api/journal' // Assuming this API exists
import '../styles/Journal.css'

const CITIES = [
  { id: 1, name: 'Ho Chi Minh City', lat: 10.762622, lng: 106.660172, image: '/src/public/Map/hcmc.png' },
  { id: 2, name: 'Phu Quoc', lat: 21.028511, lng: 105.804817, image: '/src/public/Map/pq.png' },
];

// ALL DATA: A single source of truth for all locations and their entries.
const ALL_DATA = [
  {
    id: 1,
    title: 'Đảo Khỉ',
    description: 'A pristine island home to hundreds of playful monkeys.',
    longDescription: 'Đảo Khỉ Cần Giờ là điểm đến lý tưởng cho những ai yêu thích thiên nhiên và khám phá thế giới động vật hoang dã. Chỉ cách trung tâm Sài Gòn khoảng 50km, đảo Khỉ Cần Giờ thu hút du khách bởi hàng nghìn chú khỉ tinh nghịch cùng không gian rừng ngập mặn xanh mát, yên bình.',
    image: 'https://static.vinwonders.com/2022/03/dao-khi-nha-trang.jpg',
    entries: [
      {
        day: '25/10/2025',
        smallEntries: [
          {
            time: '09:30 AM',
            emotion: 7,
            content: 'This was my first time visiting this place. The scenery was breathtaking and I enjoyed every moment of my stay here.',
            images: [
              'https://picsum.photos/seed/dao-khi-1/300/200.jpg',
              'https://picsum.photos/seed/dao-khi-1/300/200.jpg',
              'https://picsum.photos/seed/dao-khi-1/300/200.jpg'
            ]
          },
          {
            time: '10:30 AM',
            emotion: 7,
            content: 'This was my first time visiting this place. The scenery was breathtaking and I enjoyed every moment of my stay here.',
            images: [
              'https://picsum.photos/seed/dao-khi-1/300/200.jpg'
            ]
          }
        ]
      },
      {
        day: '05/11/2025',
        smallEntries: [
          {
            time: '02:15 PM',
            emotion: 8,
            content: 'I had an amazing encounter with the local wildlife today. I saw so many different species and learned a lot about their habitat.',
            images: [
              'https://picsum.photos/seed/dao-khi-2/300/200.jpg'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Can Gio Mangrove',
    description: 'A vast, serene mangrove forest, a UNESCO Biosphere Reserve.',
    longDescription: 'Khám phá vẻ đẹp của một trong những khu rừng ngập mặn quan trọng nhất thế giới. Khu dự trữ sinh quyển của UNESCO là nơi sinh sống của đa dạng sinh vật và cung cấp một lối thoát khỏi thành phố ồn ào, yên bình.',
    image: 'https://picsum.photos/seed/mangrove/800/600.jpg',
    entries: [
      {
        day: '15/09/2025',
        smallEntries: [
          {
            time: '10:30 AM',
            emotion: 6,
            content: 'Explored the mangrove forest by kayak. It was so peaceful and beautiful.',
            images: [
              'https://picsum.photos/seed/mangrove-1/300/200.jpg'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Wildlife Sanctuary',
    description: 'A protected area for diverse native wildlife.',
    longDescription: 'Trải nghiệm sự đa dạng sinh vật hoang dã trong môi trường sống tự nhiên của chúng. Đây là một khu bảo tồn phải đến cho những ai yêu thích thiên nhiên, nơi bạn có thể nhìn thấy các loài động vật quý hiếm và tìm hiểu về nỗ lực bảo tồn chúng.',
    image: 'https://picsum.photos/seed/wildlife/800/600.jpg',
    entries: []
  },
  {
    id: 4,
    title: 'River Adventure',
    description: 'A journey through the iconic Mekong Delta.',
    longDescription: 'Bắt đầu cuộc phiêu lưu qua những con sông uốn lượn của đồng bằng. Trải nghiệm văn hóa địa phương, tham quan các chợ nổi và tận hưởng cảnh quan tuyệt đẹp của khu vực đặc trưng này.',
    image: 'https://picsum.photos/seed/river/800/600.jpg',
    entries: []
  }
];

export default function Journal() {
  const [items, setItems] = useState([]);
  useEffect(() => { listJournals().then(r => setItems(r.data)) }, []);

  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [centeredCardId, setCenteredCardId] = useState(ALL_DATA[0].id);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const scrollContainerRef = useRef(null);

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setDropdownOpen(false);
  };

  const handleLocationClick = (locationId) => {
    // Find the full location object from our single data source
    const locationDetails = ALL_DATA.find(l => l.id === locationId);
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

  // IntersectionObserver to detect the centered card
  useEffect(() => {
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
  }, [dropdownOpen, selectedLocation]);

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
          <button className='location-action-button' onClick={handleLocationJournal}>View Journal</button>
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
              {ALL_DATA.map(location => (
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