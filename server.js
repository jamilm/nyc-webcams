const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Proxy endpoint for the NYC webcams API
app.get('/api/cameras', async (req, res) => {
  try {
    const response = await axios.get('https://webcams.nyctmc.org/api/cameras/');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching webcam data:', error);
    res.status(500).json({ message: 'Failed to fetch webcam data' });
  }
});

// Proxy endpoint for individual camera images
app.get('/api/cameras/:id/image', async (req, res) => {
  try {
    const response = await axios.get(`https://webcams.nyctmc.org/api/cameras/${req.params.id}/image`, {
      responseType: 'arraybuffer'
    });
    
    // Set the content type to match the image
    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching camera image:', error);
    res.status(500).json({ message: 'Failed to fetch camera image' });
  }
});

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'build')));

// Handle any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
