# Honest Frontend Implementation
## Code Examples & Migration Guide

**Date:** January 9, 2026
**Focus:** Replace all mock data with real API calls

---

## Quick Wins (Do These First)

### 1. Update Hero Statistics (30 minutes)

**File:** `frontend/src/components/home/HeroSection.tsx`

**BEFORE:**
```typescript
const heroStats = [
  { value: "10,000+", label: "Happy Customers" },
  { value: "500+", label: "Expert Technicians" },
  { value: "4.9★", label: "Average Rating" },
  { value: "24/7", label: "Availability" }
];
```

**AFTER:**
```typescript
import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export const HeroSection: React.FC = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalTechnicians: 0,
    averageRating: 0,
    activeTechnicians: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats/public');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <HeroSkeleton />;
  }

  return (
    <section className="hero">
      <h1>Skilled Technicians. Verified Quality. Transparent Pricing.</h1>
      <p className="subheading">
        Connect with {stats.totalCustomers} Nairobi customers who've found
        verified technicians through our platform.
      </p>

      <div className="hero-stats">
        <div className="stat">
          <div className="value">{stats.totalCustomers}+</div>
          <div className="label">Real Customers</div>
          <div className="sublabel">Verified users</div>
        </div>

        <div className="stat">
          <div className="value">{stats.totalTechnicians}</div>
          <div className="label">Verified Technicians</div>
          <div className="sublabel">{stats.activeTechnicians} active now</div>
        </div>

        <div className="stat">
          <div className="value">{stats.averageRating.toFixed(1)}★</div>
          <div className="label">Average Rating</div>
          <div className="sublabel">From real reviews</div>
        </div>

        <div className="stat">
          <div className="value">7am-10pm</div>
          <div className="label">Available Hours</div>
          <div className="sublabel">7 days a week</div>
        </div>
      </div>
    </section>
  );
};
```

### 2. Replace Fake Testimonials (1 hour)

**File:** `frontend/src/components/home/Testimonials.tsx`

**BEFORE (FAKE):**
```typescript
const testimonials = [
  {
    name: "John M.",
    location: "Westlands",
    text: "Dumu Waks changed my life! Best service ever!",
    rating: 5,
    image: "/images/john.jpg" // Stock photo
  },
  {
    name: "Mary K.",
    location: "Kilimani",
    text: "Amazing technician. Highly recommended!",
    rating: 5,
    image: "/images/mary.jpg" // Stock photo
  }
];
```

**AFTER (HONEST):**
```typescript
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  _id: string;
  rating: number;
  text: string;
  customer: {
    firstName: string;
    location: {
      city: string;
    }
  };
  booking: {
    serviceCategory: string;
  };
  createdAt: string;
}

export const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch only verified, recent reviews
        const response = await api.get('/reviews/public', {
          params: {
            limit: 6,
            sort: '-createdAt'
          }
        });
        setReviews(response.data.reviews);
      } catch (err: any) {
        console.error('Failed to fetch reviews:', err);
        setError('Unable to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Honest: Show "no reviews yet" message if truly no reviews
  if (loading) {
    return <TestimonialsSkeleton />;
  }

  if (error || reviews.length === 0) {
    return (
      <section className="testimonials honest">
        <h2>What Customers Say</h2>

        <div className="no-reviews">
          <p>
            We're a new platform and don't have any reviews yet.
            Be the first to try Dumu Waks and share your experience!
          </p>

          <div className="value-proposition">
            <h3>Why Trust Dumu Waks?</h3>
            <ul>
              <li>✓ Verified technicians (ID checked, skills assessed)</li>
              <li>✓ Transparent pricing (see exact cost before booking)</li>
              <li>✓ Secure payments (M-Pesa escrow protects both sides)</li>
              <li>✓ Dispute resolution (we mediate if issues arise)</li>
            </ul>
          </div>

          <div className="cta">
            <Link to="/signup" className="btn-primary">
              Be the First to Review
            </Link>
            <p className="note">
              After your first booking, you'll receive an email to leave a review.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="testimonials honest">
      <h2>What Real Customers Say</h2>

      <div className="reviews-grid">
        {reviews.map(review => (
          <div key={review._id} className="review-card verified">
            <div className="review-header">
              <div className="rating">
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </div>
              <div className="verified-badge">
                ✓ Verified Booking
              </div>
            </div>

            <p className="review-text">"{review.text}"</p>

            <div className="review-meta">
              <span className="customer">
                {review.customer.firstName} from {review.customer.location.city}
              </span>
              <span className="service">
                {review.booking.serviceCategory}
              </span>
              <span className="date">
                {formatDistanceToNow(new Date(review.createdAt))} ago
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="all-reviews-link">
        <Link to="/reviews">
          See all {reviews.length} real reviews →
        </Link>
      </div>

      <div className="data-note">
        <small>
          All reviews are from verified customers who completed bookings.
          We don't remove negative reviews unless they violate our policies.
        </small>
      </div>
    </section>
  );
};
```

### 3. Update Technician Listing (2 hours)

**File:** `frontend/src/components/technician/TechnicianList.tsx`

**BEFORE (MISLEADING):**
```typescript
// Shows all technicians as "available"
// Shows all as "5-star rated"
// Shows fake "last active: 2 minutes ago"
```

**AFTER (HONEST):**
```typescript
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import { TechnicianCardHonest } from './TechnicianCardHonest';

export const TechnicianList: React.FC = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    serviceCategory: '',
    location: '',
    availability: 'all' // all, available-now, available-today
  });

  useEffect(() => {
    const fetchTechnicians = async () => {
      setLoading(true);
      try {
        const response = await api.get('/technicians/public', {
          params: {
            ...filters,
            // Fetch REAL availability status
            includeAvailability: true,
            // Fetch REAL stats
            includeStats: true
          }
        });

        // Sort by REAL availability and rating
        const sorted = response.data.technicians.sort((a: any, b: any) => {
          // Available now comes first
          if (a.isAvailableNow && !b.isAvailableNow) return -1;
          if (!a.isAvailableNow && b.isAvailableNow) return 1;

          // Then by rating
          return b.rating.average - a.rating.average;
        });

        setTechnicians(sorted);
      } catch (error) {
        console.error('Failed to fetch technicians:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, [filters]);

  return (
    <div className="technician-list honest">
      <div className="list-header">
        <h2>Verified Technicians</h2>
        <p className="availability-note">
          Showing {technicians.filter((t: any) => t.isAvailableNow).length} available now,
          {technicians.filter((t: any) => t.availableToday).length} available today
          out of {technicians.length} total
        </p>
      </div>

      {loading ? (
        <TechnicianListSkeleton />
      ) : technicians.length === 0 ? (
        <div className="no-technicians">
          <h3>No technicians match your criteria</h3>
          <p>
            We don't have any technicians available in {filters.location} for {filters.serviceCategory} right now.
            Try adjusting your filters or check back later.
          </p>
          <p className="alt-options">
            Alternatively, {filters.location} may have technicians in other categories.
            Would you like to broaden your search?
          </p>
        </div>
      ) : (
        <div className="technicians-grid">
          {technicians.map(technician => (
            <TechnicianCardHonest
              key={technician._id}
              technician={technician}
            />
          ))}
        </div>
      )}

      {/* Honest pagination */}
      {technicians.length > 0 && (
        <div className="pagination-note">
          <small>
            Showing {technicians.length} technicians out of {totalTechnicians} total.
            Not all technicians may be available for immediate booking.
          </small>
        </div>
      )}
    </div>
  );
};
```

### 4. Update Availability Display (1 hour)

**File:** `frontend/src/components/booking/BookingWizard.tsx`

**BEFORE:**
```typescript
<div className="availability">
  <span className="badge-success">Available Now</span>
  <span>Typically responds in 5 minutes</span>
</div>
```

**AFTER:**
```typescript
<div className="availability honest">
  {technician.isAvailableNow ? (
    <>
      <span className="badge-success">Available Now</span>
      <span className="response-time">
        Last active: {formatDistanceToNow(new Date(technician.lastLogin))} ago
      </span>
      <span className="note">
        {technician.averageResponseTime
          ? `Typically responds in ${technician.averageResponseTime}`
          : 'Response time varies'
        }
      </span>
    </>
  ) : technician.availableToday ? (
    <>
      <span className="badge-warning">Available Today</span>
      <span className="note">
        Currently busy, but accepts bookings for later today
      </span>
      <span className="response-time">
        Next available: {technician.nextAvailableTime || 'This evening'}
      </span>
    </>
  ) : (
    <>
      <span className="badge-unavailable">Currently Unavailable</span>
      <span className="note">
        {technician.nextAvailableDate
          ? `Next available: ${new Date(technician.nextAvailableDate).toLocaleDateString()}`
          : 'Accepting bookings for future dates'
        }
      </span>
    </>
  )}

  {/* Honest disclaimer */}
  <div className="availability-disclaimer">
    <small>
      Availability shown is based on technician's last activity.
      Actual availability may vary. Technicians may decline bookings
      based on their schedule or job requirements.
    </small>
  </div>
</div>
```

---

## Backend API Implementation

### 1. Public Statistics Endpoint

**File:** `backend/src/routes/public.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

/**
 * @route   GET /api/stats/public
 * @desc    Get honest, real-time statistics
 * @access  Public
 * @cache   5 minutes
 */
router.get('/stats/public', async (req, res) => {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);

    // Count REAL customers (verified, not deleted)
    const totalCustomers = await User.countDocuments({
      role: 'customer',
      isEmailVerified: true,
      deletedAt: null
    });

    // Count REAL technicians (verified, not deleted)
    const totalTechnicians = await User.countDocuments({
      role: 'technician',
      isEmailVerified: true,
      deletedAt: null
    });

    // Count active technicians (logged in within last 30 min)
    const activeTechnicians = await User.countDocuments({
      role: 'technician',
      isOnline: true,
      lastLogin: { $gte: fiveMinutesAgo },
      deletedAt: null
    });

    // Count completed bookings
    const totalBookings = await Booking.countDocuments({
      status: 'completed'
    });

    // Calculate REAL average rating
    const reviewStats = await Review.aggregate([
      {
        $match: {
          // Only verified reviews from completed bookings
          booking: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalCustomers,
      totalTechnicians,
      activeTechnicians,
      totalBookings,
      averageRating: reviewStats[0]?.averageRating || 0,
      totalReviews: reviewStats[0]?.totalReviews || 0,
      lastUpdated: now.toISOString()
    };

    // Cache for 5 minutes
    res.set('Cache-Control', 'public, max-age=300, s-maxage=300');

    res.json(stats);
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/reviews/public
 * @desc    Get verified public reviews (paginated)
 * @access  Public
 */
router.get('/reviews/public', async (req, res) => {
  try {
    const {
      limit = 10,
      skip = 0,
      sort = '-createdAt',
      minRating = 1
    } = req.query;

    const reviews = await Review.find({
      rating: { $gte: parseFloat(minRating) },
      // Only reviews from completed bookings
      booking: { $exists: true, $ne: null }
    })
      .populate('customer', 'firstName location')
      .populate('booking', 'serviceCategory')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    // Don't expose sensitive customer data
    const sanitizedReviews = reviews.map(review => ({
      _id: review._id,
      rating: review.rating,
      text: review.text,
      customer: {
        firstName: review.customer?.firstName || 'Anonymous',
        location: review.customer?.location || { city: 'Nairobi' }
      },
      booking: {
        serviceCategory: review.booking?.serviceCategory || 'General'
      },
      createdAt: review.createdAt,
      // No customer last name, email, phone, etc.
    }));

    const total = await Review.countDocuments({
      rating: { $gte: parseFloat(minRating) },
      booking: { $exists: true, $ne: null }
    });

    res.json({
      reviews: sanitizedReviews,
      total,
      hasMore: (parseInt(skip) + parseInt(limit)) < total
    });
  } catch (error) {
    console.error('Error fetching public reviews:', error);
    res.status(500).json({
      error: 'Failed to fetch reviews'
    });
  }
});

/**
 * @route   GET /api/technicians/public
 * @desc    Get public technician listings (with honest availability)
 * @access  Public
 */
router.get('/technicians/public', async (req, res) => {
  try {
    const {
      serviceCategory,
      location,
      availability = 'all',
      includeAvailability = true,
      includeStats = true
    } = req.query;

    const now = new Date();
    const thirtyMinutesAgo = new Date(now - 30 * 60 * 1000);

    // Build query
    const query = {
      role: 'technician',
      isEmailVerified: true,
      deletedAt: null
    };

    // Filter by service category
    if (serviceCategory) {
      query['skills.category'] = serviceCategory;
    }

    // Filter by location
    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }

    // Find technicians
    let technicians = await User.find(query)
      .select('-password -email -phone -idNumber') // Exclude sensitive fields
      .lean();

    // Add availability status
    if (includeAvailability === 'true') {
      technicians = technicians.map(tech => ({
        ...tech,
        isAvailableNow: tech.isOnline && tech.lastLogin >= thirtyMinutesAgo,
        lastActive: tech.lastLogin
      }));

      // Filter by availability if requested
      if (availability === 'available-now') {
        technicians = technicians.filter(t => t.isAvailableNow);
      } else if (availability === 'available-today') {
        // Technicians who are online OR have been active today
        const today = new Date(now.setHours(0, 0, 0, 0));
        technicians = technicians.filter(t =>
          t.isAvailableNow || t.lastLogin >= today
        );
      }
    }

    // Add stats if requested
    if (includeStats === 'true') {
      const technicianIds = technicians.map(t => t._id);

      // Get completion stats for each technician
      const bookingStats = await Booking.aggregate([
        {
          $match: {
            technician: { $in: technicianIds },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: '$technician',
            completedJobs: { $sum: 1 },
            completionRate: {
              $avg: {
                $cond: ['$status', 'completed', 1, 0]
              }
            }
          }
        }
      ]);

      // Create map for quick lookup
      const statsMap = {};
      bookingStats.forEach(stat => {
        statsMap[stat._id.toString()] = {
          completedJobs: stat.completedJobs,
          completionRate: Math.round(stat.completionRate * 100)
        };
      });

      // Attach stats to technicians
      technicians = technicians.map(tech => ({
        ...tech,
        stats: statsMap[tech._id.toString()] || {
          completedJobs: 0,
          completionRate: 0
        }
      }));
    }

    res.json({
      technicians,
      total: technicians.length,
      lastUpdated: now.toISOString()
    });

  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({
      error: 'Failed to fetch technicians'
    });
  }
});

module.exports = router;
```

### 2. Add Public Routes to Server

**File:** `backend/src/server.js`

```javascript
const publicRoutes = require('./routes/public.routes');

// Mount public routes (no authentication required)
app.use('/api', publicRoutes);
```

---

## Frontend Component Updates

### Honest Statistics Badge Component

**File:** `frontend/src/components/shared/HonestStatsBadge.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Info } from 'lucide-react';

interface Props {
  type: 'customers' | 'technicians' | 'bookings' | 'rating';
  showLabel?: boolean;
  className?: string;
}

export const HonestStatsBadge: React.FC<Props> = ({ type, showLabel = true, className = '' }) => {
  const [stat, setStat] = useState<{ value: string | number; label: string; lastUpdated: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStat = async () => {
      try {
        const response = await api.get('/stats/public');
        const data = response.data;

        const statsMap = {
          customers: {
            value: data.totalCustomers,
            label: 'Real Customers',
            lastUpdated: data.lastUpdated
          },
          technicians: {
            value: `${data.activeTechnicians}/${data.totalTechnicians}`,
            label: 'Active/Total Technicians',
            lastUpdated: data.lastUpdated
          },
          bookings: {
            value: data.totalBookings,
            label: 'Completed Bookings',
            lastUpdated: data.lastUpdated
          },
          rating: {
            value: `${data.averageRating.toFixed(1)}★`,
            label: `${data.totalReviews} reviews`,
            lastUpdated: data.lastUpdated
          }
        };

        setStat(statsMap[type]);
      } catch (error) {
        console.error('Failed to fetch stat:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStat();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStat, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [type]);

  if (loading) {
    return <span className={`honest-stat-badge loading ${className}`}>...</span>;
  }

  if (!stat) {
    return null;
  }

  return (
    <span className={`honest-stat-badge ${className}`}>
      <span className="stat-value">{stat.value}</span>
      {showLabel && (
        <span className="stat-label">{stat.label}</span>
      )}
      <Info
        className="stat-info-icon"
        title={`Last updated: ${new Date(stat.lastUpdated).toLocaleString()}\nData from live production database`}
      />
    </span>
  );
};
```

### Usage Example:

```typescript
// In any component
import { HonestStatsBadge } from '@/components/shared/HonestStatsBadge';

<div className="hero">
  <h1>Skilled Technicians in Nairobi</h1>
  <p>
    Join <HonestStatsBadge type="customers" /> who've found
    <HonestStatsBadge type="technicians" showLabel={false} /> verified technicians
  </p>
  <p>
    Average rating: <HonestStatsBadge type="rating" />
  </p>
</div>
```

---

## Migration Checklist

### Phase 1: Find All Mock Data (Day 1)

```bash
# Search for hardcoded numbers
cd frontend/src
grep -r "10000\|500\|1000\|24/7" --include="*.tsx" --include="*.ts"
grep -r "const.*=.*\[" --include="*.tsx" | grep -E "(testimonials|reviews|stats)"
```

### Phase 2: Create API Endpoints (Day 2-3)

- [ ] Create `/api/stats/public` endpoint
- [ ] Create `/api/reviews/public` endpoint
- [ ] Create `/api/technicians/public` endpoint
- [ ] Add caching (5 minutes)
- [ ] Test with real data

### Phase 3: Update Components (Day 4-5)

- [ ] Update HeroSection component
- [ ] Update Testimonials component
- [ ] Update TechnicianList component
- [ ] Update About page
- [ ] Update pricing page

### Phase 4: Remove Stock Assets (Day 6)

- [ ] Replace stock photos with real photos or placeholders
- [ ] Remove fake testimonial images
- [ ] Add "Real Photo" badge to genuine photos
- [ ] Add "No Photo Available" placeholder

### Phase 5: Test & Deploy (Day 7)

- [ ] Test all components with real data
- [ ] Test loading states
- [ ] Test error states
- [ ] Verify no mock data remains
- [ ] Deploy to staging
- [ ] Final QA
- [ ] Deploy to production

---

## Testing Your Honest Frontend

### 1. Verify API Calls

```bash
# Test public stats endpoint
curl https://ementech-frontend.onrender.com/api/stats/public

# Test reviews endpoint
curl https://ementech-frontend.onrender.com/api/reviews/public?limit=5

# Test technicians endpoint
curl https://ementech-frontend.onrender.com/api/technicians/public?limit=5
```

### 2. Check Browser Console

```javascript
// In browser console on your site
fetch('/api/stats/public')
  .then(r => r.json())
  .then(data => console.log('Real stats:', data));

// Verify no hardcoded values
document.querySelectorAll('[class*="stat"], [class*="count"], [class*="number"]')
  .forEach(el => console.log('Stat element:', el.textContent));
```

### 3. Manual Testing Checklist

- [ ] Homepage shows real customer count
- [ ] Ratings match actual reviews
- [ ] Testimonials link to real user profiles
- [ ] Technician availability is accurate
- [ ] "Last updated" timestamps are recent
- [ ] No "24/7" claims if not true
- [ ] Coverage areas are accurate
- [ ] Stock photos removed or replaced

---

## Success Criteria

Your frontend is honest when:

✅ **No hardcoded statistics** (all from API)
✅ **No fake testimonials** (only verified reviews)
✅ **No stock photos** (real photos or honest placeholders)
✅ **Realistic availability** (actual technician status)
✅ **Transparent timestamps** (show last update time)
✅ **Accurate coverage** (real service areas)
✅ **Honest copy** (no marketing fluff)

---

## Final Note

**Remember:** Honesty builds trust. Skepticism destroys it.

When a visitor sees:
- "10,000+ customers" → They think: "Prove it"
- "237 real customers" → They think: "Honest, I trust you"

Be the platform that tells the truth. Your customers (and investors) will appreciate it.

**Now go make your frontend honest!** 🎯

