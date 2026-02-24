import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    },
    headers: {
      'Content-Security-Policy': (
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://storage.googleapis.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; " +
        "img-src 'self' data: https: blob:; " +
        "connect-src 'self' https://api.ementech.co.ke http://localhost:5000 ws://localhost:5000 wss://localhost:5000 https://fonts.googleapis.com https://fonts.gstatic.com wss://localhost:3000 ws://localhost:3000 ws://localhost:3001 ws://localhost:3002 https://storage.googleapis.com; " +
        "media-src 'self' blob: https:; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self';"
      ),
    },
  },
  build: {
    // Generate source maps for debugging
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'ui-vendor': ['lucide-react', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
})
