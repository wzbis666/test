import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

// Hide splash screen
const splash = document.getElementById('splash');
if (splash) {
  // Wait for React to render, then fade out
  setTimeout(() => splash.classList.add('hide'), 400);
  setTimeout(() => splash.remove(), 800);
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
