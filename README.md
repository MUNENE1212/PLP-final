# 🔧 EmEnTech - Emergency Maintenance & Engineering Platform

> A comprehensive platform connecting customers with skilled technicians for emergency repairs, maintenance, and engineering services across Kenya.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd ementech

# Quick setup
cp .env.docker.example .env.docker
nano .env.docker  # Configure your environment

# Start with Docker (Recommended)
./scripts/docker-dev.sh

# OR manual setup
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

**Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

📖 **Detailed setup**: See [QUICK_START.md](./QUICK_START.md)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### Core Features
- 🔐 **Authentication & Authorization** - JWT-based secure auth with role management
- 👥 **User Management** - Customer, Technician, Admin, Support roles
- 🛠️ **Service Booking** - 99+ service types across 12 categories
- 💰 **Smart Pricing** - Dynamic pricing with distance, urgency, and time factors
- 💳 **M-Pesa Integration** - Seamless mobile payments
- 🤖 **AI Matching** - Intelligent technician matching algorithm
- 💬 **Real-time Messaging** - In-app chat between customers and technicians
- 📍 **Location Services** - Distance-based pricing and technician discovery
- ⭐ **Rating & Reviews** - Two-way rating system
- 🎫 **Support System** - Comprehensive ticket-based support

### Payment Features
- 20% refundable booking fee (held in escrow)
- Transparent pricing breakdown
- Platform commission model
- Automatic urgency calculation
- Distance-based fees

### Advanced Features
- Service completion verification
- Matching preferences
- Session-based search
- Document encryption
- API rate limiting
- Comprehensive logging

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB 7.0
- **Cache:** Redis
- **Authentication:** JWT
- **Payment:** M-Pesa Daraja API
- **Documentation:** Swagger/OpenAPI
- **Testing:** Jest

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **UI Components:** Custom component library

### DevOps
- **Containerization:** Docker + Docker Compose
- **Cloud Platform:** Render.com (recommended)
- **CI/CD:** Auto-deploy on git push
- **Monitoring:** Health checks + logging
- **Database:** MongoDB Atlas (managed)

## 📁 Project Structure

```
ementech/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Custom middleware
│   │   ├── utils/        # Utility functions
│   │   ├── jobs/         # Background jobs
│   │   └── server.js     # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/             # React/TypeScript app
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store
│   │   ├── services/     # API services
│   │   ├── utils/        # Utility functions
│   │   └── App.tsx       # Root component
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docs/                 # Documentation
│   ├── api/              # API documentation
│   ├── deployment/       # Deployment guides
│   ├── features/         # Feature documentation
│   ├── guides/           # How-to guides
│   ├── backend/          # Backend docs
│   └── fixes/            # Bug fixes & solutions
│
├── scripts/              # Utility scripts
│   ├── docker-dev.sh     # Development deployment
│   └── docker-prod.sh    # Production deployment
│
├── docker-compose.yml    # Development setup
├── docker-compose.prod.yml  # Production setup
├── .env.docker.example   # Environment template
├── QUICK_START.md        # Quick start guide
└── README.md             # This file
```

## 📚 Documentation

### 🚀 Getting Started
- [Quick Start Guide](./QUICK_START.md) - Get up and running in 5 minutes
- [Environment Variables](./docs/backend/ENV_VARIABLES.md) - Configuration reference
- [Docker Deployment](./docs/deployment/DOCKER_DEPLOYMENT.md) - Containerized deployment

### 🔌 API Documentation
- [API Routes Summary](./docs/api/API_ROUTES_SUMMARY.md) - All available endpoints
- [Swagger Setup](./docs/api/SWAGGER_SETUP_SUMMARY.md) - Interactive API docs
- [Swagger Testing](./docs/api/SWAGGER_TESTING_GUIDE.md) - Testing with Swagger UI

### 💡 Features
- [Pricing System](./docs/features/PRICING_SYSTEM_DOCUMENTATION.md) - How pricing works
- [M-Pesa Integration](./docs/features/MPESA_INTEGRATION_GUIDE.md) - Payment integration
- [Booking Fee System](./docs/features/BOOKING_FEE_SYSTEM.md) - Escrow & fees
- [AI Matching](./docs/features/AI_MATCHING_IMPLEMENTATION.md) - Matching algorithm
- [Support System](./docs/features/SUPPORT_SYSTEM_SUMMARY.md) - Ticket system

### 🛠️ Development
- [Database Schema](./docs/backend/DATABASE_SCHEMA_SUMMARY.md) - MongoDB collections
- [Implementation Summary](./docs/backend/IMPLEMENTATION_SUMMARY.md) - Architecture overview
- [Contributing Guide](./backend/CONTRIBUTING.md) - How to contribute

### 🐛 Fixes & Solutions
- [Booking Fee Fixes](./docs/fixes/BOOKING_FEE_COMPLETE_DEBUGGING_SUMMARY.md)
- [Service Type Optimization](./docs/fixes/SERVICE_TYPE_OPTIMIZATION.md)
- [Pricing Model Updates](./docs/features/PRICING_MODEL_UPDATE.md)

### 🚀 Deployment
- [Render Deployment Guide](./docs/deployment/RENDER_DEPLOYMENT.md) - Deploy to Render.com (Recommended)
- [Docker Deployment Guide](./docs/deployment/DOCKER_DEPLOYMENT.md) - Full Docker setup
- [Deployment Checklist](./docs/deployment/DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist

## 💻 Development

### Prerequisites
- Node.js 18+ and npm
- MongoDB 7.0+
- Redis (optional, for caching)
- M-Pesa Developer Account

### Local Development

#### Backend
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env

# Seed pricing data
npm run seed:pricing

# Start development server
npm run dev
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env

# Start development server
npm run dev
```

### Docker Development
```bash
# One command to start everything
./scripts/docker-dev.sh

# Or manually
docker-compose up -d
docker-compose logs -f
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Render.com (Recommended for Production)

**One-click deployment with Blueprint:**

1. **Push to GitHub:**
```bash
git add .
git commit -m "Ready for deployment"
git push origin master
```

2. **Deploy on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" > "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` automatically
   - Configure environment variables (see `.env.render.example`)
   - Click "Apply"

3. **Post-deployment:**
   - Seed pricing data via backend shell
   - Update M-Pesa callback URL
   - Test the application

📖 **Full guide**: [Render Deployment Guide](./docs/deployment/RENDER_DEPLOYMENT.md)

**Free tier includes:**
- Backend API (with auto-sleep after 15 min)
- Frontend static site
- Redis cache (25MB)
- MongoDB Atlas (512MB free tier)

**Paid tier ($14/month):**
- Always-on services
- Better performance
- 256MB Redis

### Using Docker (Self-hosted)

1. **Configure environment:**
```bash
cp .env.docker.example .env.docker
nano .env.docker  # Set production values
```

2. **Deploy:**
```bash
./scripts/docker-prod.sh
```

3. **Verify:**
```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

📖 **Full guide**: [Docker Deployment Guide](./docs/deployment/DOCKER_DEPLOYMENT.md)

### Other Cloud Platforms
- **Render:** Recommended - See guide above
- **Railway:** Similar to Render, use `railway up`
- **AWS:** EC2 + RDS + S3 (advanced)
- **DigitalOcean:** Droplet + Managed MongoDB
- **Heroku:** Container deployment (deprecated)

## 🔐 Security

- JWT authentication with secure token storage
- Password hashing with bcrypt
- Environment variable protection
- Rate limiting on sensitive endpoints
- CORS configuration
- Input validation and sanitization
- Secure M-Pesa API integration
- Document encryption for sensitive data

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./backend/CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Backend Development:** Full-stack API with Node.js/Express
- **Frontend Development:** React/TypeScript SPA
- **DevOps:** Docker containerization and deployment

## 🙏 Acknowledgments

- M-Pesa Daraja API for payment integration
- MongoDB for database
- React and TypeScript communities
- All contributors and testers

## 📞 Support

- **Documentation:** See [docs/](./docs/) folder
- **Issues:** GitHub Issues
- **Email:** support@ementech.com (if applicable)

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] SMS notifications
- [ ] Automated testing suite
- [ ] Performance monitoring
- [ ] CI/CD pipeline

---

**Built with ❤️ for connecting skilled technicians with customers in need**
