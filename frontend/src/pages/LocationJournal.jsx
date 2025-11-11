// LocationJournal.jsx
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/LocationJournal.css';

export default function LocationJournal() {
  const location = useLocation();
  const navigate = useNavigate();
  const [journalEntries, setJournalEntries] = useState([]);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const addButtonRef = useRef(null);

  // Get the COMPLETE location object passed from Journal.jsx's navigation state
  const locationData = location.state?.location;

  useEffect(() => {
    // Use the entries directly from the passed location object
    if (locationData) {
      setJournalEntries(locationData.entries || []);
    }
  }, [locationData]);

  // Close the add options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAddOptions && addButtonRef.current && !addButtonRef.current.contains(event.target)) {
        setShowAddOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddOptions]);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleAddEntry = () => {
    setShowAddOptions(!showAddOptions);
  };

  // Function to convert emotion number to emoji
  const getEmotionEmoji = (emotion) => {
    const emotionEmojis = ['😢', '😔', '😐', '🙂', '😊', '😄', '😁', '🤗', '😍'];
    return emotionEmojis[emotion] || '😐';
  };

  // If no location data was passed (e.g., from a direct link or refresh), show an error message
  if (!locationData) {
    return (
      <div className='location-journal-container'>
        <div className="error-message">
          <h2>Location Data Not Found</h2>
          <p>Please go back and select a location from the Journal list.</p>
          <button onClick={handleBack} className="back-button">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className='location-journal-container'>
      <div className='location-journal-header'>
        <button className='back-button' onClick={handleBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
      </div>

      <div className='location-journal-hero'>
        {/* Display data passed from Journal.jsx */}
        <img src={locationData.image} alt={locationData.title} className='location-journal-image' />
        <h1 className='location-journal-title'>{locationData.title}</h1>
      </div>

      <div className='journal-entries-container'>
        {journalEntries.length > 0 ? (
          journalEntries.map(entry => (
            <div key={entry.day} className='journal-entry'>
              <div className='journal-entry-header'>
                <h3 className='journal-entry-date'>{entry.day}</h3>
              </div>
              
              {entry.smallEntries.map((smallEntry, index) => (
                <div key={index} className='small-entry'>
                  <div className='small-entry-header'>
                    <span className='entry-time'>{smallEntry.time}</span>
                    <span className='entry-emotion'>{getEmotionEmoji(smallEntry.emotion)}</span>
                  </div>
                  <p className='small-entry-content'>{smallEntry.content}</p>
                  {smallEntry.images && smallEntry.images.length > 0 && (
                    <div className='entry-images'>
                      {smallEntry.images.map((image, imgIndex) => (
                        <img 
                          key={imgIndex} 
                          src={image} 
                          alt={`Entry image ${imgIndex + 1}`} 
                          className='entry-image' 
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className='empty-journal'>
            <h2>No journal entries yet</h2>
            <p>Start documenting your experiences at {locationData.title}!</p>
          </div>
        )}
      </div>

      {/* Add Entry Button with Options */}
      <div className="add-entry-container" ref={addButtonRef}>
        <button 
          className={`add-entry-button ${showAddOptions ? 'active' : ''}`} 
          onClick={handleAddEntry}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </button>

        {/* Add Text Option */}
        <button 
          className={`add-option-button ${showAddOptions ? 'show' : ''}`}
          onClick={() => console.log('Add Text clicked')}
        >
          <span>Add Text</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </button>

        {/* Add Image Option */}
        <button 
          className={`add-option-button ${showAddOptions ? 'show' : ''}`}
          onClick={() => console.log('Add Image clicked')}
        >
          <span>Add Image</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}