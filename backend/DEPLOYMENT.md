# BaiTech Backend - Deployment Guide

This guide covers various deployment options for the BaiTech backend API.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
  - [Heroku](#option-1-heroku)
  - [DigitalOcean App Platform](#option-2-digitalocean-app-platform)
  - [AWS EC2](#option-3-aws-ec2)
  - [Docker & Docker Compose](#option-4-docker--docker-compose)
  - [VPS (Ubuntu)](#option-5-vps-ubuntu)
- [Database Setup](#database-setup)
- [SSL/HTTPS Configuration](#sslhttps-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Backup Strategy](#backup-strategy)
- [CI/CD Pipeline](#cicd-pipeline)
- [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

### Security
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong, unique `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Configure CORS with production URLs only
- [ ] Enable HTTPS/SSL
- [ ] Set up rate limiting
- [ ] Review and update security headers
- [ ] Enable MongoDB authentication
- [ ] Secure API keys and credentials

### Performance
- [ ] Set up MongoDB indexes
- [ ] Configure Redis for caching (optional)
- [ ] Enable compression
- [ ] Set up CDN for static assets (if any)
- [ ] Configure connection pooling
- [ ] Optimize database queries

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure application monitoring (New Relic, Datadog)
- [ ] Set up log aggregation
- [ ] Configure uptime monitoring
- [ ] Set up alerts for critical errors

### Backup
- [ ] Configure automated database backups
- [ ] Test restore procedures
- [ ] Set up file storage backups (Cloudinary)
- [ ] Document backup locations

### Documentation
- [ ] Update API documentation
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Update environment variables guide

---

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file with the following:

```bash
# Server
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/baitech?retryWrites=true&w=majority

# JWT (Use strong, random secrets)
JWT_SECRET=<generate-with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<generate-another-strong-secret>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Redis (Optional - for caching)
REDIS_URL=redis://:<password>@redis-cloud-url:port

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>
EMAIL_FROM=noreply@baitech.com

# SMS (Africa's Talking)
AT_USERNAME=<production-username>
AT_API_KEY=<production-api-key>
AT_SENDER_ID=BAITECH

# M-Pesa (Production)
MPESA_CONSUMER_KEY=<production-key>
MPESA_CONSUMER_SECRET=<production-secret>
MPESA_PASSKEY=<production-passkey>
MPESA_SHORTCODE=<your-shortcode>
MPESA_ENVIRONMENT=production
MPESA_CALLBACK_URL=https://api.baitech.com/api/v1/payments/mpesa/callback

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_<your-live-key>
STRIPE_PUBLISHABLE_KEY=pk_live_<your-live-key>
STRIPE_WEBHOOK_SECRET=whsec_<your-webhook-secret>

# Firebase
FIREBASE_PROJECT_ID=<your-project-id>
FIREBASE_PRIVATE_KEY="<your-private-key>"
FIREBASE_CLIENT_EMAIL=<your-client-email>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# Client URLs
CLIENT_WEB_URL=https://baitech.com
CLIENT_MOBILE_URL=baitech://

# Monitoring
SENTRY_DSN=<your-sentry-dsn>
NEW_RELIC_LICENSE_KEY=<your-new-relic-key>
NEW_RELIC_APP_NAME=BaiTech-Backend-Production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Deployment Options

### Option 1: Heroku

Heroku is ideal for quick deployments with minimal configuration.

#### Prerequisites
- Heroku account
- Heroku CLI installed

#### Steps

1. **Login to Heroku**
```bash
heroku login
```

2. **Create Heroku App**
```bash
heroku create baitech-api-prod
```

3. **Add MongoDB Atlas Add-on (or use your own)**
```bash
# Option 1: Use Heroku MongoDB add-on
heroku addons:create mongolab:sandbox

# Option 2: Set your own MongoDB Atlas URI
heroku config:set MONGODB_URI="mongodb+srv://..."
```

4. **Set Environment Variables**
```bash
# Set all required environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="your-secret"
heroku config:set JWT_REFRESH_SECRET="your-refresh-secret"
# ... set all other variables from .env.production
```

5. **Deploy**
```bash
git push heroku main
```

6. **Scale Dynos**
```bash
# Use at least Standard-1X for production
heroku ps:scale web=1:standard-1x
```

7. **View Logs**
```bash
heroku logs --tail
```

#### Heroku Configuration

Create a `Procfile` in the root:
```
web: node src/server.js
```

Create `heroku.yml` for containerized deployment:
```yaml
build:
  docker:
    web: Dockerfile
run:
  web: node src/server.js
```

---

### Option 2: DigitalOcean App Platform

Simple PaaS solution with good pricing.

#### Steps

1. **Connect Repository**
   - Go to DigitalOcean App Platform
   - Connect your GitHub/GitLab repository

2. **Configure App**
```yaml
name: baitech-api
services:
- name: api
  github:
    repo: your-username/baitech-backend
    branch: main
  run_command: node src/server.js
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: ${db.DATABASE_URL}
  # Add all other environment variables

databases:
- name: db
  engine: MONGODB
  version: "6"
```

3. **Deploy**
   - Click "Create Resources"
   - App will auto-deploy on git push

---

### Option 3: AWS EC2

Full control over the infrastructure.

#### Prerequisites
- AWS account
- SSH key pair
- Basic Linux knowledge

#### Steps

1. **Launch EC2 Instance**
```bash
# Choose Ubuntu 22.04 LTS
# Instance type: t3.medium (recommended for production)
# Configure security group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (API)
```

2. **Connect to Instance**
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

3. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

4. **Clone Repository**
```bash
cd /var/www
sudo git clone https://github.com/your-username/baitech-backend.git
cd baitech-backend
sudo npm install --production
```

5. **Configure Environment**
```bash
sudo nano .env
# Add production environment variables
```

6. **Start with PM2**
```bash
pm2 start src/server.js --name baitech-api
pm2 save
pm2 startup
```

7. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/baitech-api
```

Add configuration:
```nginx
server {
    listen 80;
    server_name api.baitech.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/baitech-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

8. **Set up SSL with Certbot**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.baitech.com
```

---

### Option 4: Docker & Docker Compose

Containerized deployment for consistency across environments.

#### Dockerfile

Create `Dockerfile` in root:
```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "src/server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/baitech
    env_file:
      - .env.production
    depends_on:
      - mongo
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mongo:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=secure-password
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped

volumes:
  mongo-data:
  redis-data:
```

#### Deploy with Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

---

### Option 5: VPS (Ubuntu)

Manual setup on any VPS (Linode, Vultr, etc.).

See [AWS EC2](#option-3-aws-ec2) steps - they apply to any Ubuntu VPS.

---

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Go to MongoDB Atlas
   - Create a new cluster
   - Choose region closest to your app server

2. **Configure Network Access**
   - Add your server IP to IP Whitelist
   - Or allow access from anywhere (0.0.0.0/0) with strong auth

3. **Create Database User**
   - Create user with read/write permissions
   - Use strong password

4. **Get Connection String**
```
mongodb+srv://username:password@cluster.mongodb.net/baitech?retryWrites=true&w=majority
```

### Self-Hosted MongoDB

If hosting MongoDB yourself:

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Secure MongoDB
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "strong-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Enable authentication
sudo nano /etc/mongod.conf
# Add:
# security:
#   authorization: enabled

sudo systemctl restart mongod
```

---

## SSL/HTTPS Configuration

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d api.baitech.com

# Auto-renewal (runs automatically)
sudo certbot renew --dry-run
```

### Using Custom SSL Certificate

If you have a custom certificate:

```nginx
server {
    listen 443 ssl http2;
    server_name api.baitech.com;

    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:5000;
        # ... other proxy settings
    }
}
```

---

## Monitoring & Logging

### PM2 Monitoring

```bash
# View process status
pm2 status

# View logs
pm2 logs baitech-api

# Monitor resources
pm2 monit
```

### Set up Sentry for Error Tracking

1. **Install Sentry SDK**
```bash
npm install @sentry/node
```

2. **Configure in server.js**
```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Add before routes
app.use(Sentry.Handlers.requestHandler());

// Add before error handlers
app.use(Sentry.Handlers.errorHandler());
```

### Log Aggregation

Use services like:
- **Papertrail**: Easy log aggregation
- **Loggly**: Advanced log analysis
- **ELK Stack**: Self-hosted solution

---

## Backup Strategy

### MongoDB Backups

#### Automated Daily Backups

Create backup script `/usr/local/bin/backup-mongodb.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mongodb"
mkdir -p $BACKUP_DIR

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

# Upload to S3 (optional)
aws s3 sync $BACKUP_DIR s3://your-backup-bucket/mongodb/
```

Add to crontab:
```bash
# Run daily at 2 AM
0 2 * * * /usr/local/bin/backup-mongodb.sh
```

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /var/www/baitech-backend
          git pull origin main
          npm install --production
          pm2 reload baitech-api
```

---

## Troubleshooting

### Common Issues

**Server Won't Start**
```bash
# Check logs
pm2 logs baitech-api --lines 100

# Check if port is in use
sudo lsof -i :5000
```

**MongoDB Connection Fails**
```bash
# Test connection
mongosh "$MONGODB_URI"

# Check network access in MongoDB Atlas
```

**High Memory Usage**
```bash
# Check process memory
pm2 list
pm2 monit

# Restart if needed
pm2 restart baitech-api
```

**SSL Certificate Issues**
```bash
# Test certificate
sudo certbot certificates

# Renew manually
sudo certbot renew
```

---

## Performance Tuning

### PM2 Cluster Mode

```bash
# Start in cluster mode (uses all CPU cores)
pm2 start src/server.js -i max --name baitech-api
```

### Nginx Caching

Add to nginx configuration:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g;

location / {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_bypass $http_pragma;
    add_header X-Cache-Status $upstream_cache_status;
    # ... other settings
}
```

---

## Support

For deployment issues:
- Check logs first
- Review this guide
- Contact: devops@baitech.com

---

**Last Updated**: October 2025
