# Dumu Waks Backend API

<div align="center">

<img src="../frontend/public/images/logo-full.png" alt="Dumu Waks Logo" width="150"/>

<br/><br/>

**Professional Maintenance & Repair Services Platform**

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Features](#features) • [Quick Start](#quick-start) • [API Docs](#api-documentation) • [Deployment](#deployment) • [Contributing](#contributing)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Dumu Waks is a comprehensive platform connecting customers with skilled technicians across Kenya. The backend provides a robust RESTful API with real-time capabilities, AI-powered matching, payment processing, and social features.

### Key Highlights

- 🤖 **AI-Powered Matching**: Intelligent technician-customer matching using multi-factor algorithm
- 💬 **Real-time Chat**: Socket.IO powered messaging system
- 💳 **Payment Integration**: M-Pesa & Stripe payment processing
- 🔐 **Secure Authentication**: JWT with refresh tokens, 2FA support
- 📱 **Push Notifications**: Firebase Cloud Messaging integration
- 🎯 **Role-Based Access**: Customer, Technician, Admin, Support roles
- 📊 **Analytics & Reporting**: Comprehensive booking and transaction analytics
- 🌐 **Social Features**: Community posts, reviews, ratings

---

## Features

### Core Functionality

#### 1. User Management
- Multi-role system (Customer, Technician, Admin, Corporate, Support)
- Email & phone verification
- Two-factor authentication (2FA)
- Profile management with geolocation
- KYC verification for technicians
- Skills & portfolio management

#### 2. Booking System
- Create, manage, and track service bookings
- Multi-status workflow (pending → completed)
- Scheduling with time slots
- Location-based service requests
- Cancellation with dynamic fee calculation
- Dispute resolution system

#### 3. AI Matching Engine
- **9-factor scoring algorithm**:
  - Skill match (25%)
  - Location proximity (20%)
  - Availability (15%)
  - Rating (15%)
  - Experience level (10%)
  - Pricing (5%)
  - Response time (5%)
  - Completion rate (3%)
  - Customer preference (2%)
- User preference learning
- Match feedback & optimization
- Block/unblock technicians

#### 4. Payment Processing
- **M-Pesa Integration**:
  - STK Push (C2B) for customer payments
  - B2C for technician payouts
  - Real-time callbacks and transaction query
- **Booking Fee System**:
  - 20% refundable deposit held in escrow
  - Automatic collection on booking creation
- **Completion Payment Flow**:
  - Remaining balance collected when customer confirms job completion
  - Automatic 85/15 split (technician/platform)
  - M-Pesa B2C automatic payout to technicians
- **Admin Payout Management**:
  - View pending payouts
  - Single and batch payout processing
  - Technician earning history
- **Stripe Integration**: Card payments, refunds, webhooks (optional)
- Transaction history & receipts
- Transparent fee breakdown

#### 5. Communication
- Real-time messaging with Socket.IO
- Conversation management
- Typing indicators
- Read receipts
- File sharing support
- Push notifications

#### 6. Media Upload & Storage
- **Cloudinary Integration**: Cloud-based file storage
- Image upload with automatic optimization
- Video upload with thumbnail generation
- Multiple file uploads (up to 10 files)
- Profile picture management
- Responsive image transformations
- Secure file deletion
- Direct client upload support
- Supported formats: JPEG, PNG, GIF, WebP, MP4, AVI, MOV
- File size limits: Images (5MB), Videos (100MB)

#### 7. Social Features
- Community posts (text, image, video, portfolio)
- Comments & replies
- Likes & shares
- Hashtags & mentions
- Feed algorithm (engagement-based)
- Content moderation

#### 8. Reviews & Ratings
- Multi-aspect ratings (quality, timeliness, professionalism, communication)
- Photo/video attachments
- Response system
- Rating analytics
- Verified booking reviews

#### 9. Support System
- Ticket management
- Live chat support
- Priority levels (low, medium, high, urgent)
- Auto-assignment based on load
- SLA tracking
- Customer satisfaction ratings

#### 10. Notifications
- Push notifications (FCM)
- Email notifications
- SMS notifications (Africa's Talking)
- In-app notifications
- Customizable preferences

---

## Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | ODM |
| **Socket.IO** | Real-time communication |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Stripe** | Payment processing |
| **Africa's Talking** | SMS gateway |
| **Firebase Admin** | Push notifications |
| **Nodemailer** | Email service |
| **Winston** | Logging |
| **Swagger** | API documentation |

### Infrastructure

- **Database**: MongoDB (local or Atlas)
- **Caching**: Redis (optional)
- **File Storage**: Cloudinary
- **Email**: SMTP (Gmail, SendGrid)
- **SMS**: Africa's Talking / Twilio

---

## Architecture

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── db.js        # Database connection
│   │   ├── swagger.js   # Swagger setup
│   │   ├── socket.js    # Socket.IO setup
│   │   └── cloudinary.js # Cloudinary setup
│   │
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── booking.controller.js
│   │   ├── matching.controller.js
│   │   ├── transaction.controller.js
│   │   ├── media.controller.js
│   │   ├── post.controller.js
│   │   ├── review.controller.js
│   │   ├── message.controller.js
│   │   ├── conversation.controller.js
│   │   ├── notification.controller.js
│   │   └── support.controller.js
│   │
│   ├── models/          # Database models
│   │   ├── User.js
│   │   ├── Booking.js
│   │   ├── Matching.js
│   │   ├── MatchingPreference.js
│   │   ├── MatchingInteraction.js
│   │   ├── Transaction.js
│   │   ├── Post.js
│   │   ├── Review.js
│   │   ├── Message.js
│   │   ├── Conversation.js
│   │   ├── Notification.js
│   │   └── SupportTicket.js
│   │
│   ├── routes/          # API routes
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── booking.routes.js
│   │   ├── matching.routes.js
│   │   ├── transaction.routes.js
│   │   ├── media.routes.js
│   │   ├── post.routes.js
│   │   ├── review.routes.js
│   │   ├── message.routes.js
│   │   ├── conversation.routes.js
│   │   ├── notification.routes.js
│   │   └── support.routes.js
│   │
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication & authorization
│   │   ├── validation.js # Request validation
│   │   └── upload.js    # File upload (multer)
│   │
│   ├── services/        # Business logic & external services
│   │   ├── email.service.js
│   │   ├── sms.service.js
│   │   ├── payment.service.js
│   │   ├── notification.service.js
│   │   └── media.service.js
│   │
│   ├── utils/           # Utility functions
│   │   ├── helpers.js   # Common helpers
│   │   ├── logger.js    # Winston logger
│   │   └── encryption.js # Data encryption
│   │
│   ├── scripts/         # Utility scripts
│   │   └── seed.js      # Database seeder
│   │
│   └── server.js        # Application entry point
│
├── logs/                # Application logs
├── .env                 # Environment variables
├── .env.example         # Environment template
├── package.json         # Dependencies
└── README.md           # This file
```

---

## Quick Start

### Prerequisites

- Node.js >= 18.x
- MongoDB >= 6.x
- npm >= 9.x

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

5. **Seed database (optional)**
```bash
npm run seed
```

6. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

7. **Access the API**
- API Server: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs
- Health Check: http://localhost:5000/health

---

## Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory:

```bash
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/dumuwaks

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@dumuwaks.com

# SMS (Africa's Talking)
AT_USERNAME=your-username
AT_API_KEY=your-api-key
AT_SENDER_ID=DUMUWAKS

# Payment - M-Pesa (C2B & B2C)
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_PASSKEY=your-passkey
MPESA_SHORTCODE=174379
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://yourdomain.com/api/v1/payments/mpesa/callback
MPESA_TIMEOUT_URL=https://yourdomain.com/api/v1/payments/mpesa/timeout

# M-Pesa B2C Configuration (Technician Payouts)
MPESA_B2C_CALLBACK_URL=https://yourdomain.com/api/v1/payments/mpesa/b2c-callback
MPESA_B2C_TIMEOUT_URL=https://yourdomain.com/api/v1/payments/mpesa/b2c-timeout
MPESA_INITIATOR_NAME=testapi
MPESA_SECURITY_CREDENTIAL=your-security-credential-here

# Payment - Stripe (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Firebase (Push Notifications)
FIREBASE_SERVICE_ACCOUNT=./config/firebase-service-account.json

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Client URLs
CLIENT_WEB_URL=http://localhost:3000
CLIENT_MOBILE_URL=dumuwaks://

# Admin Configuration
ADMIN_EMAIL=admin@dumuwaks.com
```

See [ENV_VARIABLES.md](ENV_VARIABLES.md) for complete list and descriptions.

---

## API Documentation

### Interactive Documentation

Access the interactive Swagger UI at: **http://localhost:5000/api-docs**

### API Endpoints Overview

#### Authentication
```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login             # Login user
POST   /api/v1/auth/verify-2fa        # Verify 2FA code
GET    /api/v1/auth/me                # Get current user
POST   /api/v1/auth/forgot-password   # Request password reset
POST   /api/v1/auth/reset-password    # Reset password
GET    /api/v1/auth/verify-email/:token  # Verify email
POST   /api/v1/auth/setup-2fa         # Setup 2FA
POST   /api/v1/auth/enable-2fa        # Enable 2FA
POST   /api/v1/auth/disable-2fa       # Disable 2FA
```

#### AI Matching (NEW)
```
POST   /api/v1/matching/find-technicians    # Find AI-matched technicians
GET    /api/v1/matching/my-matches          # Get user's matches
GET    /api/v1/matching/:id                 # Get match details
POST   /api/v1/matching/:id/accept          # Accept match & create booking
POST   /api/v1/matching/:id/reject          # Reject match
POST   /api/v1/matching/:id/feedback        # Add match feedback
GET    /api/v1/matching/preferences         # Get preferences
PUT    /api/v1/matching/preferences         # Update preferences
POST   /api/v1/matching/block/:technicianId # Block technician
DELETE /api/v1/matching/block/:technicianId # Unblock technician
```

#### Media Upload (NEW)
```
POST   /api/v1/media/upload/image              # Upload single image
POST   /api/v1/media/upload/images             # Upload multiple images
POST   /api/v1/media/upload/video              # Upload single video
POST   /api/v1/media/upload/media              # Upload mixed media
POST   /api/v1/media/upload/profile-picture    # Upload profile picture
DELETE /api/v1/media/:publicId                 # Delete file
POST   /api/v1/media/delete-multiple           # Delete multiple files
GET    /api/v1/media/:publicId/details         # Get file details
POST   /api/v1/media/generate-signature        # Generate upload signature
POST   /api/v1/media/optimize-url              # Get optimized URL
```

#### Users
```
GET    /api/v1/users                   # Get all users
GET    /api/v1/users/:id               # Get user by ID
PUT    /api/v1/users/:id               # Update user
DELETE /api/v1/users/:id               # Delete user
GET    /api/v1/users/technicians/search  # Search technicians
```

#### Bookings
```
POST   /api/v1/bookings                # Create booking
GET    /api/v1/bookings                # Get all bookings
GET    /api/v1/bookings/:id            # Get booking by ID
PUT    /api/v1/bookings/:id            # Update booking
DELETE /api/v1/bookings/:id            # Cancel booking
POST   /api/v1/bookings/:id/accept     # Accept booking
POST   /api/v1/bookings/:id/complete   # Complete booking
```

#### Payments & Payouts (NEW)
```
# M-Pesa Payments
POST   /api/v1/payments/mpesa/stk-push           # Initiate STK Push payment
POST   /api/v1/payments/mpesa/callback           # M-Pesa callback handler
POST   /api/v1/payments/mpesa/timeout            # M-Pesa timeout handler
POST   /api/v1/payments/mpesa/b2c-callback       # B2C callback handler
POST   /api/v1/payments/mpesa/b2c-timeout        # B2C timeout handler
GET    /api/v1/payments/mpesa/:id/query          # Query transaction status

# Technician Payouts (Admin/Finance)
GET    /api/v1/payments/payouts/pending          # Get pending payouts
GET    /api/v1/payments/payouts/:id              # Get payout details
POST   /api/v1/payments/payouts/:id/process      # Process single payout
POST   /api/v1/payments/payouts/batch-process    # Process multiple payouts

# Technician Earnings
GET    /api/v1/payments/payouts/my-payouts       # Get my earnings history
```

See [API_ROUTES_SUMMARY.md](API_ROUTES_SUMMARY.md) for complete endpoint documentation.

---

## Database Schema

### Models Overview

| Model | Description | Key Features |
|-------|-------------|--------------|
| **User** | User accounts & profiles | Multi-role, geolocation, skills, KYC |
| **Booking** | Service bookings | Status workflow, pricing, scheduling |
| **Matching** | AI match records | Scores, reasons, algorithm details |
| **MatchingPreference** | User preferences | Custom weights, blocked users |
| **MatchingInteraction** | AI interactions | Analytics, feedback, performance |
| **Transaction** | Payment records | M-Pesa, Stripe, refunds |
| **Post** | Social posts | Media, engagement, moderation |
| **Review** | Ratings & reviews | Multi-aspect ratings, responses |
| **Message** | Chat messages | Text, media, read receipts |
| **Conversation** | Chat threads | Participants, unread counts |
| **Notification** | User notifications | Push, email, SMS |
| **SupportTicket** | Customer support | Priority, assignment, SLA |

See [DATABASE_SCHEMA_SUMMARY.md](DATABASE_SCHEMA_SUMMARY.md) for detailed schemas.

---

## Testing

### Run Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- user.test.js

# Watch mode
npm run test:watch
```

### Test Endpoints Manually

Use the included Swagger UI or tools like Postman/Insomnia:

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+254712345678",
    "password": "your-secure-password"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "your-secure-password"
  }'
```

---

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up MongoDB Atlas
- [ ] Configure Redis for sessions
- [ ] Set up CloudFlare/CDN
- [ ] Enable rate limiting
- [ ] Configure monitoring (New Relic, Datadog)
- [ ] Set up error tracking (Sentry)
- [ ] Configure backups
- [ ] Set up CI/CD pipeline

### Deployment Options

#### 1. VPS (Production)
Deployed automatically via GitHub Actions on push to `master`. See [VPS Deployment Guide](../docs/deployment/VPS_DEPLOYMENT.md).

**Production URL:** https://api.ementech.co.ke

#### 2. Docker
```bash
# Build image
docker build -t dumuwaks-backend .

# Run container
docker run -p 5000:5000 --env-file .env dumuwaks-backend
```

#### 3. VPS (Manual)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone <repo> /var/www/dumuwaks-backend
cd /var/www/dumuwaks-backend
npm install --production

# Start with PM2
pm2 start src/server.js --name dumuwaks-backend
pm2 save
pm2 startup
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use ESLint configuration
- Follow Airbnb style guide
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## Scripts

```bash
# Development
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start production server

# Database
npm run seed         # Seed database with sample data
npm run indexes      # Create database indexes
npm run cleanup      # Clean up old data

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode

# Utilities
npm run lint         # Lint code
npm run format       # Format code with Prettier
```

---

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

**Port Already in Use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

**Module Not Found**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**JWT Token Invalid**
- Check JWT_SECRET in .env
- Ensure token hasn't expired
- Verify Authorization header format: `Bearer <token>`

---

## Performance Tips

1. **Use indexes** - Already configured in models
2. **Enable caching** - Use Redis for sessions
3. **Connection pooling** - MongoDB connection pool configured
4. **Compression** - Gzip enabled in production
5. **Rate limiting** - Configured for API endpoints
6. **Pagination** - Always paginate large datasets
7. **Database queries** - Use select(), lean(), populate() wisely

---

## Security

- JWT authentication with refresh tokens
- Password hashing with bcrypt (12 rounds)
- Request validation with express-validator
- MongoDB injection prevention
- XSS protection
- CORS configuration
- Rate limiting
- Helmet.js security headers
- 2FA support

---

## Monitoring & Logging

### Logging

Logs are stored in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

### Health Monitoring

```bash
# Health check endpoint
GET /health

# Response
{
  "status": "healthy",
  "timestamp": "2025-11-19T10:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "database": {
    "status": "connected",
    "isHealthy": true,
    "host": "localhost",
    "database": "dumuwaks"
  }
}
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

For support and questions:
- **Email**: support@dumuwaks.com
- **Documentation**: See [docs/](../docs/) folder
- **Issue Tracker**: GitHub Issues

---

## Acknowledgments

- Express.js team for the robust web framework
- MongoDB team for the powerful database
- Socket.IO team for real-time capabilities
- Safaricom for M-Pesa Daraja API
- All contributors and testers

---

<div align="center">

<p><strong>Built with ❤️ in Kenya</strong></p>
<p>Dumu Waks - Connecting Skilled Technicians with Customers</p>

<img src="../frontend/public/images/logo-medium.png" alt="Dumu Waks" width="100"/>

</div>
