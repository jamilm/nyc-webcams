import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterArea, setFilterArea] = useState('');
  const [areas, setAreas] = useState([]);

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
    </div>
  );
}

export default App;
