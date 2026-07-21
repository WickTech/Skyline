import React from 'react';
import ReactDOM from 'react-dom/client';
// Self-hosted fonts — bundled with the app so they're same-origin and available
// at first paint. Avoids the Google Fonts round-trip that caused a font swap
// (flash of unstyled text) a few seconds after load.
// Manrope carries the UI; IBM Plex Mono is used for labels and readouts.
import '@fontsource/manrope/200.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
