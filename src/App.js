import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterArea, setFilterArea] = useState('');
  const [areas, setAreas] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now());
  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true);
        // Use our proxy server endpoint instead of the direct API
        const response = await axios.get('/api/cameras');
        setCameras(response.data);
        
        // Extract unique areas for filtering
        const uniqueAreas = [...new Set(response.data.map(camera => camera.area))];
        setAreas(uniqueAreas.sort());
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch webcam data. Please try again later.');
        setLoading(false);
        console.error('Error fetching webcam data:', err);
      }
    };

    fetchCameras();
  }, []);

  // Filter cameras by area if a filter is selected
  const filteredCameras = filterArea 
    ? cameras.filter(camera => camera.area === filterArea) 
    : cameras;
    
  // Handle opening the modal with a selected camera
  const openModal = (camera) => {
    setSelectedCamera(camera);
    setModalOpen(true);
    
    // Start auto-refresh interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = setInterval(() => {
      setTimestamp(Date.now());
    }, 1000); // Refresh every second
  };
  
  // Handle closing the modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedCamera(null);
    
    // Clear the refresh interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };
  
  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  if (loading) {
    return <div className="loading">Loading webcams...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app">
      <header>
        <h1>NYC Traffic Webcams</h1>
        <div className="filter-container">
          <label htmlFor="area-filter">Filter by area: </label>
          <select 
            id="area-filter" 
            value={filterArea} 
            onChange={(e) => setFilterArea(e.target.value)}
          >
            <option value="">All Areas</option>
            {areas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
      </header>
      
      <div className="stats">
        <p>Showing {filteredCameras.length} webcams {filterArea ? `in ${filterArea}` : 'across NYC'}</p>
      </div>
      
      <div className="webcam-grid">
        {filteredCameras.map(camera => (
          <div key={camera.id} className="webcam-card">
            <div className="webcam-image">
              <img 
                // Use our proxy server for the image URLs
                src={`/api/cameras/${camera.id}/image`}
                alt={camera.name} 
                loading="lazy" 
                onClick={() => openModal(camera)}
                className="clickable-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Unavailable';
                }}
              />
            </div>
            <div className="webcam-info">
              <h3>{camera.name}</h3>
              <p className="area-tag">{camera.area}</p>
              <p className="status">Status: {camera.isOnline === "true" ? "Online" : "Offline"}</p>
            </div>
          </div>
        ))}
      </div>
      
      <footer>
        <p>Data provided by NYC Department of Transportation</p>
      </footer>
      
      {/* Modal for displaying larger webcam images */}
      {modalOpen && selectedCamera && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>{selectedCamera.name}</h2>
            <p className="modal-area">{selectedCamera.area}</p>
            <div className="modal-image-container">
              <img 
                src={`/api/cameras/${selectedCamera.id}/image?t=${timestamp}`}
                alt={selectedCamera.name}
                className="modal-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x600?text=Image+Unavailable';
                }}
              />
            </div>
            <p className="refresh-note">Image refreshes automatically every second</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
