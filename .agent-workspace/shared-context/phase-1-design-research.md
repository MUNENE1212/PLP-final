# Mobile PWA Design Research - 2025 Best Practices & Trends

**Date**: 2025-12-28  
**Agent**: Orchestrator (Research Phase)  
**Project**: Dumu Waks PWA Transformation

---

## Executive Summary

This research document compiles the latest mobile PWA best practices, futuristic design trends for 2025, and service marketplace design patterns to guide the Dumu Waks transformation. The research covers technical implementation, user experience design, visual aesthetics, and performance optimization strategies.

**Key Insights:**
- PWAs are now mainstream, with 85%+ mobile browser support
- Glass morphism and neumorphism are giving way to bento-grid layouts and bold typography
- Gesture-first navigation is expected by users
- Performance is the #1 predictor of user engagement
- Dark mode is now a requirement, not a feature

---

## 1. PWA Best Practices for 2025

### 1.1 Core PWA Requirements

#### Installability Criteria (Chrome/Edge)

**Must Meet All:**
1. **Service Worker** with fetch handler
2. **Web App Manifest** with:
   - `name` (at least 1 character)
   - `short_name` (at least 1 character)
   - `start_url` 
   - `icons` (at least 192x192 and 512x512)
   - `display` (standalone or fullscreen)
   - `purpose` (any, badge, or maskable)

3. **HTTPS** (required)
4. **Responsive Design** (works on mobile and desktop)

**Best Practice Scores:**
- Chrome: "Fast and reliable" criteria
- Safari: Add to Home Screen prompts
- Firefox: Installation indicators
- Edge: PWA badging and installation

#### Service Worker Strategies

**Cache-First Pattern (for assets):**
```javascript
self.addEventListener('fetch', (event) => {
  if (isAssetRequest(event.request)) {
    event.respondWith(
      caches.open('assets-v1').then((cache) => 
        cache.match(event.request).then((response) => 
          response || fetch(event.request).then((fetchResponse) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          })
        )
      )
    );
  }
});
```

**Network-First Pattern (for API calls):**
```javascript
self.addEventListener('fetch', (event) => {
  if (isApiRequest(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open('api-cache').then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(event.request))
    );
  }
});
```

**Stale-While-Revalidate (for content):**
```javascript
self.addEventListener('fetch', (event) => {
  if (isContentRequest(event.request)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          caches.open('content-cache').then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      })
    );
  }
});
```

#### Manifest Best Practices (2025)

```json
{
  "name": "Dumu Waks - Professional Technicians",
  "short_name": "Dumu Waks",
  "description": "Connect with skilled technicians in Kenya",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#0ea5e9",
  "theme_color": "#0ea5e9",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "utilities", "lifestyle"],
  "screenshots": [
    {
      "src": "/screenshots/mobile1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "shortcuts": [
    {
      "name": "New Booking",
      "short_name": "Book",
      "description": "Create a new booking",
      "url": "/booking/create",
      "icons": [{ "src": "/icons/booking.png", "sizes": "192x192" }]
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false
}
```

### 1.2 Push Notifications

#### Implementation Strategy

**Request Permission:**
```typescript
// Request at right moment (after user completes first booking)
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    await subscribeToPushNotifications();
  }
}
```

**Push Notification Types:**
1. **Transactional**: Booking confirmed, technician arrived
2. **Engagement**: New message, job recommendation
3. **Promotional**: Weekly digest, special offers

**Best Practices:**
- Always ask with context ("Get notified when your technician is on the way")
- Allow easy opt-out
- Send timely, relevant notifications only
- Group notifications to avoid spam
- Use actionable buttons (View, Confirm, Cancel)

### 1.3 Offline-First Architecture

**Offline Data Strategy:**

```
IndexedDB Structure:
- users (store user profiles)
- bookings (store bookings)
- posts (store feed posts)
- messages (store conversations)
- sync-queue (actions to sync when online)
```

**Sync Queue Pattern:**
```typescript
interface SyncAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  payload: any;
  timestamp: number;
}

// When offline, queue actions
function queueOfflineAction(action: SyncAction) {
  const queue = await getSyncQueue();
  queue.push(action);
  await saveSyncQueue(queue);
}

// When online, process queue
async function processSyncQueue() {
  const queue = await getSyncQueue();
  for (const action of queue) {
    try {
      await fetch(action.endpoint, {
        method: action.type === 'create' ? 'POST' : 'PUT',
        body: JSON.stringify(action.payload)
      });
      await removeFromQueue(action.id);
    } catch (error) {
      // Keep in queue for retry
    }
  }
}
```

---

## 2. Mobile-First Design Patterns

### 2.1 Touch Optimization

#### Touch Target Guidelines (2025)

**WCAG 2.1 AAA Level** (Recommended):
- Minimum: 44x44 CSS pixels
- Recommended: 48x48 CSS pixels
- Spacing: 8px between targets

**Implementation:**
```css
/* Base touch target */
.touch-target {
  min-height: 48px;
  min-width: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* For small icons, add padding */
.icon-button {
  padding: 12px;
}

/* For text buttons, add padding */
.text-button {
  padding: 12px 24px;
  min-height: 48px;
}
```

#### Thumb-Friendly Zones

**Mobile Screen Zones**:
```
┌─────────────────────┐
│     Top 30%         │ ← Hard to reach (use sparingly)
├─────────────────────┤
│                     │
│     Middle 40%      │ ← Easy reach (primary actions)
│                     │
├─────────────────────┤
│     Bottom 30%      │ ← Easiest reach (navigation, CTAs)
└─────────────────────┘
```

**Bottom Navigation Pattern**:
```typescript
// Primary navigation in bottom 30%
const BottomNavigation = () => (
  <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t">
    <div className="flex justify-around items-center h-full">
      <NavButton to="/dashboard" icon={Home} label="Home" />
      <NavButton to="/bookings" icon={Calendar} label="Bookings" />
      <NavButton to="/messages" icon={Message} label="Messages" />
      <NavButton to="/profile" icon={User} label="Profile" />
    </div>
  </nav>
);
```

### 2.2 Mobile Navigation Patterns

#### Bottom Navigation (Recommended)

**Best Practices:**
- 3-5 top-level destinations
- Labels always visible (no text-only)
- Active state clearly indicated
- Include badges for notifications
- 56px height minimum

**Example:**
```typescript
const BottomNav = () => (
  <div className="fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t dark:border-gray-700 pb-safe">
    <div className="flex justify-around items-center h-14 sm:h-16">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full relative",
            isActive(item.path) ? "text-primary-600" : "text-gray-500"
          )}
        >
          <item.icon className="h-6 w-6" />
          <span className="text-xs mt-1">{item.label}</span>
          {item.badge && (
            <span className="absolute top-1 right-4 h-2 w-2 bg-red-500 rounded-full" />
          )}
        </Link>
      ))}
    </div>
  </div>
);
```

#### Slide-Over Panels (Secondary Navigation)

**Use for:** Settings, Filters, Profile, Notifications

**Implementation:**
```typescript
const SlideOver = ({ isOpen, onClose, children }) => (
  <div className={cn(
    "fixed inset-0 z-50 transform transition-transform duration-300",
    isOpen ? "translate-x-0" : "translate-x-full"
  )}>
    <div className="absolute inset-0 bg-black/50" onClick={onClose} />
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-xl">
      {children}
    </div>
  </div>
);
```

### 2.3 Gesture Interactions

#### Swipe Actions (2025 Standard)

**Common Patterns:**
1. **Swipe Left**: Delete, Archive, Dismiss
2. **Swipe Right**: Reply, Save, Bookmark
3. **Swipe Down**: Refresh, Close
4. **Swipe Up**: More options, Expand

**Implementation with Framer Motion:**
```typescript
import { motion } from 'framer-motion';

const SwipeableItem = ({ onDelete, onSave, children }) => (
  <motion.div
    drag="x"
    dragConstraints={{ left: 0, right: 0 }}
    onDragEnd={(e, info) => {
      if (info.offset.x < -100) onDelete();
      if (info.offset.x > 100) onSave();
    }}
    whileTap={{ scale: 0.98 }}
  >
    {children}
  </motion.div>
);
```

#### Pull to Refresh

**Implementation:**
```typescript
const PullToRefresh = ({ onRefresh, isRefreshing }) => {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  // Handle touch events
  // Show loading spinner when pulled past threshold
  // Trigger refresh on release
};
```

### 2.4 Mobile Input Patterns

#### Floating Labels (Material Design 3)

```typescript
const FloatingLabelInput = ({ label, value, onChange }) => (
  <div className="relative">
    <input
      value={value}
      onChange={onChange}
      className={cn(
        "peer w-full px-4 pt-6 pb-2 border rounded-lg",
        "focus:outline-none focus:ring-2 focus:ring-primary-500",
        "placeholder-transparent"
      )}
      placeholder={label}
    />
    <label
      className={cn(
        "absolute left-4 transition-all duration-200",
        value || "focus"
          ? "-top-2.5 left-3 text-xs text-primary-600 bg-white px-1"
          : "top-3 text-gray-400"
      )}
    >
      {label}
    </label>
  </div>
);
```

#### Auto-Focus Management

**Best Practice:**
- Auto-focus first input on modal open
- Don't auto-focus on page load (jumps on mobile)
- Use inputmode attribute for keyboards

```html
<input
  type="tel"
  inputmode="tel"  // Shows numeric keypad
  autocomplete="tel"
/>
```

---

## 3. Futuristic Design Trends 2025

### 3.1 Visual Design Trends

#### 1. Bento Grid Layouts

**Popularized by:** Apple, Linear, GitHub

**Characteristics:**
- Asymmetric grid layouts
- Content organized in boxes
- Modular and flexible
- Clear visual hierarchy

**Example:**
```typescript
const BentoGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
    <div className="col-span-2 row-span-2">Hero content</div>
    <div className="col-span-1">Stat 1</div>
    <div className="col-span-1">Stat 2</div>
    <div className="col-span-3">Feature list</div>
  </div>
);
```

#### 2. Bold Typography

**Trends:**
- Oversized headlines (80px+ on desktop)
- Tight letter spacing (-0.02em)
- Contrast between headings and body
- Display fonts for personality

**Font Pairings:**
```
Headings: Space Grotesk, Cal Sans, General Sans, Clash Display
Body: Inter, DM Sans, Geist, Satoshi
```

#### 3. Vibrant Gradients

**Moving Away From:**
- Generic blue/purple gradients
- Subtle, low-contrast gradients

**Moving Toward:**
- Warm, vibrant gradients (orange, pink, yellow)
- High-contrast gradients
- Mesh gradients (multiple color stops)
- Animated gradients

**Example:**
```css
.gradient-text {
  background: linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb);
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

#### 4. Glassmorphism Evolution

**2025 Version:**
- More subtle blur effects
- Better contrast for accessibility
- Layered depth
- Used sparingly for emphasis

```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

#### 5. Dark Mode as Default

**Trend:**
- Design dark mode first
- Light mode as alternative
- OLED black (#000000) for true black on mobile
- Reduced saturation in dark mode

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #000000;  /* True black for OLED */
    --bg-secondary: #111111;
    --text-primary: #f9fafb;
    --text-secondary: #9ca3af;
  }
}
```

### 3.2 Animation Trends

#### 1. Physics-Based Animations

**Using Framer Motion:**
```typescript
const spring = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8
};

<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={spring}
/>
```

#### 2. Micro-Interactions

**Examples:**
- Button press: Scale down 5%
- Like button: Heart burst animation
- Success checkmark: Drawing animation
- Loading: Custom spinner with personality

#### 3. Page Transitions

**Smooth Route Transitions:**
```typescript
const pageVariants = {
  initial: { opacity: 0, x: -20 },
  enter: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

<motion.div
  variants={pageVariants}
  initial="initial"
  animate="enter"
  exit="exit"
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>
```

#### 4. Scroll Animations

**Intersection Observer:**
```typescript
const FadeInOnScroll = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    />
  );
};
```

### 3.3 Component Trends

#### 1. Floating Action Buttons (FAB)

**Evolved:**
- Larger, more prominent
- Extended FAB with labels
- Multiple actions on long-press

```typescript
<Fab
  icon={Plus}
  label="New Booking"
  onClick={handleCreate}
  className="fixed bottom-20 right-4"
/>
```

#### 2. Skeleton Screens

**With Shimmer Effect:**
```typescript
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 shimmer" />
    <div className="h-4 bg-gray-200 rounded w-1/2 shimmer" />
  </div>
);

.shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

#### 3. Bottom Sheets

**Use for:** Forms, Options, Details

```typescript
const BottomSheet = ({ isOpen, onClose, children }) => (
  <motion.div
    className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
    initial={{ y: "100%" }}
    animate={{ y: isOpen ? 0 : "100%" }}
    drag="y"
    dragConstraints={{ top: 0, bottom: 0 }}
    dragElastic={0.2}
    onDragEnd={(e, info) => {
      if (info.offset.y > 100) onClose();
    }}
  >
    <div className="p-6">{children}</div>
  </motion.div>
);
```

---

## 4. Service Marketplace UX Patterns

### 4.1 Booking Flow Best Practices

#### Linear's Booking Flow (Inspiration)

**Characteristics:**
- Multi-step progress indicator
- One input per screen
- Smooth transitions between steps
- Save and resume later
- Clear pricing at each step

**Implementation:**
```typescript
const BookingWizard = () => {
  const [step, setStep] = useState(1);
  const steps = [
    { id: 1, title: 'Service', component: ServiceSelector },
    { id: 2, title: 'Details', component: DetailsForm },
    { id: 3, title: 'Schedule', component: SchedulePicker },
    { id: 4, title: 'Confirm', component: BookingSummary },
  ];

  return (
    <div>
      <ProgressIndicator current={step} total={steps.length} />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {steps[step - 1].component}
        </motion.div>
      </AnimatePresence>
      <NavigationButtons
        onBack={() => setStep(step - 1)}
        onNext={() => setStep(step + 1)}
        canGoBack={step > 1}
        canGoForward={validateStep(step)}
      />
    </div>
  );
};
```

### 4.2 Technician Profiles

**Airbnb-Style Profiles:**

**Key Elements:**
1. **Hero Section**: Large cover photo + profile picture
2. **Quick Stats**: Rating, Jobs completed, Response rate
3. **About Section': Personality-driven bio
4. **Portfolio**: Visual grid of past work
5. **Reviews**: Social proof with photos
6. **Verification Badges**: ID, skills, background check

**Example Structure:**
```typescript
const TechnicianProfile = ({ technician }) => (
  <div>
    {/* Hero with parallax effect */}
    <div className="relative h-64">
      <img src={technician.coverPhoto} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60" />
    </div>
    
    {/* Profile picture overlapping */}
    <div className="relative -mt-16 px-4">
      <img
        src={technician.avatar}
        className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg"
      />
      <h1 className="mt-3 text-2xl font-bold">
        {technician.firstName} {technician.lastName}
      </h1>
      <div className="flex items-center gap-2 mt-1">
        <Star className="h-5 w-5 text-yellow-500 fill-current" />
        <span className="font-semibold">{technician.rating}</span>
        <span className="text-gray-500">({technician.reviewCount} reviews)</span>
      </div>
    </div>

    {/* Quick stats cards */}
    <div className="grid grid-cols-3 gap-3 mt-6 px-4">
      <StatCard label="Jobs" value={technician.completedJobs} />
      <StatCard label "Response" value={`${technician.responseRate}%`} />
      <StatCard label="Joined" value={technician.joinDate} />
    </div>

    {/* Portfolio grid */}
    <div className="mt-8">
      <h2 className="text-xl font-bold px-4">Portfolio</h2>
      <div className="grid grid-cols-2 gap-2 mt-4 px-4">
        {technician.portfolio.map((item) => (
          <img key={item.id} src={item.image} className="rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);
```

### 4.3 Search & Discovery

**Duolingo-Style Gamification:**

**Applied to Technician Search:**
- Swipe cards for technician profiles
- "Super Like" for preferred technicians
- Filter preferences saved
- AI recommendations based on history

```typescript
const TechnicianSwipeDeck = () => (
  <div className="relative h-full">
    <TinderCard
      onSwipeLeft={handlePass}
      onSwipeRight={handleLike}
      onSwipeUp={handleSuperLike}
    >
      <TechnicianCard technician={currentTechnician} />
    </TinderCard>
    
    <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
      <ActionButton icon={X} onPress={handlePass} color="red" />
      <ActionButton icon={Star} onPress={handleSuperLike} color="blue" />
      <ActionButton icon={Heart} onPress={handleLike} color="green" />
    </div>
  </div>
);
```

### 4.4 Real-Time Tracking

**Uber-Style Tracking:**

**Features:**
- Live map with technician location
- ETA updates
- Photo of technician
- Call/message buttons
- Progress timeline

```typescript
const LiveTracking = ({ booking }) => (
  <div className="fixed inset-0 bg-gray-100">
    <MapContainer>
      < TechnicianMarker position={booking.technicianLocation} />
      <DestinationMarker position={booking.destination} />
      <RoutePolyline points={booking.route} />
    </MapContainer>
    
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6">
      <div className="flex items-center gap-4">
        <img src={booking.technician.avatar} className="w-16 h-16 rounded-full" />
        <div className="flex-1">
          <h3 className="font-semibold">{booking.technician.name}</h3>
          <p className="text-gray-500">{booking.eta} min away</p>
        </div>
        <div className="flex gap-2">
          <IconButton icon={Phone} onPress={handleCall} />
          <IconButton icon={Message} onPress={handleMessage} />
        </div>
      </div>
      
      <Timeline className="mt-4" events={booking.timeline} />
    </div>
  </div>
);
```

---

## 5. Performance Optimization Strategies

### 5.1 Core Web Vitals Targets

**Largest Contentful Paint (LCP):** <2.5s
**First Input Delay (FID):** <100ms
**Cumulative Layout Shift (CLS):** <0.1

### 5.2 Code Splitting Strategies

```typescript
// Route-based splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TechnicianProfile = lazy(() => import('./pages/TechnicianProfile'));

// Component-based splitting
const HeavyChart = lazy(() => import('./components/HeavyChart'));

// Conditional splitting
const AdminPanel = lazy(() =>
  user.role === 'admin' ? import('./AdminPanel') : Promise.resolve(null)
);
```

### 5.3 Image Optimization

```typescript
// Next.js Image component (or similar)
const OptimizedImage = ({ src, alt }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    decoding="async"
    srcSet={`
      ${src}?w=400 400w,
      ${src}?w=800 800w,
      ${src}?w=1200 1200w
    `}
    sizes="(max-width: 600px) 400px, 800px"
  />
);

// WebP with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="Description" />
</picture>
```

### 5.4 Bundle Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-library': ['framer-motion', 'lucide-react'],
          'data-fetching': ['@tanstack/react-query', 'axios'],
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

---

## 6. Accessibility Best Practices

### 6.1 Semantic HTML

```typescript
// Good
<nav aria-label="Main navigation">
  <ul>
    <li><Link to="/dashboard">Dashboard</Link></li>
  </ul>
</nav>

// Bad
<div className="nav">
  <div onClick={() => navigate('/dashboard')}>Dashboard</div>
</div>
```

### 6.2 ARIA Labels

```typescript
<button aria-label="Close dialog" onClick={onClose}>
  <X className="h-6 w-6" />
</button>

<div role="status" aria-live="polite">
  {statusMessage}
</div>
```

### 6.3 Keyboard Navigation

```typescript
const Modal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Focus first focusable element
      const focusable = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
      
      // Trap focus
      const handleTab = (e) => {
        if (e.key === 'Tab') {
          // Trap focus within modal
        }
      };
      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen]);
};
```

### 6.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Design System Recommendations

### 7.1 Color Palette for Dumu Waks

**Avoid Generic Blue, Use Unique Identity:**

```javascript
// Primary: Warm Orange-Red (energy, action)
primary: {
  50: '#fff7ed',
  100: '#ffedd5',
  200: '#fed7aa',
  300: '#fdba74',
  400: '#fb923c',
  500: '#f97316',  // Main primary
  600: '#ea580c',
  700: '#c2410c',
  800: '#9a3412',
  900: '#7c2d12',
}

// Accent: Teal (trust, growth)
accent: {
  50: '#f0fdfa',
  100: '#ccfbf1',
  200: '#99f6e4',
  300: '#5eead4',
  400: '#2dd4bf',
  500: '#14b8a6',
  600: '#0d9488',
  700: '#0f766e',
  800: '#115e59',
  900: '#134e4a',
}

// Neutral: Warm grays (not cool gray)
neutral: {
  50: '#fafaf9',
  100: '#f5f5f4',
  200: '#e7e5e4',
  300: '#d6d3d1',
  400: '#a8a29e',
  500: '#78716c',
  600: '#57534e',
  700: '#44403c',
  800: '#292524',
  900: '#1c1917',
}
```

### 7.2 Typography Scale

```javascript
// Display
text-display: {
  fontSize: '4.5rem', // 72px
  lineHeight: '1.1',
  fontWeight: 700,
  letterSpacing: '-0.02em',
}

// H1
text-h1: {
  fontSize: '3rem', // 48px
  lineHeight: '1.2',
  fontWeight: 700,
  letterSpacing: '-0.02em',
}

// H2
text-h2: {
  fontSize: '2.25rem', // 36px
  lineHeight: '1.3',
  fontWeight: 600,
  letterSpacing: '-0.01em',
}

// H3
text-h3: {
  fontSize: '1.75rem', // 28px
  lineHeight: '1.4',
  fontWeight: 600,
}

// Body Large
text-lg: {
  fontSize: '1.125rem', // 18px
  lineHeight: '1.6',
  fontWeight: 400,
}

// Body
text-base: {
  fontSize: '1rem', // 16px
  lineHeight: '1.5',
  fontWeight: 400,
}

// Caption
text-caption: {
  fontSize: '0.875rem', // 14px
  lineHeight: '1.4',
  fontWeight: 400,
}
```

---

## 8. Implementation Roadmap

### Phase 1: PWA Foundation (Week 1-2)
- [ ] Set up vite-plugin-pwa
- [ ] Create manifest.json
- [ ] Implement service worker
- [ ] Add offline caching strategy
- [ ] Configure workbox for asset optimization

### Phase 2: Design System (Week 2-3)
- [ ] Define design tokens
- [ ] Create color palette
- [ ] Set up typography scale
- [ ] Build component library
- [ ] Implement dark mode

### Phase 3: Core Components (Week 3-5)
- [ ] Redesign navigation (bottom nav)
- [ ] Build mobile-first UI components
- [ ] Add Framer Motion animations
- [ ] Implement gesture support
- [ ] Create loading states

### Phase 4: Feature Pages (Week 5-7)
- [ ] Redesign homepage
- [ ] Transform dashboard
- [ ] Optimize booking flow
- [ ] Enhance social feed
- [ ] Improve technician profiles

### Phase 5: Advanced Features (Week 7-8)
- [ ] Implement push notifications
- [ ] Add background sync
- [ ] Create install prompts
- [ ] Build offline queue
- [ ] Add pull-to-refresh

### Phase 6: Optimization (Week 8-9)
- [ ] Performance audit
- [ ] Code splitting
- [ ] Image optimization
- [ ] Bundle optimization
- [ ] Lighthouse optimization

### Phase 7: Testing & Launch (Week 9-10)
- [ ] Cross-browser testing
- [ ] Cross-device testing
- [ ] Accessibility testing
- [ ] User acceptance testing
- [ ] Documentation
- [ ] Deployment

---

## 9. Key Success Metrics

### Technical Metrics
- Lighthouse Performance: 90+
- Lighthouse PWA: 100
- Lighthouse Accessibility: 90+
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Bundle Size: <200KB initial

### User Metrics
- Task completion time: -50%
- Session duration: +30%
- Conversion rate: +20%
- Bounce rate: -25%
- PWA install rate: >15%

### Quality Metrics
- Touch target compliance: 100%
- Design consistency: 95%+
- Component reusability: 80%+
- Code maintainability score: A

---

## 10. Conclusion

The Dumu Waks PWA transformation should focus on:

1. **Mobile-First Experience**: Bottom navigation, thumb-friendly design, gesture interactions
2. **Unique Visual Identity**: Bold colors, strong typography, smooth animations
3. **Performance Excellence**: Fast loading, optimized assets, efficient caching
4. **Accessibility First**: WCAG AA compliance, keyboard navigation, screen reader support
5. **Modern PWA Features**: Offline functionality, push notifications, installability

The research shows that successful PWAs in 2025 combine:
- Blazing-fast performance (<3s TTI)
- Intuitive mobile navigation (bottom nav, gestures)
- Delightful micro-interactions (animations, feedback)
- Robust offline capabilities (service worker, sync queue)
- Unique brand identity (not generic blue, distinctive design)

By following these best practices and trends, Dumu Waks can become a leader in the African tech ecosystem with a world-class PWA that delights users and stands out from competitors.

---

**Next Steps**: Begin Phase 1 (PWA Foundation) by setting up the technical infrastructure and design system tokens.
