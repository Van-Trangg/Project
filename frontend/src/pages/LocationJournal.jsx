// LocationJournal.jsx
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/LocationJournal.css';

export default function LocationJournal() {
  const location = useLocation();
  const navigate = useNavigate();
  const [journalEntries, setJournalEntries] = useState([]);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [editingMode, setEditingMode] = useState(false);
  const [editType, setEditType] = useState('');
  const [currentEntry, setCurrentEntry] = useState({
    day: new Date().toLocaleDateString('en-GB'),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    emotion: 4,
    content: '',
    images: []
  });
  const [editingField, setEditingField] = useState(null);
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
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

  const handleAddText = () => {
    setEditType('text');
    setEditingMode(true);
    setShowAddOptions(false);
    // Reset form for new entry
    setCurrentEntry({
      day: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      emotion: 4,
      content: '',
      images: []
    });
  };

  const handleAddImage = () => {
    setEditType('image');
    setEditingMode(true);
    setShowAddOptions(false);
    // Reset form for new entry
    setCurrentEntry({
      day: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      emotion: 4,
      content: '',
      images: []
    });
  };

  const handleEntryClick = (day, entryIndex) => {
    const dayEntry = journalEntries.find(e => e.day === day);
    if (dayEntry && dayEntry.smallEntries[entryIndex]) {
      const entry = dayEntry.smallEntries[entryIndex];
      setCurrentEntry({
        day: day,
        time: entry.time,
        emotion: entry.emotion,
        content: entry.content,
        images: entry.images || []
      });
      setEditingMode(true);
      setEditType(entry.images && entry.images.length > 0 ? 'image' : 'text');
    }
  };

  const handleSaveAndBack = () => {
    // Create a new entry with the current form data
    const newEntry = { ...currentEntry };
    
    // Find if there's already an entry for this day
    const existingDayIndex = journalEntries.findIndex(entry => entry.day === newEntry.day);
    
    if (existingDayIndex !== -1) {
      // Add to existing day
      const updatedEntries = [...journalEntries];
      updatedEntries[existingDayIndex].smallEntries.push(newEntry);
      setJournalEntries(updatedEntries);
    } else {
      // Create a new day entry
      setJournalEntries([
        ...journalEntries,
        {
          day: newEntry.day,
          smallEntries: [newEntry]
        }
      ]);
    }
    
    // Exit editing mode
    setEditingMode(false);
    setEditingField(null);
  };

  const handleEmotionSelect = (emotion) => {
    setCurrentEntry({ ...currentEntry, emotion });
    setShowEmotionPicker(false);
  };

  // Handler for image file selection
  const handleImageFileChange = (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    const newImageUrls = [];
    for (let i = 0; i < files.length; i++) {
      // Create a temporary URL for the selected image to display it
      const imageUrl = URL.createObjectURL(files[i]);
      newImageUrls.push(imageUrl);
    }

    setCurrentEntry({
      ...currentEntry,
      images: [...(currentEntry.images || []), ...newImageUrls]
    });
    
    setShowImageOptions(false);
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleDayEdit = () => {
    setEditingField('day');
  };

  const handleTimeEdit = () => {
    setEditingField('time');
  };

  const handleContentEdit = () => {
    setEditingField('content');
  };

  const handleFieldChange = (value) => {
    if (editingField === 'day') {
      // The date input gives us 'yyyy-mm-dd'. We need to convert it back to 'dd/mm/yyyy'.
      // 1. Create a Date object from the input's value.
      const dateObject = new Date(value);
      // 2. Format the Date object back to the desired 'dd/mm/yyyy' format.
      const formattedDate = dateObject.toLocaleDateString('en-GB');
      // 3. Update the state with the correctly formatted date.
      setCurrentEntry({ ...currentEntry, day: formattedDate });
    } else {
      setCurrentEntry({ ...currentEntry, [editingField]: value });
    }
    setEditingField(null);
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
      {/* Normal View */}
      {!editingMode && (
        <>
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
                    <div 
                      key={index} 
                      className='small-entry'
                      onClick={() => handleEntryClick(entry.day, index)}
                    >
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
              onClick={handleAddText}
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
              onClick={handleAddImage}
            >
              <span>Add Image</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>
          </div>
        </>
      )}

      {/* Editing Mode */}
      {editingMode && (
        <div className="editing-mode-container">
          <div className='editing-header'>
            <button className='back-button' onClick={handleSaveAndBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            <h2>Editing</h2>
          </div>

          <div className="editing-content">
            {/* Day Field */}
            {editingField === 'day' ? (
              <input 
                type="date" 
                className="editing-input"
                autoFocus
                onBlur={(e) => handleFieldChange(e.target.value)}
                defaultValue={currentEntry.day}
              />
            ) : (
              <div className="editing-field" onClick={handleDayEdit}>
                {currentEntry.day}
              </div>
            )}

            {/* Time Field */}
            {editingField === 'time' ? (
              <input 
                type="time" 
                className="editing-input"
                autoFocus
                onBlur={(e) => handleFieldChange(e.target.value)}
                defaultValue={currentEntry.time}
              />
            ) : (
              <div className="editing-field" onClick={handleTimeEdit}>
                {currentEntry.time}
              </div>
            )}

            {/* Content Field */}
            {editingField === 'content' ? (
              <textarea 
                className="editing-textarea"
                autoFocus
                onBlur={(e) => handleFieldChange(e.target.value)}
                defaultValue={currentEntry.content}
              />
            ) : (
              <div className="editing-content-field" onClick={handleContentEdit}>
                {currentEntry.content || 'Note'}
              </div>
            )}

            {/* Images */}
            {currentEntry.images && currentEntry.images.length > 0 && (
              <div className="editing-images">
                {currentEntry.images.map((image, index) => (
                  <img key={index} src={image} alt={`Entry image ${index}`} className="editing-image" />
                ))}
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="editing-controls">
            <div className="right-controls">
              <button className="emotion-button" onClick={() => setShowEmotionPicker(true)}>
                {getEmotionEmoji(currentEntry.emotion)}
              </button>

              <button className="add-image-button" onClick={() => setShowImageOptions(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </button>
            </div>
          </div>

          {/* Emotion Picker Modal */}
          {showEmotionPicker && (
            <div className="emotion-picker-modal">
              <div className="emotion-picker-content">
                <h3>Select Emotion</h3>
                <div className="emotion-options">
                  {['😢', '😔', '😐', '🙂', '😊', '😄', '😁', '🤗', '😍'].map((emoji, index) => (
                    <button 
                      key={index} 
                      className={`emotion-option ${currentEntry.emotion === index ? 'selected' : ''}`}
                      onClick={() => handleEmotionSelect(index)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Image Options Modal */}
          {showImageOptions && (
            <div className="image-options-modal">
              <div className="image-options-content">
                <h3>Add Image</h3>
                <div className="image-options-buttons">
                  {/* Camera Input */}
                  <input
                    id="camera-input"
                    type="file"
                    accept="image/*"
                    capture="environment" // This attribute is key for opening the camera
                    style={{ display: 'none' }}
                    onChange={handleImageFileChange}
                  />
                  <label htmlFor="camera-input" className="image-option-button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    <span>Take Photo</span>
                  </label>

                  {/* Gallery Input */}
                  <input
                    id="gallery-input"
                    type="file"
                    accept="image/*"
                    multiple // Allow selecting multiple images from the gallery
                    style={{ display: 'none' }}
                    onChange={handleImageFileChange}
                  />
                  <label htmlFor="gallery-input" className="image-option-button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span>Choose from Gallery</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}