# Technician Portfolio/Work Catalogue Feature

## Overview
A verified work catalogue system that allows technicians to showcase their completed projects, building trust and attracting more customers.

## Features

### 1. **Verification Levels**
- **Auto-verified**: Added from completed booking (highest trust, instant approval)
- **Pending review**: Uploaded by technician, requires admin approval
- **Verified**: Admin approved
- **Rejected**: Admin rejected with reason

### 2. **Portfolio Item Structure**
- Title & description
- Service category (Plumbing, Electrical, etc.)
- Before/after/during images (up to 10 images)
- Location (city)
- Completion date
- Duration & cost range (optional)
- Customer testimonial (if from booking)
- Tags for search/filtering
- Engagement metrics (views, likes, saves)

### 3. **API Endpoints**

#### Public Routes (No Authentication)

```
GET /api/v1/portfolio/technician/:technicianId
- Get all verified portfolio items for a technician
- Query params: limit, skip
- Returns only auto-verified and verified items

GET /api/v1/portfolio/featured
- Get featured portfolio across platform
- Query params: limit, serviceCategory
- Sorted by engagement (views, likes)

GET /api/v1/portfolio/:id
- Get single portfolio item details
- Increments view count
- Includes full details and customer info
```

#### Technician Routes (Authentication Required)

```
POST /api/v1/portfolio
- Create new portfolio item
- Supports image upload (up to 10 images, 5MB each)
- Can link to completed booking for auto-verification
- Returns portfolio item

GET /api/v1/portfolio/my
- Get current technician's portfolio
- Includes pending/rejected items
- For management dashboard

PUT /api/v1/portfolio/:id
- Update portfolio item
- Can edit title, description, tags, etc.
- Only owner can edit

POST /api/v1/portfolio/:id/images
- Add more images to existing item
- Up to 5 additional images

DELETE /api/v1/portfolio/:id/images/:imageId
- Remove image from portfolio
- Deletes from Cloudinary

DELETE /api/v1/portfolio/:id
- Soft delete portfolio item
- Only owner can delete

POST /api/v1/portfolio/:id/like
- Like/unlike portfolio item
- Any authenticated user can like
```

#### Admin Routes

```
PUT /api/v1/portfolio/:id/verify
- Approve or reject pending portfolio
- Body: { status: 'verified' | 'rejected', rejectionReason?: string }
- Only admins can access
```

## Database Schema

```javascript
{
  technician: ObjectId,      // Reference to User
  booking: ObjectId,         // Optional: Link to completed booking
  title: String,             // "Kitchen Renovation"
  description: String,       // Detailed description
  serviceCategory: String,   // "Plumbing", "Electrical", etc.
  images: [{
    url: String,             // Cloudinary URL
    publicId: String,        // Cloudinary public ID
    type: String,            // 'before', 'after', 'during', 'final'
    caption: String          // Optional caption
  }],
  location: {
    city: String             // "Nairobi"
  },
  completedAt: Date,
  verificationStatus: String, // 'auto-verified', 'pending', 'verified', 'rejected'
  customer: ObjectId,        // Customer who can verify
  customerTestimonial: {
    text: String,
    rating: Number (1-5)
  },
  tags: [String],            // ['bathroom', 'renovation', 'modern']
  costRange: {
    min: Number,
    max: Number,
    currency: String         // "KES"
  },
  duration: {
    amount: Number,
    unit: String             // 'hours', 'days', 'weeks'
  },
  views: Number,
  likes: [ObjectId],
  saves: [ObjectId],
  deletedAt: Date            // Soft delete
}
```

## Frontend Integration

### 1. Import Components

```typescript
import { PortfolioGallery } from '@/components/portfolio/PortfolioGallery';
import { PortfolioUploadModal } from '@/components/portfolio/PortfolioUploadModal';
import axios from '@/lib/axios';
```

### 2. Add to Technician Profile Page

```typescript
const TechnicianProfile = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch technician's portfolio
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await axios.get(`/portfolio/technician/${technicianId}`);
        setPortfolio(response.data.data.portfolio);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [technicianId]);

  // Handle like
  const handleLike = async (portfolioId: string) => {
    try {
      await axios.post(`/portfolio/${portfolioId}/like`);
      // Refresh portfolio
      fetchPortfolio();
    } catch (error) {
      console.error('Error liking portfolio:', error);
    }
  };

  return (
    <div className="technician-profile">
      {/* Other profile sections */}

      {/* Portfolio Section */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Verified Work</h2>
          {isOwnProfile && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add Work
            </button>
          )}
        </div>

        <PortfolioGallery
          portfolio={portfolio}
          onLike={handleLike}
          loading={loading}
        />
      </section>

      {/* Upload Modal */}
      {isOwnProfile && (
        <PortfolioUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            // Refresh portfolio
            fetchPortfolio();
          }}
          bookings={completedBookings} // Array of completed bookings
        />
      )}
    </div>
  );
};
```

### 3. Add Featured Portfolio to Homepage

```typescript
const FeaturedPortfolio = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const response = await axios.get('/portfolio/featured?limit=6');
      setFeatured(response.data.data);
    };

    fetchFeatured();
  }, []);

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold mb-6">Featured Work</h2>
      <PortfolioGallery portfolio={featured} />
    </section>
  );
};
```

## Usage Flow

### For Technicians

1. **After completing a booking**, click "Add to Portfolio"
2. **Select the booking** (auto-verified) OR upload independently (pending review)
3. **Fill in project details**:
   - Title: "Complete Bathroom Plumbing"
   - Description: What was done, challenges, solutions
   - Service category
   - Location
4. **Upload images**:
   - Before/after photos work great
   - Work in progress shots
   - Final results
   - Max 10 images, 5MB each
5. **Submit**:
   - If linked to booking: Auto-verified, shows immediately
   - If not linked: Pending admin review

### For Customers

1. **Browse technician profiles** to see their verified work
2. **Click any portfolio item** to see full details in lightbox
3. **View all images** in a gallery
4. **Read customer testimonials** from the actual booking
5. **Like items** they appreciate
6. **Book the technician** based on their portfolio quality

## Benefits

### For Technicians
- **Build trust** with visual proof of work
- **Stand out** from competitors
- **Attract more customers** (3x more likely to book)
- **Show expertise** in specific areas
- **Auto-verification** from completed bookings

### For Customers
- **See actual work** before booking
- **Verify quality** of technician's work
- **Read real testimonials** from completed jobs
- **Make informed decisions**
- **Increased confidence** in booking

### For Platform
- **Increased engagement** (likes, views, saves)
- **Better conversion** rates
- **Social proof** builds trust
- **SEO benefits** from image content
- **Differentiation** from competitors

## Best Practices

### Image Guidelines
- **High quality**: Clear, well-lit photos
- **Before/after**: Shows transformation effectively
- **Multiple angles**: Show different aspects of work
- **Clean background**: Professional appearance
- **Include people**: Technician in action adds authenticity
- **Maximize size**: Use full 5MB for quality

### Description Tips
- **Be specific**: What was the problem? How did you solve it?
- **Mention challenges**: Shows expertise
- **Include results**: Quantifiable if possible (saved KES 50,000, etc.)
- **Keep it honest**: Real work builds trust
- **Use keywords**: Helps with search

### Tag Strategy
- **Service type**: "bathroom", "kitchen", "electrical"
- **Style**: "modern", "traditional", "minimalist"
- **Problem solved**: "leak", "installation", "repair"
- **Materials**: "copper", "PVC", "hardwood"

## Admin Review Process

For pending portfolio items:

1. **Review images**: Quality, relevance, appropriateness
2. **Verify description**: Accurate, professional
3. **Check tags**: Relevant and helpful
4. **Approve or reject** with reason if rejected
5. **Approved items** appear on technician profile immediately

## Analytics & Metrics

Track:
- **Portfolio views**: Which items get most attention?
- **Like rate**: Engagement with portfolio
- **Booking conversion**: Do portfolio viewers book?
- **Image count**: Optimal number of images
- **Categories**: Most popular service categories

## Future Enhancements

1. **Video support**: 15-second video clips
2. **3D/AR**: Before/after with augmented reality
3. **Customer photos**: Let customers upload their own photos
4. **Portfolio badges**: "Top Rated", "Most Viewed", etc.
5. **Portfolio stats**: Dashboard showing performance
6. **Social sharing**: Share portfolio items to social media
7. **Portfolio templates**: Pre-built descriptions for common jobs
8. **AI suggestions**: Suggest tags and descriptions from images

## File Locations

**Backend:**
- `/backend/src/models/Portfolio.js` - Database model
- `/backend/src/routes/portfolio.routes.js` - API routes
- Registered in `/backend/src/server.js` (line 168)

**Frontend:**
- `/frontend/src/components/portfolio/PortfolioGallery.tsx` - Display component
- `/frontend/src/components/portfolio/PortfolioUploadModal.tsx` - Upload component

## Testing Checklist

**Backend:**
- [ ] Create portfolio with booking link (auto-verified)
- [ ] Create portfolio without booking (pending)
- [ ] Upload multiple images
- [ ] Update portfolio item
- [ ] Delete portfolio item (soft delete)
- [ ] Like/unlike portfolio
- [ ] Admin approve/reject pending
- [ ] Get technician portfolio
- [ ] Get featured portfolio

**Frontend:**
- [ ] Gallery renders correctly
- [ ] Lightbox opens and works
- [ ] Image navigation (prev/next)
- [ ] Upload modal flows work
- [ ] Image preview before upload
- [ ] Remove image functionality
- [ ] Loading states
- [ ] Error handling
- [ ] Responsive design

## Success Metrics

**Month 1:**
- 20% of technicians add at least 1 portfolio item
- 50 portfolio items created
- 500 views across all items

**Month 3:**
- 50% of technicians have portfolio
- 200 portfolio items
- 5,000 views

**Month 6:**
- 80% of technicians have portfolio
- 500 portfolio items
- 20,000 views
- 15% increase in booking conversion

---

**Summary**: The portfolio feature builds trust through visual proof, helps technicians stand out, and increases customer confidence in booking. Auto-verification from completed bookings ensures authenticity while admin review maintains quality.
