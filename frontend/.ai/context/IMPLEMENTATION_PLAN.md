# Technician Work Gallery - Implementation Plan

## Overview
This document outlines the complete implementation plan for the Technician Work Gallery feature for the Dumu Waks platform.

## Feature Summary
Allow technicians to showcase their work with a 5-image gallery on their profile to build trust and attract customers.

## User Requirements
- **Primary Goal**: Showcase portfolio + Build trust (both equally)
- **Upload Method**: Manual upload anytime + After job completion (both methods)
- **Image Metadata**: Full details (photo URL, description, category, date, location)
- **Visibility**: Always public (no login required to view)

## Existing Infrastructure Analysis

### Backend
- **Model**: `User.js` has existing `PortfolioSchema` (lines 69-82) with basic structure
- **Routes**: `user.routes.js`, `media.routes.js`, `upload.routes.js`
- **Controllers**: `user.controller.js` has `getPortfolio()` function
- **Services**: `media.service.js` has Cloudinary integration with `uploadMultipleImages()`
- **Storage**: Cloudinary configured and working

### Frontend
- **Pages**: `TechnicianProfile.tsx` (view), `ProfileSettings.tsx` (edit)
- **Store**: Redux Toolkit with slices for auth, user, posts, bookings
- **Services**: API service structure in place
- **UI**: Button, Loading components available

### Database Schema (Existing in User.js)
```javascript
const PortfolioSchema = new Schema({
  title: String,
  description: String,
  images: [{
    url: String,
    publicId: String
  }],
  category: String,
  completedAt: Date,
  client: {
    name: String,
    testimonial: String
  }
}, { timestamps: true });
```

## Implementation Architecture

### Phase 1: Backend Implementation (Priority 1)

#### 1.1 Work Gallery Model Enhancement
**File**: `/backend/src/models/User.js`

**Action**: Enhance existing `PortfolioSchema` with new fields for work gallery:
- `isBeforeAfter`: Boolean - Tag for before/after pairing
- `pairId`: ObjectId - Link before/after images
- `order`: Number - Display sequence (1-5)
- `location`: String - Job location
- `serviceCategory`: String - Service type (plumbing, electrical, etc.)

#### 1.2 Work Gallery Controller
**File**: `/backend/src/controllers/workGallery.controller.js` (NEW)

**Functions**:
- `addWorkGalleryImage(req, res)` - Add single image with metadata
- `updateWorkGalleryImage(req, res)` - Update image metadata
- `deleteWorkGalleryImage(req, res)` - Delete image and Cloudinary file
- `reorderGalleryImages(req, res)` - Change display order
- `getTechnicianGallery(req, res)` - Get public gallery (no auth)
- `setBeforeAfterPair(req, res)` - Link before/after images

#### 1.3 Work Gallery Routes
**File**: `/backend/src/routes/workGallery.routes.js` (NEW)

**Endpoints**:
- `POST /api/v1/work-gallery` - Add work image
- `PUT /api/v1/work-gallery/:imageId` - Update image
- `DELETE /api/v1/work-gallery/:imageId` - Delete image
- `GET /api/v1/work-gallery/technician/:technicianId` - Get gallery (public)
- `PUT /api/v1/work-gallery/reorder` - Reorder images
- `POST /api/v1/work-gallery/before-after` - Set before/after pair

#### 1.4 Update User Controller
**File**: `/backend/src/controllers/user.controller.js`

**Action**: Update `getPortfolio()` to return work gallery images in the correct format

### Phase 2: Frontend Implementation (Priority 2)

#### 2.1 Work Gallery Service
**File**: `/frontend/src/services/workGallery.service.ts` (NEW)

**Functions**:
- `addWorkImage(data)` - Add image with metadata
- `updateWorkImage(imageId, data)` - Update image
- `deleteWorkImage(imageId)` - Delete image
- `getTechnicianGallery(technicianId)` - Get gallery
- `reorderGallery(images)` - Reorder images
- `setBeforeAfterPair(beforeId, afterId)` - Link before/after

#### 2.2 Redux Slice
**File**: `/frontend/src/store/slices/workGallerySlice.ts` (NEW)

**State**:
- `images`: WorkGalleryImage[]
- `isLoading`: boolean
- `error`: string | null

**Thunks**:
- `fetchTechnicianGallery(technicianId)`
- `addWorkImage(formData)`
- `updateWorkImage(imageId, data)`
- `deleteWorkImage(imageId)`
- `reorderGalleryImages(images)`

#### 2.3 Work Gallery Components
**Files**:
- `/frontend/src/components/workgallery/WorkGalleryCarousel.tsx` (NEW)
- `/frontend/src/components/workgallery/WorkGalleryUploadModal.tsx` (NEW)
- `/frontend/src/components/workgallery/WorkGalleryItem.tsx` (NEW)
- `/frontend/src/components/workgallery/BeforeAfterComparison.tsx` (NEW)

#### 2.4 Update Technician Profile Page
**File**: `/frontend/src/pages/TechnicianProfile.tsx`

**Action**: Add WorkGalleryCarousel component to display gallery

#### 2.5 Update Profile Settings Page
**File**: `/frontend/src/pages/ProfileSettings.tsx`

**Action**: Add "Manage Work Gallery" section with upload functionality

### Phase 3: Integration & Testing (Priority 3)

#### 3.1 Update Booking Completion Flow
**File**: `/frontend/src/pages/BookingDetail.tsx`

**Action**: Add prompt to upload work photos after booking completion

#### 3.2 Add Type Definitions
**File**: `/frontend/src/types/workGallery.ts` (NEW)

**Types**:
- `WorkGalleryImage`
- `WorkGalleryMetadata`
- `BeforeAfterPair`

#### 3.3 Testing
- Unit tests for controller functions
- Integration tests for API endpoints
- Component tests for React components
- E2E test for complete flow

## Database Schema Design

### Work Gallery Image Structure (Enhanced Portfolio Schema)
```javascript
{
  technicianId: ObjectId,  // Reference to User
  images: [{
    url: String,           // Cloudinary URL
    publicId: String,      // Cloudinary public ID for deletion
    caption: String,       // Description (max 500 chars)
    category: String,      // Service type (plumbing, electrical, etc.)
    date: Date,            // When work was done
    location: String,      // Job location
    isBeforeAfter: Boolean, // Tag for before/after pairing
    pairId: ObjectId,      // Link before/after images
    order: Number,         // Display sequence (1-5)
    createdAt: Date,
    updatedAt: Date
  }]
}
```

### Image Specifications (from research)
- **Optimal size**: 1280x769px (horizontal/landscape)
- **Max file size**: 2MB
- **Formats**: JPG, PNG
- **Cloudinary transformations**: Auto-quality, auto-format

## API Endpoint Specifications

### POST /api/v1/work-gallery
Add work gallery image

**Auth**: Required (technician only)
**Body**:
- `image`: File (multipart/form-data)
- `caption`: String (max 500)
- `category`: String (enum)
- `date`: Date
- `location`: String
- `isBeforeAfter`: Boolean
- `order`: Number

**Response**:
```json
{
  "success": true,
  "data": { /* WorkGalleryImage */ }
}
```

### GET /api/v1/work-gallery/technician/:technicianId
Get technician's work gallery (public)

**Auth**: Not required
**Response**:
```json
{
  "success": true,
  "data": {
    "technicianId": "...",
    "images": [ /* WorkGalleryImage[] */ ],
    "totalCount": 5
  }
}
```

### PUT /api/v1/work-gallery/:imageId
Update work gallery image metadata

**Auth**: Required (owner only)
**Body**:
- `caption`: String
- `category`: String
- `date`: Date
- `location`: String

### DELETE /api/v1/work-gallery/:imageId
Delete work gallery image

**Auth**: Required (owner only)

**Action**: Deletes from Cloudinary and database

## Component Specifications

### WorkGalleryCarousel
**Props**:
- `images`: WorkGalleryImage[]
- `editable`: boolean (default: false)

**Features**:
- Horizontal scroll carousel
- Swipe gestures for mobile
- Click to expand/lightbox
- Edit mode allows reorder/delete

### WorkGalleryUploadModal
**Props**:
- `isOpen`: boolean
- `onClose`: () => void
- `onUpload`: (data) => Promise<void>
- `currentImageCount`: number

**Features**:
- Drag and drop upload
- Image preview
- Metadata form (caption, category, date, location)
- Before/After toggle
- Validation (max 5 images, file size)

### BeforeAfterComparison
**Props**:
- `beforeImage`: WorkGalleryImage
- `afterImage`: WorkGalleryImage

**Features**:
- Side-by-side slider comparison
- Synced zoom/pan

## Implementation Order

### Sprint 1: Backend Foundation
1. Enhance PortfolioSchema in User model
2. Create workGallery.controller.js
3. Create workGallery.routes.js
4. Update server.js to register routes
5. Test API endpoints with Postman/curl

### Sprint 2: Frontend Foundation
1. Create workGallery.service.ts
2. Create workGallerySlice.ts
3. Create type definitions
4. Update store index.ts

### Sprint 3: Frontend Components
1. Create WorkGalleryCarousel component
2. Create WorkGalleryUploadModal component
3. Create BeforeAfterComparison component
4. Update TechnicianProfile page

### Sprint 4: Integration & Polish
1. Update ProfileSettings with gallery management
2. Update BookingDetail completion flow
3. Add loading states and error handling
4. Add accessibility features

## Success Metrics
- Technicians can upload up to 5 work images
- Images display publicly on technician profile
- Before/After comparison view works
- Upload from job completion flow works
- Mobile responsive carousel with swipe

## Risk Mitigation
- **Image storage costs**: Cloudinary auto-optimization to reduce bandwidth
- **Abuse**: Rate limiting on upload endpoints
- **Inappropriate content**: Admin moderation flag system
- **Performance**: Lazy loading for images, pagination if needed
