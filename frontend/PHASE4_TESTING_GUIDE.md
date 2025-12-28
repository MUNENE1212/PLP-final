# Phase 4 Testing Guide

## Quick Testing Checklist

### 🎯 Critical Features (Test First)

#### 1. Swipe Gestures - BookingWizard
**Location**: `/booking` route or any booking flow

**Steps**:
1. Open the booking wizard on a mobile device
2. At step 1 (Service Selection), swipe left
3. ✅ Expected: Should move to step 2 (Problem Description)
4. At step 2, swipe right
5. ✅ Expected: Should go back to step 1
6. ✅ Expected: Feel haptic feedback on each swipe

**Devices to Test**:
- [ ] Android Chrome
- [ ] iOS Safari
- [ ] Android Firefox

---

#### 2. Swipe Actions - TechnicianCard
**Location**: `/find-technicians` route

**Steps**:
1. Browse technician cards
2. Swipe a card to the left
3. ✅ Expected: See "View Profile" action (blue background)
4. Swipe a card to the right
5. ✅ Expected: See "Book Now" action (green background)
6. Release the swipe
7. ✅ Expected: Action should trigger
8. ✅ Expected: Haptic feedback

**Devices to Test**:
- [ ] Android Chrome
- [ ] iOS Safari
- [ ] Tablet (iPad/Android)

---

#### 3. Voice Search - Home Page
**Location**: `/` (home page)

**Steps**:
1. Open home page on mobile
2. Tap the microphone icon next to search bar
3. Grant microphone permission if asked
4. Speak: "I need a plumber in Nairobi"
5. ✅ Expected: See real-time transcription
6. ✅ Expected: Audio wave animation while listening
7. ✅ Expected: Auto-navigation to technicians page

**Voice Commands to Try**:
- "Find an electrician"
- "I need plumbing services"
- "Carpenter in Mombasa"
- "Emergency repair"

**Devices to Test**:
- [ ] Android Chrome
- [ ] iOS Safari
- [ ] Desktop Chrome (with mic)

**Known Limitations**:
- ❌ Firefox: Web Speech API not supported
- ❌ Desktop: May not have microphone

---

#### 4. Camera Capture - Booking Form
**Location**: Booking wizard, step 2 (Problem Description)

**Steps**:
1. Go to step 2 of booking wizard
2. Scroll to "Add Photo of the Problem" section
3. Tap "Take or Upload Photo"
4. ✅ Expected: Camera opens (or file picker on desktop)
5. Take a photo or select from gallery
6. ✅ Expected: Photo preview appears
7. ✅ Expected: "Photo added successfully!" message
8. Tap the X button on preview
9. ✅ Expected: Photo is removed

**Test Scenarios**:
- [ ] Take photo with rear camera
- [ ] Take photo with front camera (if available)
- [ ] Upload from gallery
- [ ] Try uploading large file (>5MB) - should show error
- [ ] Try uploading non-image file - should show error

**Devices to Test**:
- [ ] Android phone
- [ ] iPhone
- [ ] Desktop (file picker)

---

### 🔧 Additional Features

#### 5. Haptic Feedback
**Feel the vibrations on Android devices**

**Test Points**:
- [ ] Swipe through booking steps (medium vibration)
- [ ] Swipe technician cards (success pattern)
- [ ] Button taps (light vibration)

**Note**: iOS doesn't support vibration API

---

#### 6. Browser Compatibility
**Test feature degradation on different browsers**

| Browser | Swipe | Voice | Camera | Haptics | Biometric |
|---------|-------|-------|--------|---------|-----------|
| Chrome Mobile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Safari Mobile | ✅ | ✅ | ✅ | ❌ | ✅ |
| Firefox Mobile | ✅ | ❌ | ✅ | ✅ | ✅ |
| Desktop Chrome | ⚠️ | ✅ | ⚠️ | ❌ | ✅ |

Legend:
- ✅ Works
- ❌ Not supported
- ⚠️ Limited (no touch/camera)

---

## 🐛 Known Issues & Workarounds

### Voice Search Not Working?
**Problem**: Microphone permission denied
**Solution**:
1. Check browser permissions
2. Refresh page and grant permission
3. Use HTTPS (required for production)

### Camera Not Opening?
**Problem**: File picker instead of camera
**Solution**:
1. Use a mobile device (not desktop)
2. Ensure `<input capture="environment">` is supported
3. Try different browser

### Swipes Not Detected?
**Problem**: Gestures too sensitive/not sensitive enough
**Solution**:
1. Adjust threshold in `useSwipeGestures` call
2. Default is 50px, try 40px or 60px
3. Check console for errors

### Haptics Not Working?
**Problem**: No vibration on iOS
**Solution**:
1. This is expected - iOS restricts vibration API
2. Haptics only work on Android
3. Feature degrades gracefully

---

## 📊 Testing Results Template

Copy and fill this out during testing:

### Device 1: ___________
- **OS**: Android __ / iOS __
- **Browser**: Chrome __ / Safari __ / Firefox __
- **Swipe Gestures**: ✅ Pass / ❌ Fail
- **Voice Search**: ✅ Pass / ❌ Fail
- **Camera**: ✅ Pass / ❌ Fail
- **Haptics**: ✅ Pass / ❌ Fail / N/A
- **Notes**: ___________

### Device 2: ___________
- **OS**: Android __ / iOS __
- **Browser**: Chrome __ / Safari __ / Firefox __
- **Swipe Gestures**: ✅ Pass / ❌ Fail
- **Voice Search**: ✅ Pass / ❌ Fail
- **Camera**: ✅ Pass / ❌ Fail
- **Haptics**: ✅ Pass / ❌ Fail / N/A
- **Notes**: ___________

---

## 🚀 Performance Testing

### Check Animation Performance
1. Open Chrome DevTools
2. Go to Performance tab
3. Record while swiping cards
4. ✅ Expected: 60fps (no dropped frames)

### Check Bundle Size
- Production bundle: 299.72 kB (gzipped)
- Phase 4 addition: ~15 KB
- ✅ Acceptable impact

### Check Memory Leaks
1. Open Chrome DevTools Memory tab
2. Take heap snapshot
3. Use features (swipe, voice, camera)
4. Take another snapshot
5. ✅ Expected: No significant memory increase

---

## ✅ Success Criteria

All of the following must pass:

- [ ] Swipe gestures work smoothly on mobile
- [ ] Voice search transcribes accurately (80%+ accuracy)
- [ ] Camera captures and displays photos
- [ ] Haptic feedback works on Android
- [ ] Biometric auth prompt appears on supported devices
- [ ] All features degrade gracefully on unsupported browsers
- [ ] TypeScript compilation passes with no errors
- [ ] Production build succeeds
- [ ] No console errors during feature usage
- [ ] Animations run at 60fps

---

## 📝 Reporting Issues

When reporting issues, include:

1. **Device**: Make, model, OS version
2. **Browser**: Name and version
3. **Feature**: Which feature failed
4. **Steps**: Exact steps to reproduce
5. **Expected**: What should happen
6. **Actual**: What actually happened
7. **Console**: Any console errors
8. **Screenshot**: If applicable

---

## 🎬 Demo Script

For recording a demo video:

1. **Show swipe gestures** (30 seconds)
   - Swipe through booking wizard
   - Swipe technician cards

2. **Show voice search** (20 seconds)
   - Tap microphone
   - Speak query
   - Show results

3. **Show camera** (20 seconds)
   - Tap camera button
   - Take photo
   - Show preview

4. **Show haptics** (10 seconds)
   - Mention Android-only
   - Show visual feedback

Total demo time: ~90 seconds

---

## 📚 Quick Reference

### File Locations
- Hooks: `/media/munen/muneneENT/PLP/MERN/Proj/frontend/src/hooks/`
- Components: `/media/munen/muneneENT/PLP/MERN/Proj/frontend/src/components/`
- Utilities: `/media/munen/muneneENT/PLP/MERN/Proj/frontend/src/lib/`

### Key Imports
```typescript
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { VoiceSearchButton } from '@/components/voice';
import { CameraCapture } from '@/components/camera';
import { SwipeableCard } from '@/components/gestures';
import { hapticSuccess } from '@/lib/haptics';
import { biometricAuth } from '@/lib/biometrics';
```

### Test URLs
- Home: `http://localhost:5173/`
- Booking: `http://localhost:5173/booking`
- Technicians: `http://localhost:5173/find-technicians`

---

**Happy Testing! 🎉**

Remember: The goal is a native-like mobile experience. If something feels clunky or doesn't work smoothly, report it!
