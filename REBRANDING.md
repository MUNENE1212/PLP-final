# Dumu Waks Rebranding Guide

This document outlines the rebranding process from EmEnTech/BaiTech to **Dumu Waks**.

## ✅ Completed Changes

### 1. Logo Setup
- ✅ Logo file copied from `LOGO.jpg` to `frontend/public/images/logo.jpg`
- ✅ Created directory structure: `frontend/public/images/` and `frontend/public/favicons/`
- ✅ Created logo processing script: `frontend/process-logo.sh`

### 2. HTML & Meta Tags
- ✅ Updated `frontend/index.html` with:
  - New page title: "Dumu Waks - Connect with Skilled Technicians"
  - Comprehensive favicon links (16x16, 32x32, 96x96)
  - Apple Touch Icons (180x180, 152x152, 167x167)
  - Android Chrome icons (192x192, 512x512)
  - Microsoft tile (144x144)
  - Open Graph meta tags for social sharing
  - Twitter Card meta tags
  - Updated descriptions and keywords

### 3. PWA Support
- ✅ Created `frontend/public/site.webmanifest` for Progressive Web App support

### 4. Component Updates
- ✅ **Navbar** (`frontend/src/components/layout/Navbar.tsx`)
  - Replaced text logo with image logo
  - Updated brand name from "EmEnTech" to "Dumu Waks"
  - Added fallback for logo loading

- ✅ **Footer** (`frontend/src/components/layout/Footer.tsx`)
  - Updated logo display
  - Changed brand name to "Dumu Waks"
  - Updated copyright text
  - Refined description text

- ✅ **New Loading Screen** (`frontend/src/components/common/LoadingScreen.tsx`)
  - Created branded loading component with logo
  - Animated pulse effects
  - Dark mode support
  - Reusable for full-screen or inline loading states

### 5. Configuration Files
- ✅ **Constants** (`frontend/src/config/constants.ts`)
  - Updated `APP_NAME` to "Dumu Waks"
  - Updated `APP_DESCRIPTION`
  - Changed storage keys from `ementech_*` to `dumuwaks_*`

## 📋 Required Actions

### Step 1: Process the Logo (TRANSPARENT & SCALABLE)
The logo will be processed into multiple transparent PNG sizes and optionally converted to SVG (scalable vector).

```bash
cd frontend
./process-logo.sh
```

**Requirements:**
- **ImageMagick** (required)
  - **Ubuntu/Debian:** `sudo apt-get install imagemagick`
  - **macOS:** `brew install imagemagick`
  - **Windows:** Download from https://imagemagick.org/script/download.php

- **Potrace** (optional, for SVG conversion)
  - **Ubuntu/Debian:** `sudo apt-get install potrace`
  - **macOS:** `brew install potrace`

**What the Script Does:**
- ✨ Removes white/light backgrounds (transparent PNGs)
- 📐 Creates multiple sizes for different use cases
- 🎨 Attempts automatic SVG conversion (if potrace installed)
- 🎯 Generates all favicon formats
- 🖼️ Optimizes for web use

**Generated Files:**
```
frontend/public/
├── favicon.ico (multi-size)
├── images/
│   ├── logo.jpg (original)
│   ├── logo.svg (scalable vector - if potrace installed) ⭐
│   ├── logo-full.png (500x500, transparent)
│   ├── logo-medium.png (200x200, transparent)
│   ├── logo-small.png (120x120, transparent)
│   ├── logo-square.png (512x512, transparent, for social media)
│   └── logo-loading.png (300x300, transparent, for loading screens)
└── favicons/ (all transparent)
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    ├── favicon-96x96.png
    ├── apple-touch-icon.png
    ├── apple-touch-icon-152x152.png
    ├── apple-touch-icon-167x167.png
    ├── android-chrome-192x192.png
    ├── android-chrome-512x512.png
    └── mstile-144x144.png
```

**Fine-Tuning:**
If background removal is too aggressive or not enough:
1. Open `process-logo.sh` in text editor
2. Adjust `FUZZ_VALUE` (line 14):
   - Lower value (5-10): Less aggressive, keeps more colors
   - Higher value (20-30): More aggressive, removes more background
3. Re-run the script

**For Best Quality SVG:**
The automated conversion is quick but may not be perfect. For professional results:
- See `SVG_CONVERSION_GUIDE.md` for manual conversion methods
- Use Adobe Illustrator, Inkscape, or online tools like Vectorizer.ai
- Manual tracing gives best results for complex logos

### Step 2: Update Backend Branding (Optional)
Update any backend references to the old brand name:

```bash
cd backend

# Search for old brand references
grep -r "EmEnTech\|BaiTech\|ementech" src/ --exclude-dir=node_modules
```

Common files to update:
- Email templates
- SMS messages
- API documentation
- Environment variables
- Database seed data

### Step 3: Clear Browser Storage
Users may have cached data with old brand name. Consider:

1. **Version Update:** Increment version in `package.json`
2. **Cache Busting:** Update asset URLs or add version query parameters
3. **User Notification:** Show a one-time message about rebranding

### Step 4: Update Environment Variables (Optional)
Create a `.env.local` file in the frontend directory:

```bash
# Frontend Environment Variables
VITE_APP_NAME=Dumu Waks
VITE_APP_DESCRIPTION=Professional Maintenance & Repair Services Platform
```

### Step 5: Test the Rebrand
1. **Start the development server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Check the following:**
   - [ ] Browser tab shows new favicon
   - [ ] Page title shows "Dumu Waks"
   - [ ] Logo displays correctly in navbar
   - [ ] Logo displays correctly in footer
   - [ ] Loading screens show branded logo
   - [ ] Meta tags are correct (view page source)
   - [ ] No console errors about missing images

3. **Test responsive design:**
   - [ ] Logo scales properly on mobile
   - [ ] Favicon shows on all devices
   - [ ] Touch icons work on iOS/Android

### Step 6: Production Deployment
Before deploying to production:

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Verify built assets:**
   ```bash
   ls -la dist/images/
   ls -la dist/favicons/
   ```

3. **Update CDN/hosting:**
   - Upload new logo files
   - Clear CDN cache
   - Update DNS if domain changed

## 🎨 Brand Assets

### Logo Usage Guidelines

**Primary Format:** SVG (Scalable Vector)
- All components now use `logo.svg` as the primary source
- Automatic fallback to PNG if SVG not available
- Final fallback to original JPG

**Fallback Chain:**
```
logo.svg → logo-[size].png → logo.jpg
```

**Usage by Component:**
- **Navbar:** `logo.svg` → `logo-small.png` (120x120) → `logo.jpg`
- **Footer:** `logo.svg` → `logo-medium.png` (200x200) → `logo.jpg`
- **Loading Screen:** `logo.svg` → `logo-loading.png` (300x300) → `logo.jpg`
- **Social Sharing:** Use `logo-square.png` (512x512)
- **Full Display:** Use `logo-full.png` (500x500)

**Why SVG First?**
- ✅ Infinite scalability (looks perfect at any size)
- ✅ Smaller file size (faster loading)
- ✅ Retina/4K ready
- ✅ Better for accessibility
- ✅ Transparent by default

### Color Scheme
The current theme uses:
- **Primary:** Blue (#2563eb)
- **Background:** White / Dark Gray
- **Text:** Gray scale with dark mode support

If the logo has specific brand colors, update the theme in `tailwind.config.js`.

## 📝 Files Modified

### Frontend
```
frontend/
├── index.html (✓ Updated)
├── process-logo.sh (✓ Created)
├── public/
│   ├── site.webmanifest (✓ Created)
│   ├── images/ (✓ Created)
│   └── favicons/ (✓ Created)
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx (✓ Updated)
│   │   │   └── Footer.tsx (✓ Updated)
│   │   └── common/
│   │       └── LoadingScreen.tsx (✓ Created)
│   └── config/
│       └── constants.ts (✓ Updated)
```

### Backend (Not yet updated)
Files that may need updates:
```
backend/
├── .env (APP_NAME, EMAIL_FROM, etc.)
├── src/
│   ├── services/
│   │   ├── email.service.js
│   │   └── sms.service.js
│   └── utils/
│       └── notifications.js
```

## 🚀 Next Steps

1. [ ] Run logo processing script
2. [ ] Test all changes locally
3. [ ] Update backend branding
4. [ ] Update email/SMS templates
5. [ ] Update API documentation
6. [ ] Announce rebrand to users
7. [ ] Update social media profiles
8. [ ] Update app store listings (if applicable)

## 🐛 Troubleshooting

### Logo Not Showing
- Check browser console for 404 errors
- Verify logo files exist in `public/images/`
- Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- Check image file permissions

### Favicon Not Updating
- Hard refresh (Ctrl+F5 / Cmd+Shift+R)
- Clear browser favicon cache
- Check `favicon.ico` exists in `public/` root
- Wait a few minutes for browser to re-fetch

### Old Brand Name Still Appearing
- Search codebase: `grep -r "EmEnTech\|BaiTech" --exclude-dir=node_modules`
- Clear localStorage: `localStorage.clear()` in browser console
- Check for cached service workers
- Rebuild the application

## 📧 Support

For questions about the rebranding:
- Check existing TODO list in project
- Review git commit history
- Contact development team

---

**Last Updated:** November 19, 2025
**Status:** ✅ Frontend Complete | ⏳ Backend Pending | ⏳ Logo Processing Pending
