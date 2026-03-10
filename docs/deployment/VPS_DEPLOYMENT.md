# VPS Deployment Guide

Production deployment guide for Dumu Waks on the VPS.

## Production URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://dumuwaks.ementech.co.ke |
| **API** | https://api.ementech.co.ke |
| **Health Check** | https://api.ementech.co.ke/api/v1/health |

## Infrastructure

| Component | Details |
|-----------|---------|
| **VPS IP** | 69.164.244.165 |
| **OS** | Ubuntu 24.04 |
| **Process Manager** | PM2 (cluster mode, 2 instances) |
| **Reverse Proxy** | Nginx |
| **SSL** | Let's Encrypt / Certbot |
| **Backend Port** | 5000 |
| **Frontend Path** | /var/www/dumuwaks/current-frontend |
| **Backend Path** | /var/www/dumuwaks/current/backend |

### Multi-Tenant Warning

The VPS hosts multiple services. **DO NOT** modify anything outside `/var/www/dumuwaks/`.

## Automated Deployment (GitHub Actions)

Pushing to `master` triggers the deployment pipeline automatically.

**Pipeline:** `.github/workflows/deploy-vps.yml`

The pipeline:
1. Verifies CI passes
2. SSHs into the VPS
3. Pulls latest code into a new release directory
4. Builds backend (`npm ci --production`)
5. Builds frontend (`npm ci && npm run build`)
6. Swaps frontend via atomic symlink
7. Reloads backend via PM2 graceful reload (zero downtime)
8. Runs health checks
9. Rolls back automatically if health check fails
10. Cleans up old releases (keeps last 5)

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `VPS_SSH_KEY` | Private SSH key for VPS access |
| `VPS_HOST` | VPS IP address |
| `VPS_USER` | SSH username |
| `VPS_PORT` | SSH port (default 22) |

### Manual Deployment Trigger

Go to **Actions > Deploy to VPS > Run workflow** in GitHub to trigger a manual deployment or rollback.

## Manual Deployment (SSH)

If you need to deploy manually:

```bash
ssh user@69.164.244.165

cd /var/www/dumuwaks/current

# Pull latest code
git pull origin master

# Build backend
cd backend
npm ci --production

# Build frontend
cd ../frontend
npm ci
npm run build

# Copy frontend build
cp -r dist /var/www/dumuwaks/current-frontend

# Reload backend
pm2 reload dumuwaks-backend

# Verify
pm2 status
curl http://localhost:5000/api/v1/health
```

## PM2 Management

```bash
# View status
pm2 status

# View logs
pm2 logs dumuwaks-backend

# Restart
pm2 restart dumuwaks-backend

# Reload (zero downtime)
pm2 reload dumuwaks-backend

# Monitor
pm2 monit
```

Configuration: `ecosystem.config.js`

## Nginx Configuration

The Nginx config proxies:
- `dumuwaks.ementech.co.ke` → static files at `/var/www/dumuwaks/current-frontend`
- `api.ementech.co.ke` → `localhost:5000`

SSL certificates are managed by Certbot and auto-renew.

## Rollback

### Via GitHub Actions
1. Go to **Actions > Deploy to VPS > Run workflow**
2. Select action: `rollback`
3. Optionally specify a version (release timestamp)

### Manual Rollback
```bash
ssh user@69.164.244.165

# List available releases
ls /var/www/dumuwaks/releases/

# Switch to a previous release
ln -sfn /var/www/dumuwaks/releases/<TIMESTAMP> /var/www/dumuwaks/current
cp -r /var/www/dumuwaks/current/frontend/dist /var/www/dumuwaks/current-frontend
cd /var/www/dumuwaks/current/backend
pm2 restart dumuwaks-backend
```

## Health Checks

```bash
# External
curl https://api.ementech.co.ke/api/v1/health

# Internal (from VPS)
curl http://localhost:5000/api/v1/health
```

## Further Reading

- [CI/CD Strategy](../CI_CD_STRATEGY.md) — full pipeline design, monitoring, backup strategy
- [Environment Variables](../backend/ENV_VARIABLES.md) — complete env var reference
