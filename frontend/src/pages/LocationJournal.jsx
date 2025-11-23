//LocationJournal.jsx
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createJournal, updateJournal, deleteJournal } from '../api/journal'; // IMPORT API FUNCTIONS
import '../styles/LocationJournal.css';
import rewardOutlineIcon from '../public/reward-outline.png';
import rewardSolidIcon from '../public/reward-solid.png';
import homeOutlineIcon from '../public/home-outline.png';
import homeSolidIcon from '../public/home-solid.png';
import journalOutlineIcon from '../public/journal-outline.png';
import journalSolidIcon from '../public/journal-solid.png';
import mapOutlineIcon from '../public/map-outline.png';
import mapSolidIcon from '../public/map-solid.png';
import leaderboardOutlineIcon from '../public/leaderboard-outline.png';
import leaderboardSolidIcon from '../public/leaderboard-solid.png';
import addImgIcon from '../public/add_img.png';
import addEmotionIcon from '../public/add_emotion.png';

const emotionData = [
  { emoji: '😴', label: 'Sleepy', labelVn: 'Ngủ gật', value: 0 },
  { emoji: '😄', label: 'Joyful', labelVn: 'Vui sướng', value: 1 },
  { emoji: '😢', label: 'Miserable', labelVn: 'Tuyệt vọng', value: 2 },
  { emoji: '😊', label: 'Happy', labelVn: 'Hạnh phúc', value: 3 },
  { emoji: '😔', label: 'Sad', labelVn: 'Buồn bã', value: 4 },
  { emoji: '😐', label: 'Neutral', labelVn: 'Bình thường', value: 5 },
  { emoji: '😁', label: 'Delighted', labelVn: 'Thích thú', value: 6 },
  { emoji: '😡', label: 'Angry', labelVn: 'Tức giận', value: 7 },
  { emoji: '😕', label: 'Confused', labelVn: 'Bối rối', value: 8 }
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

// Helper function to convert time string to 24-hour format
const convertTo24HourFormat = (timeString) => {
  // Check if the time string is already in 24-hour format (HH:MM)
  if (/^\d{1,2}:\d{2}$/.test(timeString)) {
    return timeString;
  }

  // Parse the 12-hour format with AM/PM
  const [time, period] = timeString.split(' ');
  if (!time || !period) return timeString; // Return original if format is unexpected

  const [hours, minutes] = time.split(':');
  let hour24 = parseInt(hours, 10);

  if (period.toUpperCase() === 'PM' && hour24 < 12) {
    hour24 += 12;
  }
  if (period.toUpperCase() === 'AM' && hour24 === 12) {
    hour24 = 0;
  }

  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
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


  // Function to format date as "DD tháng MM, YYYY" for display (e.g., "17 tháng 8, 2006")
  function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    // Use 'vi-VN' locale for Vietnamese formatting
    return date.toLocaleDateString('vi-VN', options);
  }

  // Function to format date as "YYYY-MM-DD" for JSON
  function formatDateForJSON(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Function to format time as "HH:MM" (24-hour format) for display
  function formatTime(date) {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Use 24-hour format
    });
  }

  // Function to parse date string back to Date object
  function parseDate(dateString) {
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(dateString);
    }

    // NEW: Check for Vietnamese format "DD tháng MM, YYYY"
    const vietnameseDateRegex = /^(\d{1,2})\s+tháng\s+(\d{1,2}),\s+(\d{4})$/;
    const match = dateString.match(vietnameseDateRegex);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
      const year = parseInt(match[3], 10);
      return new Date(year, month, day);
    }

    // Fallback for other formats (e.g., old English format like "August 17, 2006")
    const parts = dateString.split(' ');
    if (parts.length === 3) {
      const month = parts[0];
      const day = parts[1].replace(',', '');
      const year = parts[2];
      return new Date(`${month} ${day}, ${year}`);
    }

    // Final fallback
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
        // Combine day and time into a single datetime field
        created_at: (() => {
          // Parse the day string to get a Date object
          const date = parseDate(currentEntry.day);

          // Parse the time string and update the date object
          const timeStr = currentEntry.time;
          // Simplified parsing for HH:MM format
          const [hours, minutes] = timeStr.split(':');
          date.setHours(parseInt(hours, 10));
          date.setMinutes(parseInt(minutes, 10));
          date.setSeconds(0);
          date.setMilliseconds(0);

          // Return in ISO format
          return date.toISOString();
        })(),
        // Add the eco_score field with default value of 0
        eco_score: 0
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
      alert("Không thể lưu mục của bạn. Vui lòng thử lại.");
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
        alert(`Ảnh ${file.name} quá lớn. Vui lòng chọn ảnh dưới 5MB.`);
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
        alert("Không thể xóa mục của bạn. Vui lòng thử lại.");
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
      const [hours, minutes] = currentTime.split(':');
      newDate.setHours(parseInt(hours, 10));
      newDate.setMinutes(parseInt(minutes, 10));
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);

      // Format the date for display
      const formattedDate = formatDate(newDate);
      setCurrentEntry({ ...currentEntry, day: formattedDate });
    } else if (editingField === 'time') {
      // Simplified logic: The input value is already in HH:MM format
      setCurrentEntry({ ...currentEntry, time: value });
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
          <h2>Không tìm thấy dữ liệu địa điểm</h2>
          <p>Vui lòng quay lại và chọn một địa điểm từ danh sách Nhật ký.</p>
          <button onClick={handleBack} className="back-button">Quay lại</button>
        </div>
        <nav className="bottom-nav">
          <button className="nav-item" onClick={() => navigate('/reward')}>
            <img src={rewardOutlineIcon} alt="Rewards" className="icon-outline" />
            <img src={rewardSolidIcon} alt="Rewards" className="icon-solid" />
            <span>Phần thưởng</span>
          </button>
          <button className="nav-item active" onClick={() => navigate('/journal')}>
            <img src={journalOutlineIcon} alt="Journal" className="icon-outline" />
            <img src={journalSolidIcon} alt="Journal" className="icon-solid" />
            <span>Nhật ký</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/home')}>
            <img src={homeOutlineIcon} alt="Home" className="icon-outline" />
            <img src={homeSolidIcon} alt="Home" className="icon-solid" />
            <span>Trang chủ</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/map')}>
            <img src={mapOutlineIcon} alt="Map" className='icon-outline' />
            <img src={mapSolidIcon} alt='Map' className='icon-solid' />
            <span>Bản đồ</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/leaderboard')}>
            <img src={leaderboardOutlineIcon} alt='Leaderboard' className='icon-outline' />
            <img src={leaderboardSolidIcon} alt='Leaderboard' className='icon-solid' />
            <span>Bảng xếp hạng</span>
          </button>
        </nav>
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
                          <span className='entry-time'>{convertTo24HourFormat(smallEntry.time)}</span>
                          <span className="entry-emotion-text"> - đang cảm thấy {emotion.labelVn}</span>
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
                <h2>Chưa có mục nhật ký nào</h2>
                <p>Hãy bắt đầu ghi lại những trải nghiệm của bạn tại {locationData.title}!</p>
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
              <span>Văn bản</span>
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
            <h2>Chỉnh sửa</h2>
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
                      // Handle both YYYY-MM-DD and "DD tháng MM, YYYY" formats
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
                    defaultValue={currentEntry.time} // Simplified defaultValue
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
                {currentEntry.content || 'Ghi chú'}
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
                <img src={addEmotionIcon} alt="Add Emotion" />
              </button>

              <button className="add-image-button" onClick={() => setShowImageOptions(true)}>
                <img src={addImgIcon} alt="Add" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emotion Picker Modal */}
      {showEmotionPicker && (
        <div className={`emotion-picker-modal ${isEmotionPickerAnimating ? 'open' : ''}`}>
          <div className="emotion-picker-content">
            <h3>Chọn Cảm xúc của bạn</h3>
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
                  <span className="emotion-label">{emotion.labelVn}</span>
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
            <h3>Thêm ảnh</h3>
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
                <span>Chụp ảnh</span>
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
                <span>Chọn từ Thư viện</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Image Delete Confirmation Modal */}
      {showImageDeleteModal && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h3>Xóa ảnh</h3>
            <p>Bạn có chắc chắn muốn xóa ảnh này không?</p>
            <div className="delete-modal-buttons">
              <button className="cancel-button" onClick={cancelImageDelete}>Hủy</button>
              <button className="confirm-button" onClick={confirmImageDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Entry Delete Confirmation Modal */}
      {showEntryDeleteModal && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h3>Xóa mục</h3>
            <p>Bạn có chắc chắn muốn xóa mục nhật ký này không?</p>
            <div className="delete-modal-buttons">
              <button className="cancel-button" onClick={cancelEntryDelete}>Hủy</button>
              <button className="confirm-button" onClick={confirmEntryDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar - Added to all views */}
      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/reward')}>
          <img src={rewardOutlineIcon} alt="Rewards" className="icon-outline" />
          <img src={rewardSolidIcon} alt="Rewards" className="icon-solid" />
          <span>Phần thưởng</span>
        </button>
        <button className="nav-item active" onClick={() => navigate('/journal')}>
          <img src={journalOutlineIcon} alt="Journal" className="icon-outline" />
          <img src={journalSolidIcon} alt="Journal" className="icon-solid" />
          <span>Nhật ký</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/home')}>
          <img src={homeOutlineIcon} alt="Home" className="icon-outline" />
          <img src={homeSolidIcon} alt="Home" className="icon-solid" />
          <span>Trang chủ</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/map')}>
          <img src={mapOutlineIcon} alt="Map" className='icon-outline' />
          <img src={mapSolidIcon} alt='Map' className='icon-solid' />
          <span>Bản đồ</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/leaderboard')}>
          <img src={leaderboardOutlineIcon} alt='Leaderboard' className='icon-outline' />
          <img src={leaderboardSolidIcon} alt='Leaderboard' className='icon-solid' />
          <span>Bảng xếp hạng</span>
        </button>
      </nav>
    </div>
  );
}