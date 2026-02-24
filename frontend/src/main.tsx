import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

/**
 * Service Worker Registration
 * Registers the PWA service worker for offline functionality,
 * caching, and push notifications support.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log(
          '[PWA] Service Worker registered successfully:',
          registration.scope
        );

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // New version available, notify user
                console.log(
                  '[PWA] New version available. Refresh to update.'
                );
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.error(
          '[PWA] Service Worker registration failed:',
          registrationError
        );
      });
  });
}
