import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App';
import './index.css';

// Import service worker update handler
import { registerSW } from 'virtual:pwa-register';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Register service worker with update handling
const updateSW = registerSW({
  onNeedRefresh() {
    // Show update prompt to user
    if (confirm('A new version of Dumu Waks is available. Update now?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    // App is ready to work offline
    console.log('App is ready to work offline');
  },
  onRegistered(registration: ServiceWorkerRegistration | undefined) {
    // Periodically check for updates (every hour)
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    }
  },
  onRegisterError(error: unknown) {
    console.error('Service worker registration error:', error);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
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
