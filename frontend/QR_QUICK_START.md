# QR Code Features - Quick Start Guide

## Installation

The QR code features are already installed and integrated. No additional setup needed!

## Quick Usage

### 1. Technician Profile QR Code

Visit any technician profile page, scroll to the bottom to see:
- Shareable QR code for the technician's profile
- Download, copy, and share buttons
- Technician information displayed

**Location:** `/technicians/:id`

### 2. Booking Confirmation QR Code

When a booking is confirmed (status: accepted, en_route, arrived, in_progress):
- QR code automatically appears on booking detail page
- Shows booking reference and technician info
- Useful for verification when technician arrives

**Location:** `/bookings/:id`

### 3. Quick Access QR Menu

Authenticated users see a floating QR button (bottom-right corner):
- Click to open QR menu
- Choose from:
  - My Profile QR (technicians only)
  - App Install QR
  - Booking QR (if on booking page)

### 4. PWA Install Page

Dedicated page for app installation:
- Large, printable QR code
- Step-by-step instructions
- Works on mobile and desktop

**Location:** `/install-app`

## Developer Usage

### Import QR Components

```typescript
// Import individual components
import { QRCodeDisplay, TechnicianQRCard, BookingQR } from '@/components/qrcode';

// Import utilities
import { generateBrandedQRCode, downloadQRCode } from '@/lib/qrcode';
```

### Generate a QR Code

```typescript
// Simple QR code
const qrUrl = await generateBrandedQRCode('https://example.com');

// With options
const qrUrl = await generateBrandedQRCode('https://example.com', {
  width: 400,
  margin: 2,
  errorCorrectionLevel: 'H'
});
```

### Display a QR Code

```tsx
<QRCodeDisplay
  data="https://dumuwaks.com"
  title="Scan to Visit"
  description="Dumu Waks Website"
  size={300}
/>
```

### Use QR Scanner

```tsx
import { QRScanner } from '@/components/qrcode';

const [showScanner, setShowScanner] = useState(false);

{showScanner && (
  <QRScanner
    onScan={(data) => {
      console.log('Scanned:', data);
      setShowScanner(false);
    }}
    onClose={() => setShowScanner(false)}
  />
)}
```

## Features

### For Customers
- View technician QR codes on profiles
- Share technicians easily
- Get booking confirmation QRs
- Install app via QR code

### For Technicians
- Generate profile QR codes
- Download for business cards
- Share on social media
- Print marketing materials

## Customization

### Change QR Code Color

Edit `frontend/src/lib/qrcode.ts`:

```typescript
export const generateBrandedQRCode = async (
  data: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  const {
    width = 400,
    margin = 2,
    color = {
      dark: '#f97316', // Change this color
      light: '#ffffff'
    },
    errorCorrectionLevel = 'H'
  } = options;

  return generateQRCode(data, { width, margin, color, errorCorrectionLevel });
};
```

### Adjust QR Code Size

```tsx
<QRCodeDisplay
  data="..."
  size={400}  // Larger size
/>
```

## Testing

1. **Generate QR**: Visit any technician profile
2. **Download QR**: Click download button
3. **Share QR**: Use share button (mobile) or copy link
4. **Scan QR**: Use phone camera app to scan

## Troubleshooting

### QR Code Not Displaying
- Check browser console for errors
- Verify data string is not empty
- Ensure internet connection (for QR library)

### Download Not Working
- Check browser permissions
- Try different browser
- Ensure sufficient disk space

### Scanner Not Working
- Check camera permissions
- Ensure HTTPS connection
- Try on mobile device
- Check browser compatibility

## Browser Support

**QR Generation**: All modern browsers
**QR Scanning**: Mobile browsers with camera support
**Share API**: Chrome 24+, Safari 12.2+, Firefox 75+, Edge 79+

## File Locations

- **Library**: `frontend/src/lib/qrcode.ts`
- **Components**: `frontend/src/components/qrcode/`
- **Pages**: `frontend/src/pages/InstallApp.tsx`
- **Documentation**: 
  - `frontend/QR_FEATURES.md` - Full documentation
  - `frontend/QR_IMPLEMENTATION_SUMMARY.md` - Implementation details

## Support

For issues or questions:
1. Check the main documentation (`QR_FEATURES.md`)
2. Review component props in code
3. Test on multiple devices
4. Verify camera permissions for scanner

## Examples in the App

1. Go to `/technicians/:id` - See technician QR
2. Go to `/bookings/:id` (if booking active) - See booking QR
3. Click floating QR button - Access quick menu
4. Go to `/install-app` - Install page with QR

All QR codes are fully functional and ready to use!
