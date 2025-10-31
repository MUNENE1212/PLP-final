# Render Deployment Guide for EmEnTech

Complete guide for deploying the EmEnTech platform to Render.com.

## Table of Contents
- [Prerequisites](#prerequisites)
- [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [Render Account Setup](#render-account-setup)
- [Deployment Methods](#deployment-methods)
- [Post-Deployment Tasks](#post-deployment-tasks)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying to Render, ensure you have:

1. **GitHub Account** with your code repository
2. **Render Account** (free tier available at https://render.com)
3. **MongoDB Atlas Account** (free tier available at https://www.mongodb.com/cloud/atlas)
4. **M-Pesa Developer Account** (https://developer.safaricom.co.ke)
5. **Domain name** (optional, for custom domains)

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Cluster

```bash
# Steps:
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up/Login
3. Click "Build a Database"
4. Choose "FREE" tier (M0 Sandbox)
5. Select provider: AWS
6. Select region: Choose closest to your users (e.g., eu-west-1 for Europe)
7. Cluster name: ementech-cluster
8. Click "Create"
```

### 2. Configure Database Access

```bash
# Create database user:
1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Authentication Method: Password
4. Username: ementech_admin
5. Password: Generate secure password (save it!)
6. Database User Privileges: Atlas admin
7. Click "Add User"
```

### 3. Configure Network Access

```bash
# Whitelist Render IPs:
1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   Note: This is safe for Atlas as it still requires authentication
4. Click "Confirm"
```

### 4. Get Connection String

```bash
# Get MongoDB URI:
1. Go to "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: Node.js, Version: 5.5 or later
5. Copy connection string:
   mongodb+srv://ementech_admin:<password>@ementech-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority

6. Replace <password> with your actual password
7. Add database name before the "?":
   mongodb+srv://ementech_admin:yourpassword@ementech-cluster.xxxxx.mongodb.net/ementech?retryWrites=true&w=majority
```

## Render Account Setup

### 1. Sign Up/Login to Render

```bash
1. Go to https://render.com
2. Sign up with GitHub (recommended)
3. Authorize Render to access your repositories
```

### 2. Connect GitHub Repository

```bash
1. From Render Dashboard, your GitHub repos are automatically accessible
2. If not, go to Account Settings > Connected Accounts
3. Connect your GitHub account
```

## Deployment Methods

### Method 1: Using render.yaml (Blueprint) - RECOMMENDED

This is the fastest method - deploys all services with one click.

#### Step 1: Push render.yaml to GitHub

```bash
# render.yaml is already in your repository root
git add render.yaml .env.render.example
git commit -m "Add Render deployment configuration"
git push origin master
```

#### Step 2: Create Blueprint on Render

```bash
1. Go to Render Dashboard
2. Click "New" > "Blueprint"
3. Connect your GitHub repository
4. Render will detect render.yaml automatically
5. Click "Apply"
```

#### Step 3: Configure Environment Variables

Render will prompt you to set these variables:

**Backend Service:**
```bash
MONGODB_URI=mongodb+srv://ementech_admin:password@cluster.mongodb.net/ementech?retryWrites=true&w=majority
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
```

**Frontend Service:**
```bash
# VITE_API_URL is auto-configured in render.yaml
# No manual config needed
```

#### Step 4: Deploy

```bash
1. Click "Create" or "Apply"
2. Render will:
   - Create backend web service
   - Create frontend static site
   - Create Redis instance
   - Deploy all services
3. Wait 5-10 minutes for initial deployment
```

### Method 2: Manual Service Creation

If you prefer manual setup:

#### A. Create Backend Service

```bash
1. Dashboard > New > Web Service
2. Connect repository
3. Configure:
   Name: ementech-backend
   Region: Oregon (US West)
   Branch: master
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Starter ($7/month) or Free

4. Add Environment Variables (see .env.render.example)
5. Click "Create Web Service"
```

#### B. Create Redis Service

```bash
1. Dashboard > New > Redis
2. Configure:
   Name: ementech-redis
   Region: Oregon (same as backend)
   Plan: Starter ($7/month) or Free
   Maxmemory Policy: allkeys-lru
3. Click "Create Redis"
4. Copy Redis connection details
```

#### C. Update Backend Environment Variables

```bash
1. Go to backend service > Environment
2. Add Redis variables:
   REDIS_HOST=<from-redis-internal-url>
   REDIS_PORT=6379
```

#### D. Create Frontend Service

```bash
1. Dashboard > New > Static Site
2. Connect repository
3. Configure:
   Name: ementech-frontend
   Region: Oregon
   Branch: master
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   Plan: Starter or Free

4. Add Environment Variable:
   VITE_API_URL=https://ementech-backend.onrender.com/api/v1

5. Click "Create Static Site"
```

## Post-Deployment Tasks

### 1. Seed Pricing Data

```bash
# Option A: Via Render Shell
1. Go to backend service > Shell
2. Run:
   cd backend
   npm run seed:pricing

# Option B: Via API endpoint (if you created one)
curl -X POST https://ementech-backend.onrender.com/api/v1/admin/seed-pricing \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. Update M-Pesa Callback URL

```bash
1. Go to M-Pesa Developer Portal
2. Update callback URL to:
   https://ementech-backend.onrender.com/api/v1/payments/mpesa/callback
3. Update environment variable:
   MPESA_CALLBACK_URL=https://ementech-backend.onrender.com/api/v1/payments/mpesa/callback
```

### 3. Update CORS Origin

```bash
1. Go to backend service > Environment
2. Update:
   CORS_ORIGIN=https://ementech-frontend.onrender.com
3. Save changes (auto-redeploys)
```

### 4. Test the Application

```bash
# Frontend URL (example):
https://ementech-frontend.onrender.com

# Backend API URL (example):
https://ementech-backend.onrender.com/api/v1

# Health check:
curl https://ementech-backend.onrender.com/api/v1/health
```

### 5. Configure Custom Domain (Optional)

```bash
# For Frontend:
1. Go to frontend service > Settings
2. Scroll to "Custom Domains"
3. Add your domain: www.ementech.com
4. Follow DNS configuration instructions
5. Render provides free SSL

# For Backend API:
1. Go to backend service > Settings
2. Add custom domain: api.ementech.com
3. Update frontend VITE_API_URL
4. Update M-Pesa callback URL
```

## Monitoring and Maintenance

### 1. View Logs

```bash
# Backend logs:
1. Go to backend service
2. Click "Logs" tab
3. Set filters (errors, warnings, info)
4. Download logs if needed

# Frontend logs:
1. Go to frontend service
2. Click "Logs" tab
3. View build and deployment logs
```

### 2. Monitor Service Health

```bash
# Render Dashboard shows:
- Service status (Running, Failed, Deploying)
- Resource usage (CPU, Memory)
- Deployment history
- Automatic health checks

# Health check endpoint:
https://ementech-backend.onrender.com/api/v1/health
```

### 3. Auto-Deploy on Git Push

```bash
# Already configured in render.yaml
# Every push to master branch triggers:
1. Automatic rebuild
2. Automatic deployment
3. Zero-downtime updates

# To disable auto-deploy:
1. Service > Settings
2. Uncheck "Auto-Deploy"
```

### 4. Manual Deploys

```bash
1. Go to service
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy" if needed
```

### 5. Scaling

```bash
# Free tier limitations:
- Services spin down after 15 min inactivity
- First request after sleep takes ~30 seconds

# Paid plans ($7/month):
- Always-on services
- Better performance
- More resources

# To upgrade:
1. Service > Settings
2. Change plan to "Starter" or higher
```

## Environment Variables Reference

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection | `mongodb+srv://user:pass@cluster...` |
| `JWT_SECRET` | JWT secret key | Auto-generated or custom |
| `JWT_EXPIRE` | Token expiration | `30d` |
| `REDIS_HOST` | Redis host | Auto-configured |
| `REDIS_PORT` | Redis port | `6379` |
| `CORS_ORIGIN` | Allowed origin | `https://ementech-frontend.onrender.com` |
| `MPESA_CONSUMER_KEY` | M-Pesa key | From M-Pesa portal |
| `MPESA_CONSUMER_SECRET` | M-Pesa secret | From M-Pesa portal |
| `MPESA_PASSKEY` | M-Pesa passkey | From M-Pesa portal |
| `MPESA_SHORTCODE` | Business code | `174379` (sandbox) |
| `MPESA_ENVIRONMENT` | M-Pesa env | `sandbox` or `production` |
| `MPESA_CALLBACK_URL` | Callback URL | `https://your-backend/api/v1/payments/mpesa/callback` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://ementech-backend.onrender.com/api/v1` |

## Troubleshooting

### Issue: Service Won't Start

```bash
# Check logs:
1. Service > Logs
2. Look for errors

# Common causes:
- Missing environment variables
- MongoDB connection failed
- Port already in use
- Build failed

# Fix:
1. Verify all environment variables are set
2. Check MongoDB Atlas network access (0.0.0.0/0)
3. Check MongoDB user credentials
4. Redeploy with "Clear build cache"
```

### Issue: Frontend Can't Connect to Backend

```bash
# Check:
1. Backend is running (green status)
2. VITE_API_URL is correct
3. CORS_ORIGIN includes frontend URL
4. Backend health endpoint works

# Fix:
1. Update VITE_API_URL: https://ementech-backend.onrender.com/api/v1
2. Update CORS_ORIGIN: https://ementech-frontend.onrender.com
3. Redeploy frontend after changing VITE_API_URL
```

### Issue: MongoDB Connection Failed

```bash
# Check:
1. MongoDB Atlas cluster is running
2. Network access allows 0.0.0.0/0
3. Database user exists and has correct password
4. Connection string is correct

# Test connection:
1. Backend service > Shell
2. Run:
   node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.log(e))"
```

### Issue: M-Pesa Payments Failing

```bash
# Check:
1. M-Pesa credentials are correct
2. Callback URL is accessible
3. Shortcode matches environment (sandbox/production)

# Test callback URL:
curl https://ementech-backend.onrender.com/api/v1/payments/mpesa/callback

# Verify in M-Pesa portal:
- Callback URL is registered
- Credentials are for correct environment
```

### Issue: Service Sleeps on Free Tier

```bash
# Free tier limitation:
- Services spin down after 15 min inactivity
- First request takes ~30 seconds to wake up

# Solutions:
1. Upgrade to paid plan ($7/month)
2. Use external ping service (UptimeRobot, Pingdom)
3. Accept the limitation for low-traffic apps
```

### Issue: Build Fails

```bash
# Check logs for:
- npm install errors
- Missing dependencies
- Build script errors

# Fix:
1. Ensure package.json is correct
2. Ensure all dependencies are listed
3. Clear build cache and redeploy
4. Check Node.js version compatibility
```

## Cost Estimate

### Free Tier
- **Backend**: Free (with limitations)
- **Frontend**: Free
- **Redis**: Free (25MB)
- **MongoDB**: Free (Atlas M0 - 512MB)
- **Total**: $0/month

### Paid Tier (Recommended for Production)
- **Backend**: $7/month (Starter plan)
- **Frontend**: $0 (static sites are free)
- **Redis**: $7/month (Starter plan)
- **MongoDB**: $0 (Atlas M0) or $9/month (M2)
- **Total**: ~$14-23/month

## Security Best Practices

1. **Environment Variables**: Never commit secrets to GitHub
2. **JWT Secret**: Use strong random string (32+ characters)
3. **MongoDB**: Use Atlas (managed, secure, backups)
4. **HTTPS**: Render provides free SSL automatically
5. **CORS**: Restrict to your frontend domain only
6. **Rate Limiting**: Already implemented in backend
7. **Input Validation**: Already implemented
8. **Helmet.js**: Add security headers (recommended)

## Backup Strategy

```bash
# MongoDB Atlas automatic backups (M2+ tier):
- Daily snapshots
- Point-in-time recovery
- 7-day retention

# Manual backup:
1. Use MongoDB Compass
2. Connect to Atlas
3. Export collections
4. Store backup securely

# Redis:
- Data is cache only
- No backup needed
- Rebuilds on restart
```

## Next Steps

1. ✅ Deploy to Render using Blueprint
2. ✅ Configure environment variables
3. ✅ Seed pricing data
4. ✅ Test all features
5. ⬜ Set up custom domain
6. ⬜ Configure monitoring alerts
7. ⬜ Set up backup strategy
8. ⬜ Plan for scaling

## Resources

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **M-Pesa Daraja**: https://developer.safaricom.co.ke/Documentation
- **Render Community**: https://community.render.com/

## Support

- **Render Support**: https://render.com/support
- **Project Issues**: GitHub Issues
- **Documentation**: See `docs/` folder

---

**Deployment Status**: Ready for production deployment on Render.com
