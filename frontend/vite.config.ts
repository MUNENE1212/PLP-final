import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: false, // Using custom manifest.webmanifest file
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          // Bookings API - NetworkFirst for freshness with fallback
          {
            urlPattern: /^https:\/\/api\.dumuwaks\.co\.ke\/api\/v1\/bookings.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'bookings-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Technicians API - StaleWhileRevalidate for performance
          {
            urlPattern: /^https:\/\/api\.dumuwaks\.co\.ke\/api\/v1\/technicians.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'technicians-api',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 2 // 2 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Posts/Social API - StaleWhileRevalidate for fast loading
          {
            urlPattern: /^https:\/\/api\.dumuwaks\.co\.ke\/api\/v1\/posts.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'posts-api',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 30 // 30 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Messages API - NetworkFirst for real-time communication
          {
            urlPattern: /^https:\/\/api\.dumuwaks\.co\.ke\/api\/v1\/messages.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'messages-api',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // All other API calls - NetworkFirst with timeout
          {
            urlPattern: /^https:\/\/api\.dumuwaks\.co\.ke\/api/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Images - CacheFirst for long-term storage
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Google Fonts - CacheFirst for very long-term storage
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Google Fonts static - CacheFirst
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
