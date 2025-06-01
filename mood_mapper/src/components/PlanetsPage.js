import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import './PlanetsPage.css';
import { addJourney, getAllJourneys, getJourney, updateJourney, deleteJourney } from '../db';
import SummaryButton from './SummaryButton';
import { FaCamera, FaTimes, FaPen, FaTrash, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleError } from '../utils/errorHandling';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const MAX_PHOTOS = 20;

const PlanetsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    photos: []
  });
  const [journeys, setJourneys] = useState([]);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const fileInputRef = useRef(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const [isViewPanelOpen, setIsViewPanelOpen] = useState(false);
  const [viewPanelMode, setViewPanelMode] = useState('view'); // 'view' or 'edit'
  const [viewPanelJourney, setViewPanelJourney] = useState(null);
  const viewPanelRef = useRef(null);
  const [detailPanelPos, setDetailPanelPos] = useState({ top: 0, left: 0 });
  const detailPanelRef = useRef(null);
  const [panelPos, setPanelPos] = useState({ left: '50%', bottom: 120 });
  const [pendingPanelAlign, setPendingPanelAlign] = useState(false);
  const [error, setError] = useState('');

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadJourneys();
    createStars();
    // Close panel on outside click
    const handleClickOutside = (e) => {
      if (isPanelOpen && panelRef.current && !panelRef.current.contains(e.target) && !buttonRef.current.contains(e.target)) {
        setIsPanelOpen(false);
        setFormData({ title: '', description: '', photos: [] });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPanelOpen]);

  useEffect(() => {
    // Close view panel on outside click
    const handleClickOutside = (e) => {
      if (isViewPanelOpen && viewPanelRef.current && !viewPanelRef.current.contains(e.target)) {
        setIsViewPanelOpen(false);
        setViewPanelMode('view');
        setViewPanelJourney(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isViewPanelOpen]);

  useEffect(() => {
    // Log authentication state
    console.log('Current user:', currentUser);
    if (currentUser) {
      console.log('User ID:', currentUser.uid);
      console.log('User email:', currentUser.email);
    } else {
      console.log('No user logged in');
    }
  }, [currentUser]);

  const getJourney = async (journeyId) => {
    try {
      const journeyRef = doc(db, 'journeys', journeyId);
      const journeyDoc = await getDoc(journeyRef);
      if (journeyDoc.exists()) {
        return { id: journeyDoc.id, ...journeyDoc.data() };
      }
      throw new Error('Journey not found');
    } catch (error) {
      handleError(error, setError);
      return null;
    }
  };

  const loadJourneys = async () => {
    try {
      if (!currentUser) {
        console.log('No user logged in, skipping journey load');
        return;
      }

      console.log('Loading journeys for user:', currentUser.uid);
      setError('');
      
      // Query journeys for current user
      const journeysRef = collection(db, 'journeys');
      const q = query(journeysRef, where('userId', '==', currentUser.uid));
      
      try {
        const querySnapshot = await getDocs(q);
        const loadedJourneys = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Loaded journeys:', loadedJourneys);
        setJourneys(loadedJourneys);
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        throw new Error('Failed to load journeys. Please check your internet connection and try again.');
      }
    } catch (error) {
      console.error('Error loading journeys:', error);
      setError('Error loading journeys. Please refresh the page.');
    }
  };

  // Add debug logging for journeys state
  useEffect(() => {
    console.log('Current journeys state:', journeys);
  }, [journeys]);

  // Load journeys when component mounts and when user changes
  useEffect(() => {
    if (currentUser) {
      loadJourneys();
    }
  }, [currentUser]);

  const createStars = () => {
    const starsContainer = document.querySelector('.planets-page');
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      starsContainer.appendChild(star);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getImageUrl = (photo) => {
    if (!photo) return null;
    // If it's a base64 string (starts with data:)
    if (typeof photo === 'string' && photo.startsWith('data:')) {
      return photo;
    }
    // If it's a File object
    if (photo instanceof File) {
      return URL.createObjectURL(photo);
    }
    // If it's a URL string
    if (typeof photo === 'string') {
      return photo;
    }
    return null;
  };

  const getAllJourneyPhotos = () => {
    if (!journeys || journeys.length === 0) return [];
    
    const photos = journeys.reduce((photos, journey) => {
      if (journey.photos && Array.isArray(journey.photos)) {
        return [...photos, ...journey.photos];
      }
      return photos;
    }, []);
    
    return photos;
  };

  const compressImage = async (base64String) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG with 0.7 quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
    });
  };

  const handlePhotoClick = (index) => {
    if (fileInputRef.current) {
      fileInputRef.current.dataset.index = index;
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Get the index of the clicked photo box
    const index = parseInt(e.target.dataset.index) || 0;

    // Convert files to base64 strings and compress
    const processFiles = async () => {
      try {
        const processedFiles = await Promise.all(
          files.map(async file => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = async () => {
                try {
                  const compressedImage = await compressImage(reader.result);
                  resolve(compressedImage);
                } catch (error) {
                  reject(error);
                }
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          })
        );
        
        // Update photos array, preserving existing photos
        setFormData(prev => {
          const newPhotos = [...(prev.photos || [])];
          // Insert new photos at the clicked index
          processedFiles.forEach((photo, i) => {
            if (index + i < MAX_PHOTOS) { // Ensure we don't exceed max photos
              newPhotos[index + i] = photo;
            }
          });
          return { ...prev, photos: newPhotos };
        });
      } catch (error) {
        console.error('Error processing files:', error);
        setError('Error processing photos. Please try again.');
      }
    };
    processFiles();
  };

  const renderPhotoRows = (photos = []) => {
    const rows = [];
    const totalPhotos = photos.length;
    const totalRows = Math.ceil(Math.max(1, totalPhotos + 1) / 4);

    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      const rowPhotos = [];
      const startIndex = rowIndex * 4;
      const isLastRow = rowIndex === totalRows - 1;
      const hasPhotosInRow = totalPhotos > startIndex;

      // Add photo boxes for this row
      for (let i = 0; i < 4; i++) {
        const photoIndex = startIndex + i;
        const hasPhoto = photoIndex < totalPhotos;
        const showCamera = !hasPhoto && 
          (isLastRow || (hasPhotosInRow && photoIndex === totalPhotos));

        rowPhotos.push(
          <div 
            key={photoIndex}
            className="panel-photo-box" 
            onClick={() => showCamera && handlePhotoClick(photoIndex)}
          >
            {hasPhoto ? (
              <img src={photos[photoIndex]} alt={`Photo ${photoIndex + 1}`} />
            ) : showCamera ? (
              <FaCamera className="panel-camera-icon" />
            ) : null}
          </div>
        );
      }

      rows.push(
        <div key={rowIndex} className="panel-photo-row">
          {rowPhotos}
        </div>
      );
    }

    return rows;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      
      // Check authentication
      if (!currentUser) {
        throw new Error('You must be logged in to create a journey');
      }

      console.log('Attempting to save journey for user:', currentUser.uid);

      // Validate form data
      if (!formData.title.trim()) {
        throw new Error('Please enter a title');
      }
      if (!formData.description.trim()) {
        throw new Error('Please enter a description');
      }

      // Add journey to Firestore
      const journeyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        photos: formData.photos || [],
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      };
      
      console.log('Saving journey data:', journeyData);
      
      try {
        const docRef = await addDoc(collection(db, 'journeys'), journeyData);
        console.log('Journey saved with ID:', docRef.id);
        
        // Reset form and close panel first
        setFormData({ title: '', description: '', photos: [] });
        setIsPanelOpen(false);
        
        // Then reload journeys
        await loadJourneys();
      } catch (firestoreError) {
        console.error('Firestore error details:', {
          code: firestoreError.code,
          message: firestoreError.message,
          stack: firestoreError.stack
        });
        throw new Error('Failed to save journey. Please check your internet connection and try again.');
      }
    } catch (error) {
      console.error('Error saving journey:', error);
      setError(error.message || 'An error occurred while saving the journey. Please try again.');
    }
  };

  const handlePlanetClick = async (journey, e) => {
    setViewPanelJourney(journey);
    setIsViewPanelOpen(true);
    setViewPanelMode('view');
    setIsEditMode(false);
    // Position detail panel next to planet, but keep it in viewport
    const rect = e.currentTarget.getBoundingClientRect();
    const panelWidth = 380;
    const panelHeight = 420;
    const padding = 24;
    let left = rect.right + padding;
    let top = rect.top + rect.height / 2;
    // If panel would overflow right, show to the left
    if (left + panelWidth > window.innerWidth) {
      left = rect.left - panelWidth - padding;
    }
    // If panel would overflow left, clamp to 0
    if (left < 0) left = padding;
    // If panel would overflow bottom, adjust up
    let panelTop = top - panelHeight / 2;
    if (panelTop + panelHeight > window.innerHeight) {
      panelTop = window.innerHeight - panelHeight - padding;
    }
    if (panelTop < 0) panelTop = padding;
    setDetailPanelPos({ top: panelTop, left });
  };

  const handleEdit = () => {
    setFormData({
      title: viewPanelJourney.title,
      description: viewPanelJourney.description,
      photos: viewPanelJourney.photos || []
    });
    setViewPanelMode('edit');
    setIsEditMode(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setError('');
      // Update journey in Firestore
      const journeyRef = doc(db, 'journeys', viewPanelJourney.id);
      await updateDoc(journeyRef, formData);
      await loadJourneys();
      const updatedJourney = await getJourney(viewPanelJourney.id);
      if (updatedJourney) {
        setViewPanelJourney(updatedJourney);
      }
      setViewPanelMode('view');
      setIsEditMode(false);
      setFormData({ title: '', description: '', photos: [] });
    } catch (error) {
      handleError(error, setError);
    }
  };

  const handleDelete = async () => {
    try {
      setError('');
      // Delete journey from Firestore
      await deleteDoc(doc(db, 'journeys', viewPanelJourney.id));
      await loadJourneys();
      setIsViewPanelOpen(false);
    } catch (error) {
      handleError(error, setError);
    }
  };

  const getPlanetClass = (journeyId) => {
    const classes = [
      'planet-1', 'planet-2', 'planet-3', 'planet-4',
      'planet-5', 'planet-6', 'planet-7', 'planet-8'
    ];
    // Use journey ID to determine planet class
    const hash = journeyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return classes[hash % classes.length];
  };

  const getPlanetImage = (journeyId) => {
    // Use journey ID to determine planet image
    const hash = journeyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const planetNumber = (hash % 8) + 1;
    return `/p${planetNumber}.png`;
  };

  const getPlanetPosition = (journeyId) => {
    // Use journey ID to generate a consistent position
    const hash = journeyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Define position combinations that ensure good spacing
    const positions = [
      // Top section
      'top-15 left-10',
      'top-20 right-15',
      'top-25 left-25',
      'top-30 right-30',
      'top-35 left-40',
      'top-40 right-45',
      
      // Middle section
      'top-45 left-15',
      'top-50 right-20',
      'top-55 left-35',
      'top-60 right-40',
      
      // Bottom section
      'bottom-35 left-15',
      'bottom-30 right-25',
      'bottom-25 left-35',
      'bottom-20 right-45',
      'bottom-15 left-20',
      'bottom-10 right-30'
    ];
    
    // Use hash to select position, with more variation
    const positionIndex = (hash * 7) % positions.length; // Multiply by prime number for better distribution
    return positions[positionIndex];
  };

  const openNewJourneyPanel = () => {
    setIsPanelOpen(true);
  };

  useLayoutEffect(() => {
    if (isPanelOpen && pendingPanelAlign && buttonRef.current && panelRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const panelWidth = panelRef.current.offsetWidth || 380;
      const buttonCenter = rect.left + rect.width / 2;
      setPanelPos({
        left: buttonCenter - panelWidth / 2,
        bottom: window.innerHeight - rect.top + 10 // 10px gap above button
      });
      setPendingPanelAlign(false);
    }
  }, [isPanelOpen, pendingPanelAlign]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to log out');
    }
  };

  return (
    <div className="planets-page">
      {error && (
        <div className="error-banner">
          {error}
          <button 
            className="error-close-btn"
            onClick={() => setError('')}
          >
            ×
          </button>
        </div>
      )}
      <div className="planets-container">
        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          Logout
        </button>
        {journeys && journeys.length > 0 ? (
          journeys.map((journey) => (
            <div
              key={journey.id}
              className={`planet ${getPlanetClass(journey.id)} ${getPlanetPosition(journey.id)}`}
              onClick={e => handlePlanetClick(journey, e)}
              onMouseEnter={e => {
                const label = e.currentTarget.querySelector('.planet-label');
                if (label) label.classList.add('show');
              }}
              onMouseLeave={e => {
                const label = e.currentTarget.querySelector('.planet-label');
                if (label) label.classList.remove('show');
              }}
            >
              <div className="planet-label">{journey.title}</div>
            </div>
          ))
        ) : (
          <div className="no-journeys-message">
            No journeys yet. Click "New Journey" to create one!
          </div>
        )}
        {/* Bottom center button row */}
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 40, zIndex: 30, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '32px', pointerEvents: 'none', height: 60 }}>
          <button
            ref={buttonRef}
            className="new-journey-btn"
            onClick={openNewJourneyPanel}
            style={{
              whiteSpace: 'nowrap',
              pointerEvents: isPanelOpen ? 'none' : 'auto',
              alignSelf: 'center',
              opacity: isPanelOpen ? 0.5 : 1,
              cursor: isPanelOpen ? 'not-allowed' : 'pointer'
            }}
          >
            New Journey
          </button>
          <div style={{ alignSelf: 'center', pointerEvents: 'auto' }}>
            <SummaryButton
              planets={journeys.map((journey) => ({
                title: journey.title,
                class: getPlanetClass(journey.id)
              }))}
              journeyPhotos={getAllJourneyPhotos()}
            />
          </div>
        </div>
        {/* Expanding panel, centered horizontally, bottom aligned with button */}
        <form
          ref={panelRef}
          className={`new-journey-panel${isPanelOpen ? ' open' : ''}`}
          style={{
            display: isPanelOpen ? 'flex' : 'none',
            position: 'fixed',
            left: '50%',
            bottom: '140px',
            transform: 'translateX(-50%)',
            pointerEvents: isPanelOpen ? 'auto' : 'none',
            zIndex: 40
          }}
          onSubmit={handleSave}
          tabIndex={-1}
        >
          <button
            type="button"
            className="close-panel-btn"
            onClick={() => { 
              setIsPanelOpen(false); 
              setFormData({ title: '', description: '', photos: [] }); 
            }}
            aria-label="Close"
          >
            <FaTimes />
          </button>
          <input
            className="panel-title-input"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="| Trip title"
            autoFocus
            required
          />
          <div className="panel-photo-grid">
            {renderPhotoRows(formData.photos)}
            <input
              key={fileInputKey}
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              multiple
            />
          </div>
          <textarea
            className="panel-description-input"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="| What happened during the trip..."
            required
          />
          <button 
            type="submit" 
            className="new-journey-btn panel-save-btn" 
            style={{ margin: '0 auto', marginTop: '1.2rem', display: 'block', minWidth: 120, pointerEvents: 'auto' }}
          >
            Save
          </button>
        </form>
        {/* View/Edit panel for existing journey, next to planet, never overflows */}
        {isViewPanelOpen && viewPanelJourney && (
          <div ref={detailPanelRef} style={{ position: 'fixed', top: detailPanelPos.top, left: detailPanelPos.left, zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'auto', transform: 'translateY(0)' }}>
            <form
              ref={viewPanelRef}
              className={`new-journey-panel open`}
              style={{ minWidth: 340, width: 380, maxWidth: '90vw', pointerEvents: 'auto' }}
              onSubmit={viewPanelMode === 'edit' ? handleUpdate : e => e.preventDefault()}
              tabIndex={-1}
            >
              <button
                type="button"
                className="close-panel-btn"
                onClick={() => { setIsViewPanelOpen(false); setViewPanelMode('view'); setViewPanelJourney(null); }}
                aria-label="Close"
              >
                <FaTimes />
              </button>
              {viewPanelMode === 'edit' ? (
                <>
                  <input
                    className="panel-title-input"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="| Trip title"
                    autoFocus
                    required
                  />
                  <div className="panel-photo-grid">
                    {renderPhotoRows(formData.photos)}
                    <input
                      key={fileInputKey}
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      multiple
                    />
                  </div>
                  <textarea
                    className="panel-description-input"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="| What happened during the trip..."
                    required
                  />
                  <button type="submit" className="new-journey-btn panel-save-btn" style={{ margin: '0 auto', marginTop: '1.2rem', display: 'block', minWidth: 120, pointerEvents: 'auto' }}>Update</button>
                </>
              ) : (
                <>
                  <div className="panel-title-view">{viewPanelJourney.title}</div>
                  <div className="panel-photo-grid">
                    {viewPanelMode === 'edit' ? (
                      renderPhotoRows(formData.photos)
                    ) : (
                      <div className="panel-photo-row">
                        {viewPanelJourney.photos && viewPanelJourney.photos.length > 0 ? (
                          viewPanelJourney.photos.slice(0, 4).map((photo, i) => (
                            <div key={i} className="panel-photo-box">
                              <img src={getImageUrl(photo)} alt={`Journey photo ${i + 1}`} />
                            </div>
                          ))
                        ) : (
                          [0, 1, 2, 3].map(i => (
                            <div key={i} className="panel-photo-box" style={{ background: 'rgba(255,255,255,0.05)' }} />
                          ))
                        )}
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      multiple
                    />
                  </div>
                  <div className="panel-description-view">{viewPanelJourney.description}</div>
                  <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.2rem' }}>
                    <button type="button" className="icon-cosmic-btn" onClick={handleEdit} aria-label="Edit"><FaPen /></button>
                    <button type="button" className="icon-cosmic-btn" onClick={handleDelete} aria-label="Delete"><FaTrash /></button>
                  </div>
                </>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanetsPage; 