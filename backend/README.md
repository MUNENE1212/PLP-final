# BaiTech Backend - MongoDB Database Schemas

## Overview

This is the backend implementation for the BaiTech AI-Powered Technician & Community Platform. The database schemas are designed to support both web and mobile applications (Phase 2) with a focus on scalability, performance, and maintainability.

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Caching**: Redis
- **Real-time**: Socket.io
- **Authentication**: JWT + Refresh Tokens
- **File Storage**: Cloudinary
- **Payment Gateways**: M-Pesa, Stripe

## Database Schema Overview

### 1. **User Model** (`/src/models/User.js`)

Comprehensive user schema supporting multiple roles with role-specific fields.

**Key Features:**
- Multi-role support (Customer, Technician, Admin, Corporate)
- Geospatial location indexing for proximity searches
- KYC verification fields
- Portfolio management for technicians
- Availability scheduling
- FCM tokens for push notifications (mobile-ready)
- Social features (followers, following)
- Comprehensive rating system

**Important Indexes:**
- Geospatial index on `location.coordinates` (2dsphere)
- Text search on name, skills, and bio
- Compound indexes on role, status, and ratings

**Mobile App Considerations:**
- FCM tokens array for iOS/Android push notifications
- Platform-specific device tracking
- Offline-first data structure

### 2. **Booking Model** (`/src/models/Booking.js`)

Advanced booking system with Finite State Machine (FSM) for status management.

**Key Features:**
- 16 distinct booking states with valid transitions
- Geospatial service location
- AI matching integration
- Price breakdown with platform fees
- Dispute resolution system
- Quality assurance tracking
- Corporate booking support
- Warranty management

**FSM States:**
```
pending → matching → assigned → accepted → en_route →
arrived → in_progress → completed → verified →
payment_pending → paid
```

**Important Methods:**
- `transitionTo()` - Safe state transitions with validation
- `calculateCancellationFee()` - Dynamic fee calculation
- `canBeCancelled()` - Business rule validation

### 3. **Transaction Model** (`/src/models/Transaction.js`)

Comprehensive payment and transaction tracking.

**Key Features:**
- Multi-gateway support (M-Pesa, Stripe, Cash, Wallet)
- Escrow system for secure payments
- Refund management (full and partial)
- Split payments for platform fees
- Fraud detection integration
- Settlement tracking for technician payouts
- Webhook data storage
- Receipt and invoice generation

**Payment Flow:**
```
initiated → pending → processing → completed
                                 ↓
                            escrow → released
```

### 4. **Post Model** (`/src/models/Post.js`)

Social media-style post system for community engagement.

**Key Features:**
- Multiple post types (text, image, video, portfolio, tips, questions)
- Portfolio showcase for technicians
- Engagement tracking (likes, comments, shares, views)
- AI content moderation
- Hashtag and mention support
- Feed algorithm with engagement scoring
- Infinite scroll support
- Media attachments with Cloudinary integration

**Feed Algorithm:**
- Weighted engagement score
- Recency decay factor
- User-based and explore feeds

### 5. **Review Model** (`/src/models/Review.js`)

Detailed review and rating system.

**Key Features:**
- Overall rating plus 5 detailed rating categories
- Helpful voting system
- Business response capability
- Sentiment analysis integration
- Review verification
- Featured reviews
- Rating statistics and distribution

**Rating Categories:**
- Quality
- Professionalism
- Communication
- Punctuality
- Value for money

### 6. **Message Model** (`/src/models/Message.js`)

Real-time messaging system supporting chat and calls.

**Key Features:**
- Text, media, and location messages
- Booking reference messages
- Call notifications (voice/video)
- Read receipts with multiple readers
- Message reactions (emoji)
- Reply/thread support
- Edit history
- Per-user deletion
- Search within conversations

### 7. **Conversation Model** (`/src/models/Conversation.js`)

Chat conversation management.

**Key Features:**
- Direct messages (1-on-1)
- Group chats
- Booking-specific conversations
- Support chat
- Per-user settings (mute, pin, notifications)
- Unread count tracking
- Participant management
- Last message optimization

**Conversation Types:**
- `direct` - One-on-one chat
- `group` - Multi-user group
- `booking` - Booking-related chat
- `support` - Customer support

### 8. **Notification Model** (`/src/models/Notification.js`)

Multi-channel notification system.

**Key Features:**
- 30+ notification types
- Multi-channel delivery (Push, Email, SMS)
- Notification grouping
- Priority levels
- Deep linking for mobile apps
- Delivery status tracking
- Category-based filtering
- Auto-expiry support

**Channels:**
- Push notifications (FCM)
- Email (Nodemailer)
- SMS (Africa's Talking)

## Database Indexes

### Critical Indexes for Performance:

1. **Geospatial Indexes**
   - `User.location.coordinates` - Find nearby technicians
   - `Booking.serviceLocation.coordinates` - Location-based bookings

2. **Text Search Indexes**
   - `User` - Search by name, skills, business
   - `Post` - Search posts and portfolios
   - `Review` - Search reviews
   - `Message` - Search chat messages

3. **Compound Indexes**
   - `User` - `(role, status, rating)` - Filter and sort
   - `Booking` - `(customer, status, date)` - User bookings
   - `Transaction` - `(payer, status, date)` - Transaction history

## Installation

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required Variables:**
```env
MONGODB_URI=mongodb://localhost:27017/baitech
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### 3. Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# Or use MongoDB Atlas cloud
```

### 4. Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:7

# Or use Redis Cloud
```

### 5. Run the Server

```bash
# Development
npm run dev

# Production
npm start
```

## Database Setup

### Create Indexes

Indexes are automatically created on first connection when `NODE_ENV=development`.

For production, manually create indexes:

```bash
npm run indexes
```

### Seed Database (Development)

```bash
npm run seed
```

## API Endpoints (To Be Implemented)

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Users
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update profile
- `GET /api/v1/users/:id` - Get user profile
- `GET /api/v1/users/technicians/nearby` - Find nearby technicians

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - List bookings
- `GET /api/v1/bookings/:id` - Get booking details
- `PUT /api/v1/bookings/:id/status` - Update booking status
- `DELETE /api/v1/bookings/:id` - Cancel booking

### Payments
- `POST /api/v1/payments/mpesa` - Initiate M-Pesa payment
- `POST /api/v1/payments/mpesa/callback` - M-Pesa webhook
- `POST /api/v1/payments/stripe` - Stripe payment
- `GET /api/v1/payments/transactions` - Transaction history

### Social
- `POST /api/v1/posts` - Create post
- `GET /api/v1/posts/feed` - Get user feed
- `GET /api/v1/posts/explore` - Explore feed
- `POST /api/v1/posts/:id/like` - Like post
- `POST /api/v1/posts/:id/comment` - Comment on post

### Reviews
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews/user/:id` - Get user reviews
- `PUT /api/v1/reviews/:id/response` - Add business response

### Messages
- `GET /api/v1/conversations` - List conversations
- `POST /api/v1/conversations/:id/messages` - Send message
- `GET /api/v1/conversations/:id/messages` - Get messages
- `PUT /api/v1/messages/:id/read` - Mark as read

### Notifications
- `GET /api/v1/notifications` - List notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `PUT /api/v1/notifications/read-all` - Mark all as read

## Mobile App Integration

### Push Notifications (FCM)

Register device token:
```javascript
POST /api/v1/users/fcm-token
{
  "token": "fcm_device_token",
  "device": "iPhone 14 Pro",
  "platform": "ios"
}
```

### Deep Linking

All notifications include deep links:
```javascript
{
  "deepLink": "baitech://booking/123",
  "actionData": {
    "action": "view_booking",
    "bookingId": "123"
  }
}
```

### Offline-First Considerations

1. **Optimistic Updates**: Client updates local state immediately
2. **Sync Queue**: Failed requests queued for retry
3. **Conflict Resolution**: Last-write-wins with timestamps
4. **Local Cache**: Redux persist for offline data

## Performance Optimization

### 1. Indexing Strategy
- All frequently queried fields indexed
- Compound indexes for common query patterns
- Text indexes for search functionality

### 2. Caching with Redis
```javascript
// Cache user profile
await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));

// Cache feed
await redis.setex(`feed:${userId}`, 600, JSON.stringify(posts));
```

### 3. Query Optimization
- Use `.lean()` for read-only queries
- Select only required fields
- Populate sparingly
- Implement pagination

### 4. Aggregation Pipelines
- Use for complex analytics
- Index all fields used in `$match`
- Limit results early in pipeline

## Security Features

1. **Authentication**
   - JWT with refresh tokens
   - Bcrypt password hashing (12 rounds)
   - 2FA support with speakeasy

2. **Authorization**
   - Role-based access control
   - Resource ownership validation
   - Admin-only endpoints

3. **Data Protection**
   - MongoDB sanitization
   - XSS prevention
   - Rate limiting
   - Helmet.js security headers

4. **Compliance**
   - GDPR consent tracking
   - Data anonymization
   - Audit logs
   - Right to deletion

## Monitoring & Maintenance

### Health Check
```bash
curl http://localhost:5000/health
```

### Database Statistics
```javascript
const { getDatabaseStats } = require('./config/db');
const stats = await getDatabaseStats();
```

### Cleanup Old Data
```bash
npm run cleanup
```

This automatically:
- Deletes messages older than 90 days
- Removes read notifications older than 30 days
- Cleans up deleted conversations

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

## Deployment

### Docker Deployment

```bash
docker-compose up -d
```

### Environment Variables for Production

Ensure these are set:
- `NODE_ENV=production`
- Strong `JWT_SECRET`
- MongoDB Atlas connection string
- Redis Cloud URL
- All API keys for integrations

## Troubleshooting

### Connection Issues
```bash
# Check MongoDB
mongosh mongodb://localhost:27017

# Check Redis
redis-cli ping
```

### Index Issues
```bash
# Rebuild indexes
db.users.reIndex()
```

## Contributing

1. Create feature branch
2. Write tests
3. Update documentation
4. Submit PR

## License

MIT License

## Support

For issues or questions, contact: support@baitech.com
