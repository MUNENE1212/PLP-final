# BaiTech Database Schema Summary

## Database Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     MERN STACK DATABASE LAYER                        │
│                         MongoDB + Mongoose                           │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    USERS     │  │   BOOKINGS   │  │ TRANSACTIONS │  │    POSTS     │
│              │  │              │  │              │  │              │
│ • Customer   │──│ • Customer   │──│ • Payer      │  │ • Author     │
│ • Technician │  │ • Technician │  │ • Payee      │  │ • Followers  │
│ • Admin      │  │ • Status FSM │  │ • Booking    │  │ • Likes      │
│ • Corporate  │  │ • Location   │  │ • Gateway    │  │ • Comments   │
│              │  │ • Pricing    │  │ • Escrow     │  │ • Portfolio  │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
       │                 │                  │                 │
       └─────────────────┴──────────────────┴─────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
         ┌──────────▼──────┐    ┌──────────▼──────────┐
         │    REVIEWS      │    │    CONVERSATIONS     │
         │                 │    │                      │
         │ • Rating 1-5    │    │ • Direct            │
         │ • Detailed      │    │ • Group             │
         │ • Sentiment     │    │ • Booking           │
         │ • Response      │    │ • Support           │
         └─────────────────┘    └──────────────────────┘
                                           │
                              ┌────────────┴────────────┐
                              │                         │
                   ┌──────────▼──────────┐   ┌─────────▼────────┐
                   │     MESSAGES        │   │  NOTIFICATIONS   │
                   │                     │   │                  │
                   │ • Text/Media        │   │ • Push/Email/SMS │
                   │ • Read Receipts     │   │ • Deep Links     │
                   │ • Reactions         │   │ • Grouped        │
                   │ • Attachments       │   │ • Priority       │
                   └─────────────────────┘   └──────────────────┘
```

## Collection Statistics

| Collection        | Purpose                          | Key Indexes              | Mobile Ready |
|-------------------|----------------------------------|--------------------------|--------------|
| **users**         | User profiles & authentication   | Geospatial, Text, Role   | ✅ FCM       |
| **bookings**      | Service bookings & FSM           | Location, Status, Date   | ✅           |
| **transactions**  | Payments & payouts               | Status, Gateway, User    | ✅           |
| **posts**         | Social feed & portfolios         | Engagement, Hashtags     | ✅           |
| **reviews**       | Ratings & testimonials           | User, Rating, Helpful    | ✅           |
| **conversations** | Chat rooms                       | Participants, Type       | ✅ Real-time |
| **messages**      | Chat messages                    | Conversation, Status     | ✅ Socket.io |
| **notifications** | Multi-channel notifications      | Recipient, Type, Read    | ✅ Deep Link |

## Relationships

### User Relationships
```
User (1) ──< Has Many >── (N) Bookings [as customer]
User (1) ──< Has Many >── (N) Bookings [as technician]
User (1) ──< Has Many >── (N) Posts
User (1) ──< Has Many >── (N) Reviews [received]
User (1) ──< Has Many >── (N) Reviews [given]
User (1) ──< Has Many >── (N) Transactions [as payer]
User (1) ──< Has Many >── (N) Transactions [as payee]
User (N) ──< Many to Many >── (N) Conversations
User (N) ──< Many to Many >── (N) Users [followers]
```

### Booking Relationships
```
Booking (1) ──< Has One >── (1) Transaction
Booking (1) ──< Has One >── (1) Conversation
Booking (1) ──< Has Many >── (N) Reviews [2 max]
Booking (1) ──< Belongs To >── (1) User [customer]
Booking (1) ──< Belongs To >── (1) User [technician]
```

### Conversation Relationships
```
Conversation (1) ──< Has Many >── (N) Messages
Conversation (1) ──< May Have One >── (1) Booking
Conversation (N) ──< Has Many >── (N) Users [participants]
```

## Key Features by Model

### 🧑 User Model
```javascript
✓ Multi-role system (Customer, Technician, Admin, Corporate)
✓ Geospatial location with 2dsphere index
✓ KYC verification with document storage
✓ Portfolio for technicians
✓ Availability scheduling (day/time slots)
✓ Skills with verification status
✓ Rating system (average + count)
✓ Social features (followers, following, posts count)
✓ FCM tokens for push notifications (iOS/Android/Web)
✓ 2FA support with speakeasy
✓ Password reset & email verification
✓ Login history & audit trail
```

### 📅 Booking Model
```javascript
✓ 16-state FSM with valid transitions
✓ Geospatial service location
✓ AI matching with alternative suggestions
✓ Dynamic pricing with platform fees
✓ Escrow payment support
✓ Cancellation fee calculation
✓ Dispute resolution system
✓ Quality assurance tracking
✓ Corporate booking support
✓ Warranty management
✓ Materials tracking
✓ Reminders & notifications
```

### 💳 Transaction Model
```javascript
✓ Multi-gateway (M-Pesa, Stripe, Cash, Wallet)
✓ Escrow with hold/release mechanism
✓ Split payments for platform fees
✓ Full & partial refunds
✓ Settlement tracking for payouts
✓ Webhook data storage
✓ Fraud detection integration
✓ Receipt & invoice generation
✓ Reconciliation support
✓ Real-time status tracking
```

### 📱 Post Model
```javascript
✓ 6 post types (text, image, video, portfolio, tip, question)
✓ Engagement tracking (likes, comments, shares, views)
✓ Portfolio showcase for technicians
✓ AI content moderation
✓ Hashtag extraction & search
✓ Mention support (@username)
✓ Feed algorithm with engagement scoring
✓ Recency decay factor
✓ Media storage via Cloudinary
✓ Infinite scroll pagination
```

### ⭐ Review Model
```javascript
✓ Overall rating (1-5 stars)
✓ 5 detailed rating categories
✓ Review with title & comment
✓ Image attachments
✓ Helpful voting system
✓ Business response capability
✓ AI sentiment analysis
✓ Verified purchase badge
✓ Featured reviews
✓ Rating distribution statistics
```

### 💬 Message Model
```javascript
✓ Text, image, video, audio, document, location
✓ Booking reference messages
✓ Call notifications (voice/video)
✓ Read receipts (multiple readers)
✓ Emoji reactions
✓ Reply/thread support
✓ Edit history
✓ Per-user deletion
✓ Search within conversation
```

### 👥 Conversation Model
```javascript
✓ Direct messages (1-on-1)
✓ Group chats
✓ Booking-specific conversations
✓ Support chat
✓ Per-user settings (mute, pin)
✓ Unread count tracking
✓ Participant management (add/remove)
✓ Last message optimization
✓ Archive/unarchive
```

### 🔔 Notification Model
```javascript
✓ 30+ notification types
✓ Multi-channel (Push, Email, SMS)
✓ Notification grouping
✓ Priority levels (low, normal, high, urgent)
✓ Deep links for mobile apps
✓ Delivery status tracking
✓ Category-based filtering
✓ Auto-expiry support
✓ Batch operations (mark all read)
```

## Indexing Strategy

### Geospatial Indexes (2dsphere)
```javascript
users.location.coordinates
bookings.serviceLocation.coordinates
```

### Text Search Indexes
```javascript
users: firstName, lastName, bio, skills.name, businessName
posts: caption, portfolioDetails.title, hashtags
reviews: title, comment
messages: text
bookings: bookingNumber, description, serviceType
```

### Compound Indexes
```javascript
users: (role, status, rating.average)
bookings: (customer, status, createdAt)
bookings: (technician, status, createdAt)
transactions: (payer, status, completedAt)
posts: (status, visibility, createdAt)
messages: (conversation, createdAt)
notifications: (recipient, isRead, createdAt)
```

### Unique Indexes
```javascript
users.email
users.phoneNumber
bookings.bookingNumber
transactions.transactionNumber
reviews: (booking, reviewerRole) // One review per role per booking
```

## Mobile App Integration Points

### Push Notifications (FCM)
```javascript
// User Model
fcmTokens: [{
  token: String,
  device: String,
  platform: 'ios' | 'android' | 'web',
  addedAt: Date
}]
```

### Deep Linking
```javascript
// Notification Model
deepLink: 'baitech://booking/123'
actionData: {
  action: 'view_booking',
  bookingId: '123'
}
```

### Real-time Events (Socket.io)
```javascript
Events to emit:
- new_message
- message_read
- booking_status_changed
- payment_received
- new_notification
- user_online
- user_typing
```

### Offline Support
```javascript
// All models include timestamps
createdAt: Date
updatedAt: Date

// Optimistic updates on client
// Sync queue for failed requests
// Conflict resolution: last-write-wins
```

## Performance Optimizations

### Caching Strategy (Redis)
```javascript
Cache Keys:
- user:{userId} → User profile (1 hour)
- feed:{userId} → User feed (10 minutes)
- technicians:nearby:{lat}:{lng} → Nearby techs (5 minutes)
- reviews:{userId} → User reviews (30 minutes)
- conversation:{id} → Conversation data (1 hour)
```

### Query Optimization
```javascript
// Use lean() for read-only queries
User.findById(id).lean()

// Select only required fields
User.findById(id).select('firstName lastName profilePicture')

// Limit populate depth
Booking.findById(id).populate('customer', 'firstName lastName')

// Use pagination
Post.find().skip(offset).limit(20)
```

### Aggregation Pipelines
```javascript
// Revenue analytics
Transaction.aggregate([
  { $match: { status: 'completed' } },
  { $group: { _id: '$type', total: { $sum: '$amount.gross' } } }
])

// User statistics
Review.aggregate([
  { $match: { reviewee: userId } },
  { $group: { _id: null, avg: { $avg: '$rating.overall' } } }
])
```

## Security Measures

### Password Security
```javascript
- Bcrypt hashing (12 rounds)
- Password strength validation
- Password reset tokens (SHA-256)
- Password history (prevent reuse)
```

### Token Security
```javascript
- JWT with short expiry (15 min)
- Refresh tokens (7 days)
- Token rotation on refresh
- Device tracking
- IP logging
```

### Data Protection
```javascript
- MongoDB injection prevention (mongo-sanitize)
- XSS prevention (xss-clean)
- Rate limiting (express-rate-limit)
- CORS with whitelist
- Helmet.js security headers
```

### GDPR Compliance
```javascript
- Consent tracking (gdprConsent)
- Data export capability
- Right to deletion (soft delete)
- Data anonymization
- Audit logs (loginHistory)
```

## Maintenance Operations

### Daily Tasks
```bash
# Cleanup old notifications
npm run cleanup

# Generate analytics reports
node scripts/generateReports.js
```

### Weekly Tasks
```bash
# Database backup
mongodump --uri="mongodb://..." --out=backup/

# Check index usage
db.users.aggregate([{ $indexStats: {} }])
```

### Monthly Tasks
```bash
# Archive old data
node scripts/archiveOldData.js

# Performance audit
node scripts/performanceAudit.js
```

## Estimated Data Growth

### Year 1 Projections
```
Users: 10,000 users
├─ Customers: 7,000
├─ Technicians: 2,500
└─ Corporate: 500

Bookings: 50,000 bookings
├─ Completed: 40,000
├─ Cancelled: 5,000
└─ Disputed: 500

Transactions: 45,000 transactions
Posts: 25,000 posts
Reviews: 35,000 reviews
Messages: 500,000 messages
Notifications: 1,000,000 notifications

Estimated DB Size: 15-20 GB
```

## Next Steps

### Phase 1 (Web App) - Completed ✅
- ✅ Database schemas designed
- ✅ Indexes configured
- ✅ Mobile-ready architecture
- ✅ Real-time support

### Phase 2 (Mobile App)
- [ ] React Native app development
- [ ] Push notification service
- [ ] Deep linking configuration
- [ ] Offline sync implementation
- [ ] Socket.io mobile client

### Phase 3 (Scaling)
- [ ] Database sharding (if needed)
- [ ] Read replicas for analytics
- [ ] CDN for static assets
- [ ] Microservices architecture (optional)

## Database Connection String

### Development (Local)
```
mongodb://localhost:27017/baitech
```

### Production (MongoDB Atlas)
```
mongodb+srv://username:password@cluster.mongodb.net/baitech?retryWrites=true&w=majority
```

### Testing
```
mongodb://localhost:27017/baitech_test
```

## Environment Variables Required

```env
# Database
MONGODB_URI=<connection_string>
REDIS_URL=<redis_url>

# Authentication
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>

# File Storage
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>

# Notifications
FIREBASE_PROJECT_ID=<project_id>
FIREBASE_PRIVATE_KEY=<key>
AT_API_KEY=<africa_talking_key>

# Payments
MPESA_CONSUMER_KEY=<key>
MPESA_CONSUMER_SECRET=<secret>
STRIPE_SECRET_KEY=<key>
```

---

## Summary

This database schema provides a **production-ready, scalable foundation** for the BaiTech platform with:

✅ **8 comprehensive models** covering all core functionality
✅ **Mobile-first architecture** with FCM, deep linking, and real-time support
✅ **Advanced features** like FSM, geospatial search, AI integration
✅ **Performance optimizations** with strategic indexing and caching
✅ **Security best practices** with encryption, sanitization, and GDPR compliance
✅ **Seamless Phase 2 transition** to mobile apps with minimal changes

**Database is ready for immediate implementation!** 🚀
