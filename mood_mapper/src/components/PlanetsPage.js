import React, { useState, useRef, useEffect } from 'react';
import './PlanetsPage.css';
import { addJourney, getAllJourneys, getJourney, updateJourney, deleteJourney } from '../db';

const PlanetsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    photos: []
  });
  const [journeys, setJourneys] = useState([]);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadJourneys();
  }, []);

  const loadJourneys = async () => {
    const loadedJourneys = await getAllJourneys();
    setJourneys(loadedJourneys);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = await addJourney(formData);
    await loadJourneys();
    setFormData({
      title: '',
      description: '',
      photos: []
    });
    setIsModalOpen(false);
  };

  const handlePlanetClick = async (journey) => {
    setSelectedJourney(journey);
    setIsViewModalOpen(true);
    setIsEditMode(false);
  };

  const handleEdit = () => {
    setFormData({
      title: selectedJourney.title,
      description: selectedJourney.description,
      photos: selectedJourney.photos || []
    });
    setIsEditMode(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateJourney(selectedJourney.id, formData);
    await loadJourneys();
    setSelectedJourney(await getJourney(selectedJourney.id));
    setIsEditMode(false);
    setFormData({
      title: '',
      description: '',
      photos: []
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this journey?')) {
      await deleteJourney(selectedJourney.id);
      await loadJourneys();
      setIsViewModalOpen(false);
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

  return (
    <div className="planets-page">
      <div className="planets-container">
        {journeys.map((journey, index) => (
          <div
            key={journey.id}
            className={`planet ${getPlanetClass(index)} ${getPlanetPosition(index)}`}
            onClick={() => handlePlanetClick(journey)}
            data-title={journey.title}
          />
        ))}
        
        <button 
          className="new-journey-btn"
          onClick={() => setIsModalOpen(true)}
        >
          New Journey
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New Journey</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Photos</label>
                <div className="photo-upload-container">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="photo-square">
                      <img 
                        src={URL.createObjectURL(photo)} 
                        alt={`Uploaded photo ${index + 1}`}
                      />
                    </div>
                  ))}
                  <div 
                    className="photo-square plus"
                    onClick={handlePhotoClick}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    multiple
                  />
                </div>
              </div>
              
              <div className="modal-buttons">
                <button type="submit" className="submit-btn">Create</button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewModalOpen && selectedJourney && (
        <div className="modal-overlay">
          <div className="modal">
            {isEditMode ? (
              <>
                <h2>Edit Journey</h2>
                <form onSubmit={handleUpdate}>
                  <div className="form-group">
                    <label htmlFor="edit-title">Title</label>
                    <input
                      type="text"
                      id="edit-title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-description">Description</label>
                    <textarea
                      id="edit-description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Photos</label>
                    <div className="photo-upload-container">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="photo-square">
                          <img 
                            src={URL.createObjectURL(photo)} 
                            alt={`Uploaded photo ${index + 1}`}
                          />
                        </div>
                      ))}
                      <div 
                        className="photo-square plus"
                        onClick={handlePhotoClick}
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        multiple
                      />
                    </div>
                  </div>
                  
                  <div className="modal-buttons">
                    <button type="submit" className="submit-btn">Update</button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => {
                        setIsEditMode(false);
                        setFormData({
                          title: '',
                          description: '',
                          photos: []
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2>{selectedJourney.title}</h2>
                <div className="form-group">
                  <p>{selectedJourney.description}</p>
                </div>
                {selectedJourney.photos && selectedJourney.photos.length > 0 && (
                  <div className="form-group">
                    <label>Photos</label>
                    <div className="photo-upload-container">
                      {selectedJourney.photos.map((photo, index) => (
                        <div key={index} className="photo-square">
                          <img 
                            src={URL.createObjectURL(photo)} 
                            alt={`Journey photo ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="modal-buttons">
                  <button 
                    type="button" 
                    className="edit-btn"
                    onClick={handleEdit}
                  >
                    Edit
                  </button>
                  <button 
                    type="button" 
                    className="delete-btn"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanetsPage; 