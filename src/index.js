import React from 'react';
import ReactDOM from 'react-dom/client';
// Self-hosted Inter — bundled with the app so it's same-origin and available at
// first paint. Avoids the Google Fonts round-trip that caused a font swap
// (flash of unstyled text) a few seconds after load.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
