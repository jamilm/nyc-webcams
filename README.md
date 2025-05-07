# NYC Webcams Grid Display

A React application that displays a grid of NYC traffic webcams from the NYC Department of Transportation API.

## Features

- Displays all webcams in a responsive grid layout
- Filter webcams by area (Manhattan, Brooklyn, Queens, Bronx, Staten Island)
- Lazy loading of images for better performance
- Fallback image handling for unavailable webcams
- Responsive design for all device sizes

## Technical Details

This application fetches data from the NYC Department of Transportation webcams API at `https://webcams.nyctmc.org/api/cameras/`. Each webcam has an image URL that provides the most recent image from that location.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Build for Production

To build the app for production:

```
npm run build
```

This creates an optimized production build in the `build` folder.

## Data Source

All webcam data is provided by the NYC Department of Transportation through their public API.
