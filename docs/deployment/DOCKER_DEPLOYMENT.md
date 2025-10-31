# Docker Deployment Guide

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Deployment](#development-deployment)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Useful Commands](#useful-commands)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- At least 4GB RAM available
- Port 3000, 5000, 27017, 6379 available (development)
- Port 80, 5000 available (production)

## Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd ementech
```

### 2. Configure environment
```bash
# Copy environment template
cp .env.docker.example .env.docker

# Edit .env.docker with your values
nano .env.docker
```

### 3. Run in development mode
```bash
./scripts/docker-dev.sh
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017

## Development Deployment

### Using Docker Compose directly
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Using the script
```bash
./scripts/docker-dev.sh
```

### What's included in development:
- ✅ MongoDB (with data persistence)
- ✅ Redis (for caching)
- ✅ Backend API (Node.js)
- ✅ Frontend (React + Vite)
- ✅ Hot reload (via volume mounts)
- ✅ Health checks
- ✅ Auto-restart on failure

## Production Deployment

### 1. Prepare environment
```bash
# Create production environment file
cp .env.docker.example .env.docker

# Configure production values
nano .env.docker
```

**Important production settings:**
- `NODE_ENV=production`
- Strong `JWT_SECRET` (32+ characters)
- Secure MongoDB password
- Production M-Pesa credentials
- Correct `CORS_ORIGIN` and `VITE_API_URL`
- External MongoDB URI (recommended)

### 2. Deploy
```bash
# Using production script
./scripts/docker-prod.sh

# Or manually
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Verify deployment
```bash
# Check service health
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check resource usage
docker stats
```

## Environment Configuration

### Required Variables

#### Application
```env
NODE_ENV=production
BACKEND_PORT=5000
FRONTEND_PORT=3000
```

#### Database
```env
# Development (local MongoDB)
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure-password
MONGO_DB_NAME=ementech

# Production (external MongoDB recommended)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ementech
```

#### Security
```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRE=30d
```

#### M-Pesa
```env
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_PASSKEY=your-passkey
MPESA_SHORTCODE=174379
MPESA_ENVIRONMENT=sandbox  # or 'production'
MPESA_CALLBACK_URL=https://yourdomain.com/api/v1/payments/mpesa/callback
```

#### Frontend
```env
VITE_API_URL=https://yourdomain.com/api/v1
CORS_ORIGIN=https://yourdomain.com
```

## Useful Commands

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Last 100 lines
docker-compose logs --tail=100
```

### Restart services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Execute commands in containers
```bash
# Backend shell
docker exec -it ementech-backend sh

# MongoDB shell
docker exec -it ementech-mongodb mongosh

# Redis CLI
docker exec -it ementech-redis redis-cli
```

### Database operations
```bash
# Backup MongoDB
docker exec ementech-mongodb mongodump --out=/backup
docker cp ementech-mongodb:/backup ./mongodb-backup

# Restore MongoDB
docker cp ./mongodb-backup ementech-mongodb:/backup
docker exec ementech-mongodb mongorestore /backup

# Seed pricing data
docker exec ementech-backend node src/scripts/seedPricing.js
```

### Resource management
```bash
# View resource usage
docker stats

# Clean up unused resources
docker system prune -a

# Remove specific service
docker-compose rm backend

# Rebuild specific service
docker-compose up -d --build backend
```

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Check if ports are available
netstat -tuln | grep -E '3000|5000|27017|6379'

# Remove containers and try again
docker-compose down -v
docker-compose up -d
```

### Backend can't connect to MongoDB
```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Verify connection string in .env.docker
# Ensure MONGODB_URI is correct
```

### Frontend can't connect to backend
```bash
# Verify VITE_API_URL in .env.docker
# Check CORS_ORIGIN allows your frontend domain

# Restart frontend after env changes
docker-compose restart frontend
```

### Out of memory
```bash
# Check memory usage
docker stats

# Increase Docker memory limit in Docker Desktop settings
# Or add resource limits in docker-compose.yml
```

### Permission errors
```bash
# Fix uploads directory permissions
sudo chown -R 1000:1000 backend/uploads

# Or run with correct user
docker-compose down
docker-compose up -d
```

### SSL/HTTPS Setup

For production with HTTPS, add Nginx reverse proxy or use Traefik:

```yaml
# Add to docker-compose.prod.yml
services:
  traefik:
    image: traefik:v2.10
    command:
      - --api.dashboard=true
      - --providers.docker=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.letsencrypt.acme.httpchallenge=true
      - --certificatesresolvers.letsencrypt.acme.email=your-email@domain.com
      - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
```

## Monitoring

### Health checks
```bash
# Backend health
curl http://localhost:5000/api/v1/health

# Frontend health
curl http://localhost:3000/health
```

### Logs monitoring
```bash
# Real-time logs with timestamps
docker-compose logs -f --timestamps

# Save logs to file
docker-compose logs > app.log
```

## Scaling

### Horizontal scaling
```bash
# Scale backend to 3 replicas
docker-compose up -d --scale backend=3

# With load balancer (add nginx/traefik)
```

## Backup & Recovery

### Automated backups
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec ementech-mongodb mongodump --archive=/backup/db_$DATE.archive
docker cp ementech-mongodb:/backup/db_$DATE.archive ./backups/
```

### Recovery
```bash
# Restore from backup
docker cp ./backups/db_20240101_120000.archive ementech-mongodb:/backup/
docker exec ementech-mongodb mongorestore --archive=/backup/db_20240101_120000.archive
```

## Production Checklist

- [ ] Strong JWT secret configured
- [ ] Secure database passwords
- [ ] HTTPS/SSL certificate configured
- [ ] CORS properly configured
- [ ] M-Pesa production credentials
- [ ] External MongoDB (Atlas/managed service)
- [ ] Redis persistence enabled
- [ ] Automated backups configured
- [ ] Monitoring and alerting setup
- [ ] Log aggregation configured
- [ ] Resource limits set
- [ ] Health checks working
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] Environment variables secured (not in git)

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- GitHub Issues: [repository-url]/issues
- Documentation: ./docs/
