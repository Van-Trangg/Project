// LocationJournal.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/LocationJournal.css';

export default function LocationJournal() {
  const location = useLocation();
  const navigate = useNavigate();
  const [journalEntries, setJournalEntries] = useState([]);

  // Get the COMPLETE location object passed from Journal.jsx's navigation state
  const locationData = location.state?.location;

  useEffect(() => {
    // Use the entries directly from the passed location object
    if (locationData) {
      setJournalEntries(locationData.entries || []);
    }
  }, [locationData]);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
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
            <div key={entry.id} className='journal-entry'>
              <div className='journal-entry-header'>
                <h3 className='journal-entry-title'>{entry.title}</h3>
                <p className='journal-entry-date'>{entry.date}</p>
              </div>
              <img src={entry.image} alt={entry.title} className='journal-entry-image' />
              <p className='journal-entry-content'>{entry.content}</p>
            </div>
          ))
        ) : (
          <div className='empty-journal'>
            <h2>No journal entries yet</h2>
            <p>Start documenting your experiences at {locationData.title}!</p>
          </div>
        )}
      </div>

      <button className='add-entry-button'>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}