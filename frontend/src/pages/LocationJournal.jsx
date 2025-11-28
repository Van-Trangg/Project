// LocationJournal.jsx
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createJournal, updateJournal, deleteJournal, getPoiJournals } from '../api/journal'; // IMPORT NEW API FUNCTION
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
import backicon from '../public/back.png';

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
  if (typeof input === 'string') {
    return emotionData.find(e => e.label.toLowerCase() === input.toLowerCase()) || emotionData[5];
  }
  if (typeof input === 'number') {
    return emotionData.find(e => e.value === input) || emotionData[5];
  }
  return emotionData[5];
};

const convertTo24HourFormat = (timeString) => {
  if (/^\d{1,2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  const [time, period] = timeString.split(' ');
  if (!time || !period) return timeString;
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
  
  // Get the POI ID from the navigation state
  const poiId = location.state?.id;

  const [locationData, setLocationData] = useState(null); // State to hold the full POI data from API
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for API call
  const [error, setError] = useState(null); // Error state for API call
  
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [editingMode, setEditingMode] = useState(false);
  const [editType, setEditType] = useState('');
  const [isEmotionPickerAnimating, setIsEmotionPickerAnimating] = useState(false);
  const [isImageOptionsAnimating, setIsImageOptionsAnimating] = useState(false);
  const [originalEntryId, setOriginalEntryId] = useState(null);
  const [currentEntry, setCurrentEntry] = useState({
    day: formatDate(new Date()),
    time: formatTime(new Date()),
    emotion: 5,
    content: '',
    images: []
  });
  const [editingField, setEditingField] = useState(null);
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const addButtonRef = useRef(null);
  const [showImageDeleteModal, setShowImageDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showEntryDeleteModal, setShowEntryDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [touchTimer, setTouchTimer] = useState(null);

  // Effect to fetch POI data and journal entries using the new API
  useEffect(() => {
    if (!poiId) {
      setError("Không tìm thấy ID địa điểm.");
      setLoading(false);
      return;
    }

    const fetchLocationData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPoiJournals(poiId);
        const fetchedData = response.data;
        setLocationData(fetchedData);
        setJournalEntries(fetchedData.entries || []);
      } catch (err) {
        console.error("Failed to fetch location journal data:", err);
        setError("Không thể tải dữ liệu cho địa điểm này. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [poiId]); // Re-fetch if the poiId changes

  // ... (rest of the helper functions like formatDate, formatTime, etc. remain the same) ...
  function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  }

  function formatTime(date) {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  function parseDate(dateString) {
  // Xử lý định dạng YYYY-MM-DD (từ API)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    // Tách chuỗi và tạo một đối tượng Date theo chuẩn UTC
    const [year, month, day] = dateString.split('-').map(Number);
    // Lưu ý: Tháng trong Date constructor bắt đầu từ 0 (0-11), nên phải trừ đi 1
    return new Date(Date.UTC(year, month - 1, day));
  }

  // Xử lý định dạng tiếng Việt "DD tháng MM, YYYY"
  const vietnameseDateRegex = /^(\d{1,2})\s+tháng\s+(\d{1,2}),\s+(\d{4})$/;
  const match = dateString.match(vietnameseDateRegex);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
    const year = parseInt(match[3], 10);
    // Cũng tạo theo UTC để nhất quán
    return new Date(Date.UTC(year, month, day));
  }

  // Fallback cho các định dạng khác
  const parts = dateString.split(' ');
  if (parts.length === 3) {
    const month = parts[0];
    const day = parts[1].replace(',', '');
    const year = parts[2];
    const date = new Date(`${month} ${day}, ${year}`);
    // Chuyển đổi sang UTC để tránh lỗi
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  }

  // Fallback cuối cùng
  return new Date(dateString);
}

  // ... (other useEffects and handlers remain the same) ...
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

  useEffect(() => {
    if (showEmotionPicker) {
      const timer = setTimeout(() => setIsEmotionPickerAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsEmotionPickerAnimating(false);
    }
  }, [showEmotionPicker]);

  useEffect(() => {
    if (showImageOptions) {
      const timer = setTimeout(() => setIsImageOptionsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsImageOptionsAnimating(false);
    }
  }, [showImageOptions]);
  
  const handleBack = () => {
    navigate(-1);
  };

  const handleAddEntry = () => {
    setShowAddOptions(!showAddOptions);
  };

  const handleAddText = () => {
    setEditType('text');
    setEditingMode(true);
    setShowAddOptions(false);
    setOriginalEntryId(null);
    setCurrentEntry({
      day: formatDate(new Date()),
      time: formatTime(new Date()),
      emotion: 5,
      content: '',
      images: []
    });
  };

  const handleAddImage = () => {
    setEditType('image');
    setEditingMode(true);
    setShowAddOptions(false);
    setOriginalEntryId(null);
    setCurrentEntry({
      day: formatDate(new Date()),
      time: formatTime(new Date()),
      emotion: 5,
      content: '',
      images: []
    });
  };

  const handleEntryClick = (day, entryIndex) => {
    const dayEntry = journalEntries.find(e => e.day === day);
    if (dayEntry && dayEntry.smallEntries[entryIndex]) {
      const entry = dayEntry.smallEntries[entryIndex];
      const emotionDataForEntry = getEmotionData(entry.emotion);
      setCurrentEntry({
        day: day,
        time: entry.time,
        emotion: emotionDataForEntry.value,
        content: entry.content,
        images: entry.images || []
      });
      setOriginalEntryId(entry.id);
      setEditingMode(true);
      setEditType(entry.images && entry.images.length > 0 ? 'image' : 'text');
    }
  };

  const handleSaveAndBack = async () => {
    if (!locationData) return;

    const emotionLabel = getEmotionData(currentEntry.emotion).label;
    try {
      const payload = {
        poi_id: locationData.id,
        emotion: emotionLabel,
        content: currentEntry.content,
        images: currentEntry.images,
        created_at: (() => {
          // Giữ nguyên hàm parseDate đã sửa ở trên
          const date = parseDate(currentEntry.day); 
          const timeStr = currentEntry.time;
          const [hours, minutes] = timeStr.split(':');
          
          // --- BẮT ĐẦU PHẦN SỬA ---
          // Sử dụng setUTCHours và setUTCMinutes để tránh lỗi timezone
          date.setUTCHours(parseInt(hours, 10));
          date.setUTCMinutes(parseInt(minutes, 10));
          date.setUTCSeconds(0);
          date.setUTCMilliseconds(0);
          // --- KẾT THÚC PHẦN SỬA ---

          return date.toISOString();
        })(),
        eco_score: 0
      };
      
      await createJournal(payload);
      
      if (originalEntryId) {
        await deleteJournal(originalEntryId);
      }

      // Làm mới dữ liệu
      const response = await getPoiJournals(locationData.id);
      const fetchedData = response.data;
      setLocationData(fetchedData);
      setJournalEntries(fetchedData.entries || []);

      // Thoát chế độ chỉnh sửa và reset form
      setEditingMode(false);
      setOriginalEntryId(null);
      setCurrentEntry({
        day: formatDate(new Date()),
        time: formatTime(new Date()),
        emotion: 5,
        content: '',
        images: []
      });

    } catch (error) {
      console.error("Failed to save journal entry:", error);
      alert("Không thể lưu mục của bạn. Vui lòng thử lại.");
    }
  };
  
  // ... (all other handlers like handleEmotionSelect, handleImageFileChange, etc., remain the same) ...
  const handleEmotionSelect = (emotion) => {
    setCurrentEntry({ ...currentEntry, emotion });
    setShowEmotionPicker(false);
  };

  const handleImageFileChange = (event) => {
    const files = event.target.files;
    if (files.length === 0) return;
    const MAX_SIZE = 5 * 1024 * 1024;
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        alert(`Ảnh ${file.name} quá lớn. Vui lòng chọn ảnh dưới 5MB.`);
        event.target.value = '';
        return;
      }
    }
    const newImageUrls = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newImageUrls.push(e.target.result);
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

  const handleImageClick = (index) => {
    setImageToDelete(index);
    setShowImageDeleteModal(true);
  };

  const confirmImageDelete = () => {
    if (imageToDelete !== null) {
      const updatedImages = [...currentEntry.images];
      updatedImages.splice(imageToDelete, 1);
      setCurrentEntry({ ...currentEntry, images: updatedImages });
      setImageToDelete(null);
      setShowImageDeleteModal(false);
    }
  };

  const cancelImageDelete = () => {
    setImageToDelete(null);
    setShowImageDeleteModal(false);
  };

  const handleEntryTouchStart = (day, index) => {
    const timer = setTimeout(() => {
      setEntryToDelete({ day, index });
      setShowEntryDeleteModal(true);
    }, 800);
    setTouchTimer(timer);
  };

  const handleEntryTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  const confirmEntryDelete = async () => {
    if (entryToDelete) {
      try {
        const { day, index } = entryToDelete;
        const dayEntry = journalEntries.find(e => e.day === day);
        if (dayEntry && dayEntry.smallEntries[index]) {
          const entryId = dayEntry.smallEntries[index].id;
          await deleteJournal(entryId);
          const updatedEntries = [...journalEntries];
          const dayEntryIndex = updatedEntries.findIndex(e => e.day === day);
          if (dayEntryIndex !== -1) {
            const updatedSmallEntries = [...updatedEntries[dayEntryIndex].smallEntries];
            updatedSmallEntries.splice(index, 1);
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
      // --- BẮT ĐẦU PHẦN SỬA ---
      // Tạo đối tượng Date theo UTC để tránh lỗi timezone
      const [year, month, day] = value.split('-').map(Number);
      const newDate = new Date(Date.UTC(year, month - 1, day));
      
      const currentTime = currentEntry.time;
      const [hours, minutes] = currentTime.split(':');
      // Cũng đặt giờ theo UTC để nhất quán
      newDate.setUTCHours(parseInt(hours, 10));
      newDate.setUTCMinutes(parseInt(minutes, 10));
      newDate.setUTCSeconds(0);
      newDate.setUTCMilliseconds(0);

      const formattedDate = formatDate(newDate);
      // --- KẾT THÚC PHẦN SỬA ---

      setCurrentEntry({ ...currentEntry, day: formattedDate });
    } else if (editingField === 'time') {
      setCurrentEntry({ ...currentEntry, time: value });
    } else {
      setCurrentEntry({ ...currentEntry, [editingField]: value });
    }
    setEditingField(null);
  };

  // --- CONDITIONAL RENDERING ---

  // 1. Show a loading message while fetching data
  if (loading) {
    return (
      <div className='location-journal-container'>
        <div className="loading-message">Đang tải dữ liệu địa điểm...</div>
        <nav className="bottom-nav">
          {/* ... (nav items) ... */}
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

  // 2. Show an error message if the API call fails or ID is missing
  if (error || !locationData) {
    return (
      <div className='location-journal-container'>
        <div className="error-message">
          <h2>{error || "Không tìm thấy dữ liệu địa điểm"}</h2>
          <p>Vui lòng quay lại và chọn một địa điểm từ danh sách Nhật ký.</p>
          <button onClick={handleBack} className="journal-back-button">Quay lại</button>
        </div>
        <nav className="bottom-nav">
          {/* ... (nav items) ... */}
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

  // ... (The rest of the JSX for Normal View, Editing Mode, and Modals remains the same) ...
  return (
    <div className='location-journal-container'>
      {!editingMode && (
        <>
          <div className='location-journal-header'>
            <button className='journal-back-button' onClick={handleBack}>
              <img src={backicon} alt="Back" />
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
                                src={image}
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

      {editingMode && !showEmotionPicker && !showImageOptions && (
        <div className="editing-mode-container">
          <div className='editing-header'>
            <button className='journal-back-button' onClick={handleSaveAndBack}>
              <img src={backicon} alt="Back" />
            </button>
            <h2>Chỉnh sửa</h2>
          </div>

          <div className="editing-content">
            <div className="editing-top-row">
              <div className="date-time-group">
                {editingField === 'day' ? (
                  <input
                    type="date"
                    className="editing-input editing-input-day"
                    autoFocus
                    onBlur={(e) => handleFieldChange(e.target.value)}
                    defaultValue={(() => {
                      const date = parseDate(currentEntry.day);
                      return date.toISOString().split('T')[0];
                    })()}
                  />
                ) : (
                  <div className="editing-field editing-field-day" onClick={handleDayEdit}>
                    {formatDate(parseDate(currentEntry.day))}
                  </div>
                )}

                {editingField === 'time' ? (
                  <input
                    type="time"
                    className="editing-input editing-input-time"
                    autoFocus
                    onBlur={(e) => handleFieldChange(e.target.value)}
                    defaultValue={currentEntry.time}
                  />
                ) : (
                  <div className="editing-field editing-field-time" onClick={handleTimeEdit}>
                    {convertTo24HourFormat(currentEntry.time)}
                  </div>
                )}
              </div>

              <div className="current-emotion-display">
                {getEmotionData(currentEntry.emotion).emoji}
              </div>
            </div>

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

            {currentEntry.images && currentEntry.images.length > 0 && (
              <div className="editing-images">
                {currentEntry.images.map((image, index) => (
                  <div key={index} className="editing-image-container">
                    <img
                      src={image}
                      alt={`Entry image ${index}`}
                      className="editing-image"
                      onClick={() => handleImageClick(index)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

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

      {showImageOptions && (
        <div className={`image-options-modal ${isImageOptionsAnimating ? 'open' : ''}`}>
          <div className="image-options-content">
            <h3>Thêm ảnh</h3>
            <div className="image-options-buttons">
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
              
              {/* Added close button */}
              <button className="image-option-button close-button" onClick={() => setShowImageOptions(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span>Đóng</span>
              </button>
            </div>
          </div>
        </div>
      )}

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