# Dumuwaks CI/CD Strategy v1

## Executive Summary

This document outlines the comprehensive CI/CD strategy for Dumuwaks, designed for deployment to the VPS at 69.164.244.165. The strategy ensures zero-downtime deployments, automated testing, robust monitoring, and disaster recovery capabilities.

---

## Table of Contents

1. [Current Infrastructure Assessment](#1-current-infrastructure-assessment)
2. [CI/CD Pipeline Design](#2-cicd-pipeline-design)
3. [VPS Deployment Strategy](#3-vps-deployment-strategy)
4. [Monitoring & Observability](#4-monitoring--observability)
5. [Backup Strategy](#5-backup-strategy)
6. [Security Considerations](#6-security-considerations)
7. [Deployment Runbook](#7-deployment-runbook)
8. [Troubleshooting Guide](#8-troubleshooting-guide)

---

## 1. Current Infrastructure Assessment

### 1.1 VPS Configuration

| Component | Details |
|-----------|---------|
| **IP Address** | 69.164.244.165 |
| **Process Manager** | PM2 |
| **Reverse Proxy** | Nginx |
| **SSL** | Let's Encrypt/Certbot |
| **Backend Port** | 5000 |
| **Backend Process** | PM2 "dumuwaks-backend" |
| **Frontend Path** | /var/www/dumuwaks/current |
| **API Domain** | https://api.ementech.co.ke |
| **Frontend Domain** | https://dumuwaks.ementech.co.ke |

### 1.2 Multi-Tenant Environment

**IMPORTANT**: The VPS hosts multiple services:
- **baitech** - DO NOT TOUCH
- **ementech** - DO NOT TOUCH
- **dumuwaks** - This project

### 1.3 Identified Pain Points

1. **Manual Deployments**: Current deployments require manual SSH access
2. **No Rollback Automation**: Manual rollback process is error-prone
3. **Limited Monitoring**: Basic PM2 monitoring only
4. **No Automated Backups**: Database backups are manual
5. **No Deployment Verification**: Health checks not automated post-deployment
6. **Environment Drift**: No infrastructure-as-code for server configuration

### 1.4 Technology Stack

**Backend:**
- Node.js 18+ with Express
- MongoDB (external - MongoDB Atlas recommended)
- Redis for caching/sessions
- Socket.IO for real-time features
- Cloudinary for media storage

**Frontend:**
- React 18 with TypeScript
- Vite build system
- Redux Toolkit for state management
- Tailwind CSS

---

## 2. CI/CD Pipeline Design

### 2.1 Pipeline Overview

```
+------------------+     +------------------+     +------------------+
|   Code Push      | --> |   CI Pipeline    | --> |   CD Pipeline    |
|   (GitHub)       |     |   (Test/Lint)    |     |   (Deploy)       |
+------------------+     +------------------+     +------------------+
                                |                        |
                                v                        v
                        +------------------+     +------------------+
                        |  Artifacts/      |     |  VPS Deployment  |
                        |  Coverage        |     |  (Zero-downtime) |
                        +------------------+     +------------------+
```

### 2.2 GitHub Actions Workflows

#### 2.2.1 CI Pipeline (`.github/workflows/ci.yml`) - EXISTING

The CI pipeline includes:
- Linting (ESLint for both frontend and backend)
- Unit tests with coverage
- Integration tests with MongoDB and Redis containers
- Build verification for frontend
- Coverage reports uploaded as artifacts

**Triggers:**
- Pull requests to `master` and `develop`
- Pushes to `develop` branch

#### 2.2.2 VPS Deployment Pipeline (NEW)

**File:** `.github/workflows/deploy-vps.yml`

**Triggers:**
- Push to `master` branch (after CI passes)
- Manual workflow dispatch with environment selection

**Features:**
- CI verification before deployment
- Zero-downtime deployment strategy
- Automated health checks post-deployment
- Rollback capability on failure
- Slack/Email notifications

### 2.3 Branch Strategy

```
master (production)
  |
  +-- develop (staging/integration)
        |
        +-- feature/* (feature branches)
        |
        +-- bugfix/* (bug fix branches)
        |
        +-- hotfix/* (emergency fixes)
```

**Workflow:**
1. Feature branches merge to `develop` (triggers CI)
2. `develop` merges to `master` (triggers CI + optional staging deploy)
3. `master` pushes trigger production deployment

---

## 3. VPS Deployment Strategy

### 3.1 Zero-Downtime Deployment Process

```
+------------------------------------------------------------------+
|                    ZERO-DOWNTIME DEPLOYMENT                      |
+------------------------------------------------------------------+
|                                                                   |
|  1. Pre-deployment Health Check                                   |
|     GET https://api.ementech.co.ke/api/v1/health                  |
|                                                                   |
|  2. Pull Latest Code                                              |
|     git fetch origin && git checkout master                       |
|                                                                   |
|  3. Backup Current Version                                        |
|     cp -r /var/www/dumuwaks/current /var/www/dumuwaks/backup      |
|                                                                   |
|  4. Build New Version (in temp directory)                         |
|     npm ci && npm run build --> /var/www/dumuwaks/staging        |
|                                                                   |
|  5. Atomic Switch (symlink swap)                                  |
|     ln -sfn /var/www/dumuwaks/staging /var/www/dumuwaks/current   |
|                                                                   |
|  6. Graceful Backend Reload                                       |
|     pm2 reload dumuwaks-backend --update-env                      |
|                                                                   |
|  7. Post-deployment Health Check                                  |
|     Wait for healthy response (max 60s)                           |
|                                                                   |
|  8. Rollback on Failure                                           |
|     ln -sfn /var/www/dumuwaks/backup /var/www/dumuwaks/current    |
|     pm2 restart dumuwaks-backend                                  |
|                                                                   |
+------------------------------------------------------------------+
```

### 3.2 Directory Structure on VPS

```
/var/www/dumuwaks/
├── current/           # Symlink to active release
├── releases/          # All releases (keep last 5)
│   ├── 20240115_120000/
│   ├── 20240115_140000/
│   └── 20240115_160000/
├── backup/            # Previous stable version
├── shared/            # Shared files across releases
│   ├── .env           # Environment variables
│   ├── logs/          # Application logs
│   └── uploads/       # User uploads
└── scripts/           # Deployment scripts
    ├── deploy.sh
    ├── rollback.sh
    └── health-check.sh
```

### 3.3 PM2 Ecosystem Configuration

The `ecosystem.config.js` file configures:
- Application name: `dumuwaks-backend`
- Instances: 2 (cluster mode for redundancy)
- Memory limit: 512MB per instance
- Auto-restart on crash
- Log rotation

---

## 4. Monitoring & Observability

### 4.1 Health Check Endpoints

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/health` | Basic health | 200 OK with status |
| `/api/v1/health` | API health | 200 OK with DB status |
| `/api/v1/admin/status` | Detailed status | Admin only |

### 4.2 Logging Strategy

**Application Logs:**
- Location: `/var/www/dumuwaks/shared/logs/`
- Format: JSON structured logging (Winston)
- Rotation: Daily rotation, keep 30 days
- Levels: error, warn, info, debug

**Nginx Logs:**
- Access: `/var/log/nginx/dumuwaks.access.log`
- Error: `/var/log/nginx/dumuwaks.error.log`
- Rotation: logrotate daily

**PM2 Logs:**
- Output: `~/.pm2/logs/dumuwaks-backend-out.log`
- Error: `~/.pm2/logs/dumuwaks-backend-error.log`

### 4.3 Metrics Collection

**System Metrics (PM2):**
- CPU usage
- Memory usage
- Event loop lag
- Request count

**Application Metrics:**
- Response time (p50, p95, p99)
- Error rate
- Active connections
- Database query performance

### 4.4 Alerting Configuration

**Critical Alerts:**
1. Application down (health check fails for 2+ minutes)
2. Error rate > 5% over 5 minutes
3. Response time p95 > 2 seconds
4. Disk usage > 85%
5. Memory usage > 90%

**Warning Alerts:**
1. Response time p95 > 1 second
2. Error rate > 1% over 5 minutes
3. Disk usage > 70%

### 4.5 External Monitoring (Recommended)

- **UptimeRobot**: Free uptime monitoring
- **Sentry**: Error tracking and performance
- **Grafana Cloud**: Metrics and dashboards (free tier)

---

## 5. Backup Strategy

### 5.1 Database Backups

**MongoDB Atlas (Recommended):**
- Automated daily backups included
- Point-in-time recovery available
- Cross-region backup replication

**Self-Managed Backups (if not using Atlas):**

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="/backups/mongodb/$DATE"
# Compress and upload to S3/Backblaze
tar -czf "/backups/mongodb/$DATE.tar.gz" "/backups/mongodb/$DATE"
rm -rf "/backups/mongodb/$DATE"
```

**Retention Policy:**
- Hourly: Keep last 24
- Daily: Keep last 7
- Weekly: Keep last 4
- Monthly: Keep last 12

### 5.2 Application Backups

**Files to Backup:**
- `/var/www/dumuwaks/shared/.env` (encrypted)
- `/var/www/dumuwaks/shared/uploads/`
- Nginx configuration
- PM2 configuration

**Backup Schedule:**
- Configuration: Before each deployment
- User uploads: Daily incremental, weekly full

### 5.3 Disaster Recovery Plan

**Recovery Time Objective (RTO):** 30 minutes
**Recovery Point Objective (RPO):** 1 hour

**Recovery Steps:**
1. Provision new VPS or restore from snapshot
2. Install dependencies (Node.js, PM2, Nginx)
3. Restore configuration from backup
4. Restore database from latest backup
5. Deploy application
6. Verify health checks
7. Update DNS if IP changed

---

## 6. Security Considerations

### 6.1 Server Security

- [ ] UFW firewall configured (only 22, 80, 443 open)
- [ ] Fail2ban installed and configured
- [ ] SSH key-based authentication only
- [ ] Root login disabled
- [ ] Automatic security updates enabled

### 6.2 Application Security

- [ ] Environment variables for all secrets
- [ ] HTTPS enforced (HSTS enabled)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Helmet security headers
- [ ] Input validation (express-validator)

### 6.3 CI/CD Security

- [ ] GitHub Secrets for sensitive data
- [ ] SSH key for deployment (limited scope)
- [ ] Environment protection rules
- [ ] Required reviewers for production

### 6.4 Secrets Management

**GitHub Secrets Required:**

| Secret | Description |
|--------|-------------|
| `VPS_SSH_KEY` | Private SSH key for VPS access |
| `VPS_HOST` | VPS IP address (69.164.244.165) |
| `VPS_USER` | SSH user (root or deploy user) |
| `VPS_PORT` | SSH port (default 22) |
| `SLACK_WEBHOOK_URL` | For deployment notifications |

**VPS Environment Variables:**
Stored in `/var/www/dumuwaks/shared/.env` (not in Git)

---

## 7. Deployment Runbook

### 7.1 Pre-Deployment Checklist

- [ ] All CI tests passing
- [ ] Code reviewed and approved
- [ ] Changelog updated
- [ ] Database migrations reviewed (if any)
- [ ] Environment variables updated (if needed)
- [ ] Backup verified
- [ ] Team notified

### 7.2 Standard Deployment (Automated)

1. Merge PR to `master`
2. CI pipeline runs automatically
3. On success, deployment pipeline triggers
4. Monitor deployment in GitHub Actions
5. Verify health checks pass
6. Check application logs for errors

### 7.3 Manual Deployment

```bash
# SSH to VPS
ssh root@69.164.244.165

# Navigate to application
cd /var/www/dumuwaks

# Run deployment script
./scripts/deploy.sh

# Or manual steps:
cd /var/www/dumuwaks/repo
git pull origin master
cd backend && npm ci --production
cd ../frontend && npm ci && npm run build
pm2 reload dumuwaks-backend
```

### 7.4 Rollback Procedure

```bash
# Automatic rollback (from GitHub Actions)
# Trigger "deploy-vps.yml" with "rollback" input

# Manual rollback
ssh root@69.164.244.165
cd /var/www/dumuwaks
./scripts/rollback.sh

# Or manual steps:
ln -sfn /var/www/dumuwaks/backup /var/www/dumuwaks/current
pm2 restart dumuwaks-backend
```

### 7.5 Post-Deployment Verification

```bash
# Health check
curl -f https://api.ementech.co.ke/api/v1/health

# Check PM2 status
pm2 status

# Check recent logs
pm2 logs dumuwaks-backend --lines 100

# Check Nginx
nginx -t
systemctl status nginx
```

---

## 8. Troubleshooting Guide

### 8.1 Common Issues

#### Deployment Fails

1. Check GitHub Actions logs
2. SSH to VPS and check disk space: `df -h`
3. Check PM2 logs: `pm2 logs dumuwaks-backend`
4. Verify environment variables exist

#### Application Not Responding

1. Check PM2 status: `pm2 status`
2. Check if port is listening: `netstat -tlnp | grep 5000`
3. Check Nginx: `nginx -t && systemctl status nginx`
4. Check firewall: `ufw status`

#### Database Connection Issues

1. Verify MongoDB URI in `.env`
2. Test connection: `mongosh "$MONGODB_URI"`
3. Check network connectivity
4. Verify IP whitelist (if using Atlas)

#### SSL Certificate Issues

1. Check certbot: `certbot certificates`
2. Renew if expired: `certbot renew`
3. Verify Nginx config references correct cert paths

### 8.2 Emergency Contacts

- **DevOps Lead**: [Contact Info]
- **Backend Lead**: [Contact Info]
- **VPS Provider Support**: [Contact Info]

### 8.3 Useful Commands

```bash
# View PM2 processes
pm2 list

# View detailed process info
pm2 show dumuwaks-backend

# View logs in real-time
pm2 logs dumuwaks-backend

# Monitor resources
pm2 monit

# Restart application
pm2 restart dumuwaks-backend

# Reload (zero-downtime)
pm2 reload dumuwaks-backend

# Check Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx

# View Nginx access logs
tail -f /var/log/nginx/dumuwaks.access.log

# View Nginx error logs
tail -f /var/log/nginx/dumuwaks.error.log

# Check disk usage
du -sh /var/www/dumuwaks/*

# Free up space (old releases)
rm -rf /var/www/dumuwaks/releases/*  # Keep only recent
```

---

## Appendix A: Files Created

| File | Purpose |
|------|---------|
| `.github/workflows/deploy-vps.yml` | GitHub Actions VPS deployment workflow |
| `scripts/deploy.sh` | Main deployment script |
| `scripts/rollback.sh` | Rollback script |
| `scripts/health-check.sh` | Health check script |
| `ecosystem.config.js` | PM2 configuration |
| `nginx/dumuwaks.conf` | Nginx site configuration |
| `scripts/backup.sh` | Backup automation script |
| `scripts/setup-vps.sh` | Initial VPS setup script |

## Appendix B: GitHub Secrets Required

| Secret Name | Required | Description |
|-------------|----------|-------------|
| `VPS_SSH_KEY` | Yes | Private SSH key for VPS |
| `VPS_HOST` | Yes | 69.164.244.165 |
| `VPS_USER` | Yes | SSH username (root or deploy) |
| `VPS_PORT` | No | SSH port (default: 22) |
| `SLACK_WEBHOOK_URL` | No | For Slack notifications |
| `JWT_SECRET` | Yes | For CI tests |
| `JWT_REFRESH_SECRET` | Yes | For CI tests |
| `MONGODB_URI` | No | For CI integration tests |

---

**Document Version:** 1.0
**Last Updated:** 2025-02-17
**Author:** DevOps Deployer Agent
