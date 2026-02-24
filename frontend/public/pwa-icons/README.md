# PWA Icons

This directory contains the Progressive Web App icons for Dumu Waks.

## Required Icon Sizes

The following PNG icon files are needed for complete PWA support:

- icon-72x72.png (72x72 pixels)
- icon-96x96.png (96x96 pixels)
- icon-128x128.png (128x128 pixels)
- icon-144x144.png (144x144 pixels)
- icon-152x152.png (152x152 pixels)
- icon-192x192.png (192x192 pixels) - **Critical for Android**
- icon-384x384.png (384x384 pixels)
- icon-512x512.png (512x512 pixels) - **Critical for Android & Splash Screens**

## How to Generate Icons

### Option 1: Use RealFaviconGenerator (Recommended)

1. Go to https://realfavicongenerator.net/
2. Upload your logo (preferably SVG or high-resolution PNG)
3. Configure settings:
   - iOS: Yes
   - Android: Yes
   - Windows: Yes
   - Progressive Web App: Yes
4. Download the generated package
5. Extract icons to this directory

### Option 2: Use PWA Asset Generator

```bash
npx pwa-asset-generator /path/to/logo.png ./pwa-icons \
  --background "#f97316" \
  --padding "20%" \
  --type png \
  --quality 90 \
  --manifest manifest.webmanifest
```

### Option 3: Manual Conversion from SVG

1. Open `icon-template.svg` in a design tool (Figma, Sketch, Adobe XD)
2. Export at each required size
3. Or use online tools like:
   - https://cloudconvert.com/svg-to-png
   - https://convertio.co/svg-png/

## Design Guidelines

- **Primary Color**: #f97316 (Orange)
- **Background**: White or Orange (#f97316)
- **Logo**: Use the Dumu Waks logo from `/images/logo.png`
- **Style**: Clean, recognizable at small sizes
- **Padding**: At least 20% padding around logo

## Icon Specifications

### Maskable Icons (192x192, 512x512)
These icons must be safe for maskable application on Android devices:
- Keep all content within the "safe zone" (center 80% of the icon)
- Avoid critical content near edges

### Testing

After adding icons, test with Chrome DevTools:
1. Open DevTools > Application > Manifest
2. Verify all icons load correctly
3. Test on actual Android/iOS devices

## Current Status

⚠️ **Placeholder icons are in use. Replace with actual generated icons for production.**

The existing `/favicons/` directory has some icons that can be used as reference or copied:
- android-chrome-192x192.png → icon-192x192.png
- android-chrome-512x512.png → icon-512x512.png
- apple-touch-icon.png → icon-152x152.png

## Next Steps

1. Generate actual PNG icons from the logo
2. Place them in this directory with exact filenames
3. Verify manifest loads them correctly
4. Test installation on mobile devices
