//LocationJournal.jsx
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createJournal, updateJournal, deleteJournal } from '../api/journal'; // IMPORT API FUNCTIONS
import '../styles/LocationJournal.css';

const emotionData = [
  { emoji: '😴', label: 'Sleepy', value: 0 },
  { emoji: '😄', label: 'Joyful', value: 1 },
  { emoji: '😢', label: 'Miserable', value: 2 },
  { emoji: '😊', label: 'Happy', value: 3 },
  { emoji: '😔', label: 'Sad', value: 4 },
  { emoji: '😐', label: 'Neutral', value: 5 },
  { emoji: '😁', label: 'Delighted', value: 6 },
  { emoji: '😡', label: 'Angry', value: 7 },
  { emoji: '😕', label: 'Confused', value: 8 }
];

// A robust helper function to get emotion data from either a string label or a number value
const getEmotionData = (input) => {
  // If input is a string (e.g., from API), find by label
  if (typeof input === 'string') {
    return emotionData.find(e => e.label.toLowerCase() === input.toLowerCase()) || emotionData[5]; // Fallback to Neutral
  }
  // If input is a number (e.g., from our state), find by value
  if (typeof input === 'number') {
    return emotionData.find(e => e.value === input) || emotionData[5]; // Fallback to Neutral
  }
  // Default fallback
  return emotionData[5];
};

export default function LocationJournal() {
  const location = useLocation();
  const navigate = useNavigate();
  const [journalEntries, setJournalEntries] = useState([]);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [editingMode, setEditingMode] = useState(false);
  const [editType, setEditType] = useState('');
  const [isEmotionPickerAnimating, setIsEmotionPickerAnimating] = useState(false);
  const [isImageOptionsAnimating, setIsImageOptionsAnimating] = useState(false);
  const [originalEntryId, setOriginalEntryId] = useState(null); // Track original entry ID for deletion
  const [currentEntry, setCurrentEntry] = useState({
    day: formatDate(new Date()),
    time: formatTime(new Date()),
    emotion: 5, // Default to 'Neutral'
    content: '',
    images: []
  });
  const [editingField, setEditingField] = useState(null);
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const addButtonRef = useRef(null);

  // States for deletion modals
  const [showImageDeleteModal, setShowImageDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showEntryDeleteModal, setShowEntryDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [touchTimer, setTouchTimer] = useState(null);

  // Effect for Emotion Picker Animation
  useEffect(() => {
    if (showEmotionPicker) {
      const timer = setTimeout(() => setIsEmotionPickerAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsEmotionPickerAnimating(false);
    }
  }, [showEmotionPicker]);

  // Effect for Image Options Animation
  useEffect(() => {
    if (showImageOptions) {
      const timer = setTimeout(() => setIsImageOptionsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsImageOptionsAnimating(false);
    }
  }, [showImageOptions]);


  // Function to format date as "Month Day, Year" for display
  function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  // Function to format date as "YYYY-MM-DD" for JSON
  function formatDateForJSON(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Function to format time as "HH:MM AM/PM" for display
  function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // Function to parse date string back to Date object
  function parseDate(dateString) {
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(dateString);
    }
    
    // For format like "August 17, 2006"
    const parts = dateString.split(' ');
    if (parts.length === 3) {
      const month = parts[0];
      const day = parts[1].replace(',', '');
      const year = parts[2];
      return new Date(`${month} ${day}, ${year}`);
    }
    
    // Fallback for other formats
    return new Date(dateString);
  }

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
    // Reset for new entry
    setOriginalEntryId(null);
    // Reset form for new entry
    setCurrentEntry({
      day: formatDate(new Date()),
      time: formatTime(new Date()),
      emotion: 5, // Default to 'Neutral'
      content: '',
      images: []
    });
  };

  const handleAddImage = () => {
    setEditType('image');
    setEditingMode(true);
    setShowAddOptions(false);
    // Reset for new entry
    setOriginalEntryId(null);
    // Reset form for new entry
    setCurrentEntry({
      day: formatDate(new Date()),
      time: formatTime(new Date()),
      emotion: 5, // Default to 'Neutral'
      content: '',
      images: []
    });
  };

  const handleEntryClick = (day, entryIndex) => {
    const dayEntry = journalEntries.find(e => e.day === day);
    if (dayEntry && dayEntry.smallEntries[entryIndex]) {
      const entry = dayEntry.smallEntries[entryIndex];

      // Convert string emotion from API to number for internal state
      const emotionDataForEntry = getEmotionData(entry.emotion);

      setCurrentEntry({
        day: day, // Keep the original day format from the entry
        time: entry.time,
        emotion: emotionDataForEntry.value, // Use the numerical value
        content: entry.content,
        images: entry.images || []
      });
      
      // Store the original entry ID for potential deletion
      setOriginalEntryId(entry.id);
      setEditingMode(true);
      setEditType(entry.images && entry.images.length > 0 ? 'image' : 'text');
    }
  };

  const handleSaveAndBack = async () => {
    const emotionLabel = getEmotionData(currentEntry.emotion).label;

    try {
      // Always create a new entry
      const payload = {
        poi_id: locationData.id,
        emotion: emotionLabel,
        content: currentEntry.content,
        images: currentEntry.images,
        // Format date as YYYY-MM-DD for JSON
        day: formatDateForJSON(parseDate(currentEntry.day)),
        // Ensure time is in 12-hour format with AM/PM
        time: formatTime(new Date(`2000-01-01 ${currentEntry.time}`))
      };
      console.log(payload)

      // Create the new entry
      await createJournal(payload);

      // If we were editing an existing entry, delete the old one
      if (originalEntryId) {
        await deleteJournal(originalEntryId);
      }

      // Navigate back to refresh the data
      navigate(-1);

    } catch (error) {
      console.error("Failed to save journal entry:", error);
      // You can show a more user-friendly error message here
      alert("Could not save your entry. Please try again.");
    }
  };

  const handleEmotionSelect = (emotion) => {
    setCurrentEntry({ ...currentEntry, emotion });
    setShowEmotionPicker(false);
  };

  // Handler for image file selection - Updated to convert to base64
  const handleImageFileChange = (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    // Simple size check (e.g., limit to 5MB per image)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        alert(`Image ${file.name} is too large. Please select images under 5MB.`);
        event.target.value = '';
        return;
      }
    }

    const newImageUrls = [];

    // Convert each file to base64
    Array.from(files).forEach(file => {
      const reader = new FileReader();

      reader.onload = (e) => {
        // The result is a base64 string
        newImageUrls.push(e.target.result);

        // Update state after all files are processed
        if (newImageUrls.length === files.length) {
          setCurrentEntry({
            ...currentEntry,
            images: [...(currentEntry.images || []), ...newImageUrls]
          });
          setShowImageOptions(false);
          event.target.value = '';
        }
      };

      reader.readAsDataURL(file);
    });
  };

  // Handle image click in editing mode
  const handleImageClick = (index) => {
    setImageToDelete(index);
    setShowImageDeleteModal(true);
  };

  // Confirm image deletion
  const confirmImageDelete = () => {
    if (imageToDelete !== null) {
      const updatedImages = [...currentEntry.images];
      updatedImages.splice(imageToDelete, 1);
      setCurrentEntry({ ...currentEntry, images: updatedImages });
      setImageToDelete(null);
      setShowImageDeleteModal(false);
    }
  };

  // Cancel image deletion
  const cancelImageDelete = () => {
    setImageToDelete(null);
    setShowImageDeleteModal(false);
  };

  // Handle entry touch start for long press
  const handleEntryTouchStart = (day, index) => {
    const timer = setTimeout(() => {
      setEntryToDelete({ day, index });
      setShowEntryDeleteModal(true);
    }, 800); // 800ms for long press
    setTouchTimer(timer);
  };

  // Handle entry touch end to cancel long press if released early
  const handleEntryTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  // Confirm entry deletion
  const confirmEntryDelete = async () => {
    if (entryToDelete) {
      try {
        const { day, index } = entryToDelete;
        const dayEntry = journalEntries.find(e => e.day === day);

        if (dayEntry && dayEntry.smallEntries[index]) {
          const entryId = dayEntry.smallEntries[index].id;

          // Call the delete API
          await deleteJournal(entryId);

          // Update local state on success
          const updatedEntries = [...journalEntries];
          const dayEntryIndex = updatedEntries.findIndex(e => e.day === day);

          if (dayEntryIndex !== -1) {
            const updatedSmallEntries = [...updatedEntries[dayEntryIndex].smallEntries];
            updatedSmallEntries.splice(index, 1);

            // If no more entries for this day, remove the day entry
            if (updatedSmallEntries.length === 0) {
              updatedEntries.splice(dayEntryIndex, 1);
            } else {
              updatedEntries[dayEntryIndex].smallEntries = updatedSmallEntries;
            }

            setJournalEntries(updatedEntries);
          }
        }

        setEntryToDelete(null);
        setShowEntryDeleteModal(false);
      } catch (error) {
        console.error("Failed to delete journal entry:", error);
        alert("Could not delete your entry. Please try again.");
      }
    }
  };

  // Cancel entry deletion
  const cancelEntryDelete = () => {
    setEntryToDelete(null);
    setShowEntryDeleteModal(false);
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
    // Create a new date object from the selected value
    const newDate = new Date(value);
    
    // Get the current time from the existing entry
    const currentTime = currentEntry.time;
    const [time, period] = currentTime.split(' ');
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);
    if (period === 'PM' && hour24 < 12) hour24 += 12;
    if (period === 'AM' && hour24 === 12) hour24 = 0;
    
    // Set the time on the new date
    newDate.setHours(hour24);
    newDate.setMinutes(parseInt(minutes));
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    
    // Format the date for display
    const formattedDate = formatDate(newDate);
    setCurrentEntry({ ...currentEntry, day: formattedDate });
  } else if (editingField === 'time') {
    // Convert 24-hour format from input to 12-hour format with AM/PM
    const [hours, minutes] = value.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    const formattedTime = formatTime(date);
    setCurrentEntry({ ...currentEntry, time: formattedTime });
  } else {
    setCurrentEntry({ ...currentEntry, [editingField]: value });
  }
  setEditingField(null);
};

  // If no location data was passed, show an error message
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
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className='location-journal-hero'>
            <img src={locationData.image} alt={locationData.title} className='location-journal-image' />
            <h1 className='location-journal-title'>{locationData.title}</h1>
          </div>

          <div className='journal-entries-container'>
            {journalEntries.length > 0 ? (
              journalEntries.map(entry => (
                <div key={entry.day} className='journal-entry'>
                  <div className='journal-entry-header'>
                    <h3 className='journal-entry-date'>{formatDate(parseDate(entry.day))}</h3>
                  </div>

                  {entry.smallEntries.map((smallEntry, index) => {
                    // Get emotion data for each entry
                    const emotion = getEmotionData(smallEntry.emotion);
                    return (
                      <div
                        key={index}
                        className='small-entry'
                        onClick={() => handleEntryClick(entry.day, index)}
                        onTouchStart={() => handleEntryTouchStart(entry.day, index)}
                        onTouchEnd={handleEntryTouchEnd}
                      >
                        <div className='small-entry-header'>
                          <span className='entry-time'>{smallEntry.time}</span>
                          <span className="entry-emotion-text"> - feeling {emotion.label}</span>
                          <span className="entry-emotion-emoji">{emotion.emoji}</span>
                        </div>
                        <p className='small-entry-content'>{smallEntry.content}</p>
                        {smallEntry.images && smallEntry.images.length > 0 && (
                          <div className='entry-images'>
                            {smallEntry.images.map((image, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={image} // This will work with both URLs and base64 strings
                                alt={`Entry image ${imgIndex + 1}`}
                                className='entry-image'
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
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
              <svg viewBox="0 0 24 24" fill="none" stroke="Black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="4" x2="12" y2="20"></line>
                <line x1="4" y1="12" x2="20" y2="12"></line>
              </svg>
            </button>

            <button
              className={`add-option-button ${showAddOptions ? 'show' : ''}`}
              onClick={handleAddText}
            >
              <span>Text</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="8" y1="13" x2="16" y2="13"></line>
                <line x1="8" y1="17" x2="16" y2="17"></line>
              </svg>
            </button>
          </div>
        </>
      )}

      {/* Editing Mode */}
      {editingMode && !showEmotionPicker && !showImageOptions && (
        <div className="editing-mode-container">
          <div className='editing-header'>
            <button className='back-button' onClick={handleSaveAndBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h2>Editing</h2>
          </div>

          <div className="editing-content">
            {/* Parent container for the top row */}
            <div className="editing-top-row">

              {/* Left container for Day and Time */}
              <div className="date-time-group">
                {/* Day Field */}
                {editingField === 'day' ? (
                  <input
                    type="date"
                    className="editing-input editing-input-day"
                    autoFocus
                    onBlur={(e) => handleFieldChange(e.target.value)}
                    defaultValue={(() => {
                      // Handle both YYYY-MM-DD and "Month Day, Year" formats
                      const date = parseDate(currentEntry.day);
                      return date.toISOString().split('T')[0];
                    })()}
                  />
                ) : (
                  <div className="editing-field editing-field-day" onClick={handleDayEdit}>
                    {formatDate(parseDate(currentEntry.day))}
                  </div>
                )}

                {/* Time Field */}
                {editingField === 'time' ? (
                  <input
                    type="time"
                    className="editing-input editing-input-time"
                    autoFocus
                    onBlur={(e) => handleFieldChange(e.target.value)}
                    defaultValue={(() => {
                      // Convert 12-hour format with AM/PM to 24-hour format for the input
                      const timeStr = currentEntry.time;
                      const [time, period] = timeStr.split(' ');
                      const [hours, minutes] = time.split(':');
                      let hour24 = parseInt(hours);
                      if (period === 'PM' && hour24 < 12) hour24 += 12;
                      if (period === 'AM' && hour24 === 12) hour24 = 0;
                      return `${hour24.toString().padStart(2, '0')}:${minutes}`;
                    })()}
                  />
                ) : (
                  <div className="editing-field editing-field-time" onClick={handleTimeEdit}>
                    {currentEntry.time}
                  </div>
                )}
              </div>

              {/* Right container for the Big Emoji */}
              <div className="current-emotion-display">
                {getEmotionData(currentEntry.emotion).emoji}
              </div>

            </div> {/* End of editing-top-row */}

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
                  <div key={index} className="editing-image-container">
                    <img
                      src={image} // This will work with both URLs and base64 strings
                      alt={`Entry image ${index}`}
                      className="editing-image"
                      onClick={() => handleImageClick(index)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Controls - Emotion and Image in Same Block */}
          <div className="editing-controls">
            <div className="emotion-image-block">
              <button className="emotion-button" onClick={() => setShowEmotionPicker(true)}>
                {getEmotionData(currentEntry.emotion).emoji}
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
        </div>
      )}

      {/* Emotion Picker Modal */}
      {showEmotionPicker && (
        <div className={`emotion-picker-modal ${isEmotionPickerAnimating ? 'open' : ''}`}>
          <div className="emotion-picker-content">
            <h3>Choose Your Emotion</h3>
            <div className="emotion-options">
              {emotionData.map((emotion) => (
                <div
                  key={emotion.value}
                  className={`emotion-option ${currentEntry.emotion === emotion.value ? 'selected' : ''}`}
                  onClick={() => handleEmotionSelect(emotion.value)}
                  role="button"
                  tabIndex="0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleEmotionSelect(emotion.value);
                    }
                  }}
                >
                  <span className="emotion-emoji">{emotion.emoji}</span>
                  <span className="emotion-label">{emotion.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Options Modal */}
      {showImageOptions && (
        <div className={`image-options-modal ${isImageOptionsAnimating ? 'open' : ''}`}>
          <div className="image-options-content">
            <h3>Add Image</h3>
            <div className="image-options-buttons">
              {/* Camera Input */}
              <input
                id="camera-input"
                type="file"
                accept="image/*"
                capture="environment"
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
                multiple
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

      {/* Image Delete Confirmation Modal */}
      {showImageDeleteModal && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h3>Delete Image</h3>
            <p>Are you sure you want to delete this image?</p>
            <div className="delete-modal-buttons">
              <button className="cancel-button" onClick={cancelImageDelete}>Cancel</button>
              <button className="confirm-button" onClick={confirmImageDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Entry Delete Confirmation Modal */}
      {showEntryDeleteModal && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h3>Delete Entry</h3>
            <p>Are you sure you want to delete this journal entry?</p>
            <div className="delete-modal-buttons">
              <button className="cancel-button" onClick={cancelEntryDelete}>Cancel</button>
              <button className="confirm-button" onClick={confirmEntryDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}