# PWA Quick Reference Guide

## For Dumu Waks Developers

### What's New in Phase 2

The app is now a **Progressive Web App (PWA)** with:
- 📱 Installable on iOS, Android, and Desktop
- 📴 Works offline with cached content
- 🔄 Background sync for bookings/messages
- ⚡ Fast loading with intelligent caching
- 🔔 Ready for push notifications (setup complete)

---

## Quick Testing Guide

### 1. Test Service Worker
```
1. npm run dev
2. Open Chrome DevTools > Application > Service Workers
3. Verify "Status: activated and running"
```

### 2. Test Offline Mode
```
1. Browse the app for 30 seconds
2. DevTools > Network > Throttling > Offline
3. Refresh page
4. App should still load (cached)
```

### 3. Test Install Prompt (Desktop Chrome)
```
1. Clear browser data for localhost
2. Reload page
3. Look for install icon in address bar (⊞ or +)
4. Click install
5. App opens in standalone window
```

### 4. Test Install Prompt (Mobile)
**Android (Chrome):**
```
1. Open app in Chrome
2. Wait for install banner (may take a few minutes)
3. Tap "Install"
4. Check home screen for app icon
```

**iOS (Safari):**
```
1. Open app in Safari
2. Tap Share button (□↑)
3. Scroll to "Add to Home Screen"
4. Tap "Add"
5. Check home screen for app icon
```

---

## Common Development Tasks

### Add Offline Support to a Page

```typescript
// Wrap API calls in offline-aware helper
import { queueIfOffline } from '@/lib/backgroundSync';

// In your component
const handleSubmit = async () => {
  await queueIfOffline(
    // Action to try if online
    async () => await api.createBooking(data),
    // Fallback data for offline queue
    {
      type: 'booking',
      data: { token: userToken, payload: data }
    }
  );
};
```

### Check Network Status

```typescript
import { isOnline } from '@/lib/backgroundSync';

if (isOnline()) {
  // User is online - fetch fresh data
} else {
  // User is offline - use cached data
}
```

### Monitor Sync Queue

```typescript
import { backgroundSyncQueue } from '@/lib/backgroundSync';

// Check pending items
const status = backgroundSyncQueue.getStatus();
console.log(`Pending sync items: ${status.pending}`);

// Clear queue (e.g., on logout)
backgroundSyncQueue.clearQueue();
```

### Disable PWA in Development

```typescript
// In vite.config.ts
devOptions: {
  enabled: false  // Change from true to false
}
```

---

## File Locations

### PWA Core Files
```
/public/manifest.webmanifest       - PWA configuration
/public/pwa-icons/                 - App icons (8 sizes)
/src/components/pwa/               - PWA UI components
/src/lib/backgroundSync.ts         - Offline/sync utilities
/vite.config.ts                    - Service worker config
```

### Key Components
```
PWAInstallPrompt      - Shows install banner to users
OfflineIndicator      - Online/offline status banner
InstallPWA            - Installation instructions page
```

---

## Troubleshooting

### Install Prompt Not Showing

**Problem:** Install banner doesn't appear

**Solutions:**
1. Clear browser data: DevTools > Application > Clear storage
2. Check if already installed: `window.matchMedia('(display-mode: standalone)').matches`
3. Clear dismissal localStorage: `localStorage.removeItem('pwa-install-dismissed')`
4. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Service Worker Not Updating

**Problem:** Old service worker stuck

**Solutions:**
1. DevTools > Application > Service Workers
2. Check "Update on reload"
3. Click "Unregister" if needed
4. Hard refresh

### Icons Not Loading

**Problem:** 404 errors for icons

**Solutions:**
1. Check files exist in `/public/pwa-icons/`
2. Verify paths in manifest start with `/pwa-icons/`
3. Run `npm run build` to copy icons to dist

### Offline Mode Not Working

**Problem:** Blank page when offline

**Solutions:**
1. Ensure service worker is registered
2. Check cache is populated (browse app first)
3. Verify in DevTools > Application > Cache Storage

### TypeScript Errors

**Problem:** Types not found for PWA modules

**Solutions:**
```bash
# Install missing types
npm install --save-dev @types/serviceworker

# Rebuild
npm run build
```

---

## Performance Tips

### Cache Strategy Quick Reference

| Use Case | Strategy | Why |
|----------|----------|-----|
| Fresh data (bookings) | NetworkFirst | Always try network first |
| Performance (posts) | StaleWhileRevalidate | Show cached, update in background |
| Static assets (images) | CacheFirst | Never fetch if cached |
| Real-time (messages) | NetworkFirst + Timeout | Fast fail to cache |

### Reduce Bundle Size

```typescript
// Lazy load heavy components
const InstallPWA = lazy(() => import('./pages/InstallPWA'));

// Code-split by route
<Suspense fallback={<Loading />}>
  <InstallPWA />
</Suspense>
```

---

## Deployment Checklist

### Pre-Deployment
```bash
# 1. Build for production
npm run build

# 2. Test PWA locally (HTTPS required)
npx serve-https@latest dist

# 3. Run Lighthouse audit
# Chrome DevTools > Lighthouse > Progressive Web App

# 4. Verify all icons load
# Check dist/pwa-icons/ has all 8 files
```

### Production Requirements
- ✅ HTTPS enabled (required)
- ✅ Manifest accessible at `/manifest.webmanifest`
- ✅ Service worker registered
- ✅ All icons present
- ✅ Correct MIME types configured

### Server Configuration

**Nginx:**
```nginx
types {
    application/manifest+json webmanifest;
}
add_header Service-Worker-Allowed /;
```

**Vercel/Netlify:**
- No config needed - automatic ✅

---

## Monitoring in Production

### Key Metrics to Track
- Install rate (unique visitors that install)
- Offline usage percentage
- Background sync success rate
- Service worker update acceptance
- Cache hit/miss ratios

### Logging
```typescript
// Service worker events logged to console
// Add monitoring integration in production:

const updateSW = registerSW({
  onRegistered(registration) {
    // Track with your analytics
    analytics.track('pwa_installed');
  },
  onNeedRefresh() {
    analytics.track('pwa_update_available');
  }
});
```

---

## Quick Commands

```bash
# Development
npm run dev

# Type check
npm run type-check

# Build
npm run build

# Preview build (with HTTPS)
npm run preview

# Generate new icons (requires tool)
npx pwa-asset-generator logo.png ./public/pwa-icons \
  --background "#f97316" \
  --padding "20%"
```

---

## Useful Links

- [PWA Documentation](./PWA-SETUP.md) - Complete guide
- [Implementation Summary](./PHASE-2-PWA-IMPLEMENTATION-SUMMARY.md) - Technical details
- [Manifest Validator](https://manifest-validator.com/) - Test manifest online
- [PWA Builder](https://www.pwabuilder.com/) - Generate icons and assets
- [Workbox Documentation](https://developers.google.com/web/tools/workbox) - Caching strategies

---

## Need Help?

1. Check browser console for errors
2. Read [PWA-SETUP.md](./PWA-SETUP.md)
3. Verify HTTPS is enabled
4. Test in incognito/private mode
5. Check files are in `/dist/` after build

---

**Last Updated:** December 28, 2025
**PWA Version:** 1.0.0
**Status:** Production Ready ✅
