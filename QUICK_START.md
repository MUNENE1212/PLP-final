# Dumu Waks - Quick Start & Deployment Guide

Complete guide for local development, Docker setup, and production deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Development](#docker-development)
- [Production Deployment (Render.com)](#production-deployment-rendercom)
- [Cloudinary Media Storage](#cloudinary-media-storage)
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

## Production Deployment (Render.com)

Render.com is the recommended platform for production deployment.

### Prerequisites

- [ ] GitHub account with repository pushed
- [ ] Render.com account (sign up free at https://render.com)
- [ ] MongoDB Atlas account
- [ ] M-Pesa developer credentials
- [ ] Cloudinary account

### Step 1: MongoDB Atlas (5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free M0 cluster (512MB)
3. Choose AWS provider, closest region
4. **Database Access:** Create user with password
5. **Network Access:** Allow access from anywhere (0.0.0.0/0)
6. Get connection string:
   ```
   mongodb+srv://dumuwaks_admin:PASSWORD@cluster.mongodb.net/dumuwaks?retryWrites=true&w=majority
   ```

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin master
```

### Step 3: Deploy on Render

1. Go to https://dashboard.render.com
2. Click **New** > **Blueprint**
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. Click **Apply Blueprint**

### Step 4: Configure Environment Variables

**Backend Service:**
```
MONGODB_URI=mongodb+srv://dumuwaks_admin:PASSWORD@cluster.mongodb.net/dumuwaks?retryWrites=true&w=majority
JWT_SECRET=<generate-64-char-secret>
JWT_REFRESH_SECRET=<generate-64-char-secret>
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_CALLBACK_URL=https://your-backend.onrender.com/api/v1/payments/mpesa/callback
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend Service:**
```
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

**Auto-configured by Render:**
```
REDIS_HOST
REDIS_PORT
CORS_ORIGIN
```

### Step 5: Post-Deployment

1. **Seed Pricing Data:**
   - Go to backend service in Render dashboard
   - Click **Shell** tab
   - Run: `cd backend && npm run seed:pricing`

2. **Update M-Pesa Callback URL** in M-Pesa developer portal

3. **Test Application:**
   - Frontend: `https://your-frontend.onrender.com`
   - Backend: `https://your-backend.onrender.com/api/v1/health`

### Render Service URLs

After deployment, your services will be available at:

- **Frontend:** `https://dumuwaks-frontend.onrender.com`
- **Backend:** `https://dumuwaks-backend.onrender.com`
- **API Docs:** `https://dumuwaks-backend.onrender.com/api-docs`
- **Health Check:** `https://dumuwaks-backend.onrender.com/api/v1/health`

### Cost Breakdown

**Free Tier (Development):**
| Service | Cost | Notes |
|---------|------|-------|
| Frontend | $0 | Static site |
| Backend | $0 | Auto-sleeps after 15 min |
| Redis | $0 | 25MB limit |
| MongoDB | $0 | Atlas M0 (512MB) |
| **Total** | **$0/month** | Cold starts |

**Paid Tier (Production):**
| Service | Cost | Benefits |
|---------|------|----------|
| Frontend | $0 | Same as free |
| Backend | $7/month | Always-on, better CPU/RAM |
| Redis | $7/month | 256MB, persistent |
| MongoDB | $0 | Same as free (or $9 for M2) |
| **Total** | **$14/month** | No cold starts |

---

## Cloudinary Media Storage

Dumu Waks uses Cloudinary for media storage (replacing Google Drive).

### Setup Instructions

1. **Create Cloudinary Account:**
   - Go to https://cloudinary.com/
   - Sign up for free account
   - Verify email

2. **Get Credentials:**
   - From Dashboard, copy:
     - Cloud Name
     - API Key
     - API Secret

3. **Configure Environment:**
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Test Configuration:**
   ```bash
   # Start backend and check logs
   npm run dev
   # Look for: "Cloudinary configured successfully"

   # Test endpoint
   curl http://localhost:5000/api/v1/upload/config
   # Should return: {"configured": true}
   ```

### Features

- **Automatic Optimization:** Images resized to 500x500, cropped to faces, WebP conversion
- **Organized Folders:** `profile-pictures/`, `posts/`, `bookings/`
- **Supported Types:** JPEG, JPG, PNG, GIF, WebP, MP4, MOV, AVI
- **Max File Size:** 10MB

### Free Tier Limits

- 25 GB storage
- 25 GB bandwidth per month
- Unlimited transformations

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

### Cloudinary "Not Configured" Error

- Check all three environment variables are set:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

### Render Service Issues

1. Check service logs in Render dashboard
2. Verify all environment variables are set
3. Check MongoDB Atlas network access
4. Check Render status page: https://status.render.com/

---

## Additional Resources

- **Full API Documentation:** [docs/api/API_ROUTES_SUMMARY.md](./docs/api/API_ROUTES_SUMMARY.md)
- **Database Schema:** [docs/backend/DATABASE_SCHEMA_SUMMARY.md](./docs/backend/DATABASE_SCHEMA_SUMMARY.md)
- **Pricing System:** [docs/features/PRICING_SYSTEM_DOCUMENTATION.md](./docs/features/PRICING_SYSTEM_DOCUMENTATION.md)
- **M-Pesa Integration:** [docs/features/MPESA_INTEGRATION_GUIDE.md](./docs/features/MPESA_INTEGRATION_GUIDE.md)
- **Render Docs:** https://render.com/docs
- **MongoDB Atlas Docs:** https://www.mongodb.com/docs/atlas/
- **Cloudinary Docs:** https://cloudinary.com/documentation

---

**Need help?** Check the [README.md](./README.md) or contact the team at support@dumuwaks.com
