import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Spy from './Spy';

const root = ReactDOM.createRoot(document.getElementById('spy-root'));
root.render(
  <React.StrictMode>
    <Spy />
  </React.StrictMode>
);
