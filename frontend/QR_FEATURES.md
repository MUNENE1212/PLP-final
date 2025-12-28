# QR Code Features - Dumu Waks

## Overview

The QR code system provides comprehensive functionality for generating and scanning QR codes throughout the Dumu Waks Progressive Web App. These features enhance accessibility, simplify sharing, and enable contactless interactions.

## Features Implemented

### 1. QR Code Generation

**Location:** `frontend/src/lib/qrcode.ts`

Core functions for generating QR codes in various formats:

- `generateQRCode()` - Generate QR code as data URL (PNG)
- `generateQRCodeSVG()` - Generate QR code as SVG string
- `generateBrandedQRCode()` - Generate QR code with Dumu Waks orange branding
- `generateQRCodePack()` - Generate multiple sizes for different use cases
- `downloadQRCode()` - Download QR code as image file
- `validateQRData()` - Validate QR code data before generation

### 2. QR Code Display Component

**Location:** `frontend/src/components/qrcode/QRCodeDisplay.tsx`

Reusable component for displaying QR codes with:
- Branded Dumu Waks colors (orange gradient)
- Centered logo overlay
- Download functionality
- Native share API integration
- Copy link to clipboard
- Responsive sizing
- Loading states
- Error handling

### 3. QR Code Scanner

**Location:** `frontend/src/components/qrcode/QRScanner.tsx`
**Hook:** `frontend/src/hooks/useQRScanner.ts`

Full-featured QR code scanner with:
- Camera access management
- Real-time QR code detection using jsQR
- Animated scanning frame
- Flashlight/torch control (when supported)
- Manual entry fallback
- Error handling for camera permissions
- Responsive design

### 4. Use Case Components

#### Technician Profile QR
**Location:** `frontend/src/components/qrcode/TechnicianQRCard.tsx`

Share technician profiles via QR code:
- Profile URL encoding
- Technician info display
- Share functionality
- Toast notifications

#### PWA Install QR
**Location:** `frontend/src/components/qrcode/PWAInstallQR.tsx`

Facilitate PWA installation:
- Install instructions
- Feature highlights
- Desktop fallback instructions
- Step-by-step guides

#### Booking Confirmation QR
**Location:** `frontend/src/components/qrcode/BookingQR.tsx`

Booking verification and tracking:
- Booking details display
- Technician information
- Scheduled date/time
- Service location
- Confirmation message

#### Quick Access Menu
**Location:** `frontend/src/components/qrcode/QRQuickAccess.tsx`

Floating QR code generator menu:
- Always accessible floating button
- Multiple QR code options
- Modal display
- Technician profile QR
- App install QR
- Booking QR

### 5. Pages

#### Install App Page
**Location:** `frontend/src/pages/InstallApp.tsx`

Dedicated PWA installation page with:
- Large QR code display
- Feature explanations
- Installation instructions
- Desktop user guidance
- Mobile-optimized layout

## Integration Points

### Technician Profile Page
**Location:** `frontend/src/pages/TechnicianProfile.tsx`

- Added TechnicianQRCard component
- Share button functionality
- Native share API integration

### Booking Detail Page
**Location:** `frontend/src/pages/BookingDetail.tsx`

- Conditional QR display for active bookings
- Shows for: accepted, en_route, arrived, in_progress
- Displays booking reference, technician info, scheduled date

### App Layout
**Location:** `frontend/src/components/layout/Layout.tsx`

- Integrated QRQuickAccess component
- Shows floating QR button for authenticated users
- Dynamic booking ID detection

### App Routes
**Location:** `frontend/src/App.tsx`

- Added `/install-app` route
- Kept existing `/install-pwa` route for backward compatibility

## Dependencies Installed

```bash
npm install qrcode @types/qrcode jsqr
```

## Component Props Reference

### QRCodeDisplay

```typescript
interface QRCodeDisplayProps {
  data: string;              // QR code data (URL or text)
  title?: string;           // Display title
  description?: string;     // Optional description
  size?: number;            // QR code size (default: 300)
  showActions?: boolean;    // Show action buttons (default: true)
  className?: string;       // Additional CSS classes
  onDownload?: () => void;  // Download callback
  onShare?: () => void;     // Share callback
}
```

### TechnicianQRCard

```typescript
interface TechnicianQRCardProps {
  technicianId: string;     // Technician user ID
  technicianName: string;   // Full name
  service: string;          // Service category
  rating: number;          // Average rating
}
```

### BookingQR

```typescript
interface BookingQRProps {
  bookingId: string;        // Booking ID
  bookingRef: string;       // Booking reference number
  technicianName: string;   // Technician name
  technicianPhoto?: string; // Profile picture URL
  scheduledDate: string | Date;  // Scheduled date
  service?: string;        // Service type
  address?: string;        // Service address
}
```

### QRQuickAccess

```typescript
interface QRQuickAccessProps {
  technicianId?: string;   // Technician ID (for technicians)
  bookingId?: string;      // Current booking ID
  technicianName?: string; // Technician name
  service?: string;        // Service type
  rating?: number;        // Rating
  bookingRef?: string;    // Booking reference
  scheduledDate?: string; // Scheduled date
  address?: string;       // Address
}
```

### QRScanner

```typescript
interface QRScannerProps {
  onScan: (data: string) => void;  // Callback when QR detected
  onClose?: () => void;            // Close callback
}
```

## Usage Examples

### Generating a QR Code

```typescript
import { generateBrandedQRCode } from '@/lib/qrcode';

const qrUrl = await generateBrandedQRCode('https://example.com', {
  width: 300,
  errorCorrectionLevel: 'H'
});
```

### Displaying a QR Code

```tsx
import { QRCodeDisplay } from '@/components/qrcode';

<QRCodeDisplay
  data="https://dumuwaks.com/technicians/123"
  title="Scan to View Profile"
  description="View technician services"
  size={300}
/>
```

### Using the QR Scanner

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

### Quick Access QR Menu

```tsx
import { QRQuickAccess } from '@/components/qrcode';

<QRQuickAccess
  technicianId={user?._id}
  bookingId={currentBookingId}
/>
```

## Features by Role

### Customers
- View technician profile QR codes
- Share technician profiles
- Download QR codes for later use
- Access booking confirmation QR codes
- Install app via QR code

### Technicians
- Generate profile QR codes
- Share services easily
- Download promotional QR codes
- Display at job sites
- Business card integration

### Admin
- All customer and technician features
- Generate installation QR codes
- Create promotional materials
- Analytics on QR code usage (future)

## Browser Support

### QR Code Generation
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Works offline after first load

### QR Code Scanning
- Requires camera access
- HTTPS required (enforced by browsers)
- Mobile browsers with camera support
- jsQR library for detection

### Native Share API
- Chrome 24+
- Safari 12.2+
- Firefox 75+
- Edge 79+

## Testing Checklist

- [x] Generate QR code for technician profile
- [x] Download QR code as image
- [x] Share QR code via native share
- [x] Copy link to clipboard
- [x] QR code displays on technician profiles
- [x] PWA install QR works
- [x] Booking QR displays correctly
- [x] Quick access menu functional
- [x] Scanner component created (ready for integration)
- [x] All QR codes are scannable
- [x] Error handling for camera access
- [x] Fallback for manual entry
- [x] TypeScript compilation successful
- [x] Build successful with no errors

## Future Enhancements

1. **Analytics**
   - Track QR code scans
   - Monitor download counts
   - Share analytics

2. **Customization**
   - Custom colors per QR type
   - Logo upload options
   - Size presets

3. **Batch Generation**
   - Generate multiple QR codes
   - Export as PDF
   - Print-ready formats

4. **Advanced Scanner Features**
   - QR code history
   - Bulk scanning
   - Result validation

5. **Integration**
   - Business card templates
   - Marketing materials
   - Social media sharing

## File Structure

```
frontend/
├── src/
│   ├── lib/
│   │   └── qrcode.ts                          # QR generation utilities
│   ├── components/
│   │   └── qrcode/
│   │       ├── index.ts                       # Exports
│   │       ├── QRCodeDisplay.tsx              # Display component
│   │       ├── QRScanner.tsx                  # Scanner component
│   │       ├── TechnicianQRCard.tsx           # Technician QR
│   │       ├── PWAInstallQR.tsx               # Install QR
│   │       ├── BookingQR.tsx                  # Booking QR
│   │       └── QRQuickAccess.tsx              # Quick access menu
│   ├── hooks/
│   │   └── useQRScanner.ts                    # Scanner hook
│   ├── hooks/
│   │   └── useToast.ts                        # Toast hook (created)
│   ├── pages/
│   │   ├── InstallApp.tsx                     # Install page
│   │   ├── TechnicianProfile.tsx              # Updated
│   │   └── BookingDetail.tsx                  # Updated
│   └── components/layout/
│       └── Layout.tsx                         # Updated
```

## Best Practices

1. **QR Code Size**
   - Minimum 200x200 for scanning
   - Recommended 300x300 for good balance
   - Maximum 600x600 for high-resolution prints

2. **Error Correction**
   - L (Low) - 7% error correction
   - M (Medium) - 15% error correction (default)
   - Q (Quartile) - 25% error correction
   - H (High) - 30% error correction (for logos)

3. **Color Contrast**
   - Use high contrast colors
   - Dark on light preferred
   - Dumu Waks orange (#f97316) on white

4. **Mobile Optimization**
   - QR codes should be responsive
   - Test on real devices
   - Consider viewport meta tags

5. **Performance**
   - Generate QR codes on demand
   - Cache generated codes
   - Lazy load scanner component

## Support

For issues or questions about QR code features:
- Check component documentation above
- Review TypeScript interfaces
- Test on multiple devices
- Verify camera permissions
