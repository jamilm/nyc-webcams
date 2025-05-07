import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Spy.css';

function Spy() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now());
  const refreshIntervalRef = useRef(null);

  // Set up auto-refresh for all images
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, 1000); // Refresh every second
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/cameras');
        setCameras(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch webcam data. Please try again later.');
        setLoading(false);
        console.error('Error fetching webcam data:', err);
      }
    };

    fetchCameras();
  }, []);

  // Handle opening the modal with a selected camera
  const openModal = (camera) => {
    setSelectedCamera(camera);
    setModalOpen(true);
    
    // Start auto-refresh interval for modal image
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
    return <div className="spy-loading">Loading...</div>;
  }

  if (error) {
    return <div className="spy-error">{error}</div>;
  }

  return (
    <div className="spy-container">
      <div className="spy-grid">
        {cameras.map(camera => (
          <div key={camera.id} className="spy-item">
            <img 
              src={`/api/cameras/${camera.id}/image?t=${timestamp}`}
              alt={camera.name}
              onClick={() => openModal(camera)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Unavailable';
              }}
            />
          </div>
        ))}
      </div>
      
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

export default Spy;
