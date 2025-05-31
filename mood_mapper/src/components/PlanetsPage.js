import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import './PlanetsPage.css';
import { addJourney, getAllJourneys, getJourney, updateJourney, deleteJourney } from '../db';
import SummaryButton from './SummaryButton';
import { FaCamera, FaTimes, FaPen, FaTrash } from 'react-icons/fa';

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

  const loadJourneys = async () => {
    const loadedJourneys = await getAllJourneys();
    setJourneys(loadedJourneys);
  };

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

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setFormData(prev => ({ ...prev, photos: files }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await addJourney(formData);
    await loadJourneys();
    setFormData({ title: '', description: '', photos: [] });
    setIsPanelOpen(false);
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
    await updateJourney(viewPanelJourney.id, formData);
    await loadJourneys();
    setViewPanelJourney(await getJourney(viewPanelJourney.id));
    setViewPanelMode('view');
    setIsEditMode(false);
    setFormData({ title: '', description: '', photos: [] });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this journey?')) {
      await deleteJourney(viewPanelJourney.id);
      await loadJourneys();
      setIsViewPanelOpen(false);
    }
  };

  const getPlanetClass = (index) => {
    const classes = [
      'planet-1', 'planet-2', 'planet-3', 'planet-4',
      'planet-5', 'planet-6', 'planet-7', 'planet-8'
    ];
    return classes[index % classes.length];
  };

  const getPlanetPosition = (index) => {
    const positions = [
      'top-20 left-20', 'top-30 right-25', 'bottom-25 left-15',
      'top-40 right-15', 'bottom-30 right-20', 'top-25 left-30',
      'bottom-20 right-30', 'top-35 left-25'
    ];
    return positions[index % positions.length];
  };

  const getAllJourneyPhotos = () => {
    console.log('Getting all journey photos from journeys:', journeys);
    const photos = journeys.reduce((photos, journey) => {
      if (journey.photos && Array.isArray(journey.photos)) {
        // Convert File objects to URLs if needed
        const journeyPhotos = journey.photos.map(photo => {
          if (photo instanceof File) {
            return URL.createObjectURL(photo);
          }
          return photo;
        });
        return [...photos, ...journeyPhotos];
      }
      return photos;
    }, []);
    console.log('Collected photos:', photos);
    return photos;
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

  return (
    <div className="planets-page">
      <div className="planets-container">
        {journeys.map((journey, index) => (
          <div
            key={journey.id}
            className={`planet ${getPlanetClass(index)} ${getPlanetPosition(index)}`}
            onClick={e => handlePlanetClick(journey, e)}
            style={{ position: 'absolute' }}
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
        ))}
        {/* Bottom center button row, center-aligned vertically */}
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
              planets={journeys.map(journey => ({
                title: journey.title,
                color: getPlanetClass(journeys.indexOf(journey))
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
            bottom: '140px', // Increased from 100px to 140px for more spacing
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
            onClick={() => { setIsPanelOpen(false); setFormData({ title: '', description: '', photos: [] }); }}
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
          <div className="panel-photo-row">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="panel-photo-box" onClick={i === 0 ? handlePhotoClick : undefined}>
                {formData.photos[i] ? (
                  <img src={URL.createObjectURL(formData.photos[i])} alt="preview" />
                ) : i === 0 ? (
                  <FaCamera className="panel-camera-icon" />
                ) : null}
              </div>
            ))}
            <input
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
          <button type="submit" className="new-journey-btn panel-save-btn" style={{ margin: '0 auto', marginTop: '1.2rem', display: 'block', minWidth: 120, pointerEvents: 'auto' }}>Save</button>
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
                  <div className="panel-photo-row">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="panel-photo-box" onClick={i === 0 ? handlePhotoClick : undefined}>
                        {formData.photos[i] ? (
                          <img src={URL.createObjectURL(formData.photos[i])} alt="preview" />
                        ) : i === 0 ? (
                          <FaCamera className="panel-camera-icon" />
                        ) : null}
                      </div>
                    ))}
                    <input
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
                  <div className="panel-title-input" style={{ marginBottom: '1.2rem', border: 'none', background: 'none', color: '#fff', fontWeight: 600, fontSize: '1.25rem', cursor: 'default' }}>{viewPanelJourney.title}</div>
                  <div className="panel-photo-row">
                    {viewPanelJourney.photos && viewPanelJourney.photos.length > 0 ? (
                      viewPanelJourney.photos.slice(0, 4).map((photo, i) => (
                        <div key={i} className="panel-photo-box">
                          <img src={URL.createObjectURL(photo)} alt={`Journey photo ${i + 1}`} />
                        </div>
                      ))
                    ) : (
                      [0, 1, 2, 3].map(i => (
                        <div key={i} className="panel-photo-box" style={{ background: 'rgba(255,255,255,0.05)' }} />
                      ))
                    )}
                  </div>
                  <div className="panel-description-input" style={{ minHeight: 80, color: '#fff', background: 'none', border: 'none', marginBottom: '1.3rem', cursor: 'default' }}>{viewPanelJourney.description}</div>
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