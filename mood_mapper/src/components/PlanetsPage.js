import React, { useState } from 'react';
import './PlanetsPage.css';

const PlanetsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    photos: []
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    setIsModalOpen(false);
  };

  return (
    <div className="planets-page">
      <div className="planets-container">
        <div className="orbit orbit-1">
          <div className="planet planet-1"></div>
        </div>
        <div className="orbit orbit-2">
          <div className="planet planet-2"></div>
        </div>
        <div className="orbit orbit-3">
          <div className="planet planet-3"></div>
        </div>
        <div className="orbit orbit-4">
          <div className="planet planet-4"></div>
        </div>
        <div className="orbit orbit-5">
          <div className="planet planet-5"></div>
        </div>
        <div className="orbit orbit-6">
          <div className="planet planet-6"></div>
        </div>
        <div className="orbit orbit-7">
          <div className="planet planet-7"></div>
        </div>
        <div className="orbit orbit-8">
          <div className="planet planet-8"></div>
        </div>
      </div>
      
      <button 
        className="new-journey-btn"
        onClick={() => setIsModalOpen(true)}
      >
        New Journey
      </button>

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
                <label htmlFor="photos">Upload Photos</label>
                <input
                  type="file"
                  id="photos"
                  name="photos"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                />
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
    </div>
  );
};

export default PlanetsPage; 