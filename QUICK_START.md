# Dumu Waks - Quick Start & Deployment Guide

Complete guide for local development, Docker setup, and production deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Development](#docker-development)
- [Production Deployment (VPS)](#production-deployment-vps)
- [Environment Variables](#environment-variables)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+ and npm
- MongoDB 7.0+ (or MongoDB Atlas account)
- Redis (optional, for caching)
- Docker & Docker Compose (for containerized setup)
- M-Pesa Developer Account (for payments)
- Cloudinary Account (for media storage)
- Git

---

## Local Development

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Configure your credentials

# Seed pricing data
npm run seed:pricing

# Start development server
npm run dev
```

### Frontend Setup

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

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Docs:** http://localhost:5000/api-docs
- **Health Check:** http://localhost:5000/api/v1/health

### MongoDB Setup

**Option A: Local MongoDB**
```bash
# macOS
brew install mongodb-community
mongod --dbpath=/path/to/data

# Ubuntu
sudo apt install mongodb
sudo systemctl start mongodb
```

**Option B: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

**Option C: MongoDB Atlas (Recommended for Production)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free M0 cluster (512MB)
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Redis Setup (Optional)

```bash
# Docker
docker run -d -p 6379:6379 --name redis redis:7

# Local
brew install redis  # macOS
sudo apt install redis-server  # Ubuntu
redis-server
```

---

## Docker Development

### Quick Start

```bash
# Copy environment template
cp .env.docker.example .env.docker
nano .env.docker  # Configure your credentials

# Start all services
./scripts/docker-dev.sh

# Or manually
docker-compose up -d
docker-compose logs -f
```

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React/TypeScript app |
| Backend | 5000 | Node.js/Express API |
| MongoDB | 27017 | Database |
| Redis | 6379 | Cache |

### Production Docker

```bash
# Configure production environment
cp .env.docker.example .env.docker
nano .env.docker  # Set production values

# Deploy
./scripts/docker-prod.sh

# Verify
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Production Deployment (VPS)

The app is deployed on a VPS with zero-downtime blue-green deployments via GitHub Actions.

**Production URLs:**
- **Frontend:** [https://dumuwaks.ementech.co.ke](https://dumuwaks.ementech.co.ke)
- **API:** [https://api.ementech.co.ke](https://api.ementech.co.ke)
- **Health Check:** [https://api.ementech.co.ke/api/v1/health](https://api.ementech.co.ke/api/v1/health)

**Infrastructure:** Ubuntu 24.04, PM2, Nginx, Let's Encrypt SSL

Pushing to `master` triggers automatic deployment via GitHub Actions.

📖 **Full deployment guide:** [VPS Deployment Guide](./docs/deployment/VPS_DEPLOYMENT.md)
📖 **CI/CD pipeline details:** [CI/CD Strategy](./docs/CI_CD_STRATEGY.md)

---

## Environment Variables

### Required for Backend

```env
# Database
MONGODB_URI=mongodb://localhost:27017/dumuwaks

# Authentication
JWT_SECRET=your-jwt-secret-at-least-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key

# M-Pesa (for payments)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-domain.com/api/v1/payments/mpesa/callback
MPESA_ENVIRONMENT=sandbox

# Cloudinary (for media)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Required for Frontend

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Security Best Practices

### Environment Variables

**DO:**
- Always use environment variables for sensitive data
- Use strong, randomly generated passwords (20+ characters)
- Generate unique secrets for JWT_SECRET and JWT_REFRESH_SECRET
- Keep `.env` file in `.gitignore`
- Use different credentials for development and production
- Store production credentials in a secure password manager

**DON'T:**
- Never commit `.env` files to version control
- Never use default/example passwords in production
- Never reuse passwords across services
- Never share credentials in plaintext

### Generate Strong Secrets

JWT secrets are cryptographic keys used to sign and verify authentication tokens. Using weak or predictable secrets can lead to security vulnerabilities.

**IMPORTANT:** Run the command TWICE to generate two different secrets:
- One for `JWT_SECRET` (access tokens)
- One for `JWT_REFRESH_SECRET` (refresh tokens)

```bash
# Generate JWT secret (64 bytes = 128 hex characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Example output:
# a1b2c3d4e5f6... (128 character hex string)

# Generate encryption key (32 bytes = 64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Security Requirements for JWT Secrets:**
- Minimum 32 characters (64+ recommended)
- Use cryptographically secure random generation
- Never use the same secret for JWT_SECRET and JWT_REFRESH_SECRET
- Never commit secrets to version control
- Rotate secrets periodically (every 90 days recommended)
- Use different secrets for development and production

**Example .env configuration:**
```env
# Generated with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
JWT_REFRESH_SECRET=f9e8d7c6b5a4321098765432109876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210
```

### Docker Security

The following files are excluded from Docker images via `.dockerignore`:
- `.env` and all `.env*` variants
- `*credentials.json` files
- Service account keys
- Private keys (`.pem`, `.key` files)

**IMPORTANT:** Even though these files are excluded, never commit them to git!

### MongoDB Security

- Always set strong `MONGO_ROOT_USERNAME` and `MONGO_ROOT_PASSWORD`
- Don't expose port 27017 to the internet
- Use authentication (enabled by default)
- For production, use MongoDB Atlas with IP whitelisting

### Redis Security

- Redis has no authentication by default (local development only)
- Don't expose port 6379 to the internet
- For production, use Redis Cloud with password authentication

### Check for Exposed Secrets

```bash
# Check for accidentally staged credential files
git status | grep -E "\.env|credentials\.json|service-account"

# Check for secrets in files
git diff --cached | grep -iE "password|secret|key|token"

# Scan for common secret patterns
git diff --cached | grep -E "mongodb://|postgres://|redis://"
```

### What to Do If Secrets Are Exposed

1. **Immediately rotate all exposed credentials**
2. **Remove from git history** (use `git filter-branch` or `BFG Repo-Cleaner`)
3. **Update all deployment environments**
4. **Monitor for unauthorized access**

---

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check connection string
echo $MONGODB_URI

# View MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Docker Service Won't Start

- Check logs: `docker-compose logs backend`
- Verify all environment variables are set
- Check MongoDB Atlas network access (0.0.0.0/0)

### Frontend Can't Connect to Backend

- Verify `VITE_API_URL` is correct
- Verify `CORS_ORIGIN` includes frontend URL
- Check backend is running (green status)

---

## Additional Resources

- **Full API Documentation:** [docs/api/API_ROUTES_SUMMARY.md](./docs/api/API_ROUTES_SUMMARY.md)
- **Database Schema:** [docs/backend/DATABASE_SCHEMA_SUMMARY.md](./docs/backend/DATABASE_SCHEMA_SUMMARY.md)
- **Pricing System:** [docs/features/PRICING_SYSTEM_DOCUMENTATION.md](./docs/features/PRICING_SYSTEM_DOCUMENTATION.md)
- **M-Pesa Integration:** [docs/features/MPESA_INTEGRATION_GUIDE.md](./docs/features/MPESA_INTEGRATION_GUIDE.md)
- **CI/CD Strategy:** [docs/CI_CD_STRATEGY.md](./docs/CI_CD_STRATEGY.md)
- **MongoDB Atlas Docs:** https://www.mongodb.com/docs/atlas/

---

**Need help?** Check the [README.md](./README.md) or open a GitHub Issue.
