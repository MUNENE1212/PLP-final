# Quick Deploy to Render

**Deploy EmEnTech to Render.com in 10 minutes**

## Prerequisites Checklist

- [ ] GitHub account with repository pushed
- [ ] Render.com account (sign up free at https://render.com)
- [ ] MongoDB Atlas account (sign up free at https://www.mongodb.com/cloud/atlas)
- [ ] M-Pesa developer credentials (sandbox or production)

## Step 1: MongoDB Atlas (5 minutes)

### Create Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up/Login
3. Create free M0 cluster (512MB free)
4. Choose AWS provider, closest region
5. Cluster name: `ementech-cluster`

### Configure Access
1. Database Access: Create user `ementech_admin` with password
2. Network Access: Allow access from anywhere (0.0.0.0/0)
3. Get connection string:
   ```
   mongodb+srv://ementech_admin:PASSWORD@cluster.mongodb.net/ementech?retryWrites=true&w=majority
   ```
   Replace `PASSWORD` with your actual password

## Step 2: Push to GitHub (1 minute)

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin master
```

## Step 3: Deploy on Render (3 minutes)

### Create Blueprint
1. Go to https://dashboard.render.com
2. Click "New" > "Blueprint"
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. Click "Apply Blueprint"

### Configure Environment Variables

When prompted, set these variables:

**Backend Service:**
```
MONGODB_URI=mongodb+srv://ementech_admin:YOUR_PASSWORD@cluster.mongodb.net/ementech?retryWrites=true&w=majority
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
```

**Frontend Service:**
```
VITE_API_URL=https://ementech-backend.onrender.com/api/v1
```

Note: Frontend variable is auto-configured in render.yaml, but verify it's correct.

### Deploy
1. Click "Create" or "Apply"
2. Wait 5-10 minutes for deployment
3. Services will show "Live" when ready

## Step 4: Post-Deployment (1 minute)

### Seed Pricing Data
1. Go to backend service in Render dashboard
2. Click "Shell" tab
3. Run:
   ```bash
   cd backend
   npm run seed:pricing
   ```

### Update M-Pesa Callback
1. Update environment variable:
   ```
   MPESA_CALLBACK_URL=https://ementech-backend.onrender.com/api/v1/payments/mpesa/callback
   ```
2. Register callback URL in M-Pesa developer portal

### Test Application
1. Frontend: `https://ementech-frontend.onrender.com`
2. Backend API: `https://ementech-backend.onrender.com/api/v1`
3. Health check: `https://ementech-backend.onrender.com/api/v1/health`

## Your Services

After deployment, you'll have:

| Service | URL | Plan |
|---------|-----|------|
| Frontend | `https://ementech-frontend.onrender.com` | Free (Static) |
| Backend | `https://ementech-backend.onrender.com` | Free/Starter |
| Redis | Internal only | Free (25MB) |
| MongoDB | MongoDB Atlas | Free (512MB) |

## Cost

**Free Tier:**
- Frontend: $0
- Backend: $0 (auto-sleeps after 15 min)
- Redis: $0 (25MB)
- MongoDB: $0 (Atlas M0)
- **Total: $0/month**

**Paid Tier (Recommended):**
- Frontend: $0
- Backend: $7/month (always-on)
- Redis: $7/month (256MB)
- MongoDB: $0 (Atlas M0)
- **Total: $14/month**

## Next Steps

1. ✅ Test all features (registration, booking, payments)
2. ✅ Set up custom domain (optional)
3. ✅ Configure monitoring alerts
4. ✅ Enable auto-backups (Atlas M2+ tier)
5. ✅ Upgrade to paid tier for production

## Troubleshooting

### Service Won't Start
- Check logs in Render dashboard
- Verify all environment variables are set
- Check MongoDB Atlas network access (0.0.0.0/0)

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` is correct
- Verify `CORS_ORIGIN` includes frontend URL
- Check backend is running (green status)

### MongoDB Connection Failed
- Check connection string format
- Verify database user credentials
- Ensure network access allows 0.0.0.0/0

## Resources

- **Full Deployment Guide**: [docs/deployment/RENDER_DEPLOYMENT.md](./docs/deployment/RENDER_DEPLOYMENT.md)
- **Environment Variables**: [.env.render.example](./.env.render.example)
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://www.mongodb.com/docs/atlas/

## Support

- **Documentation**: See [docs/](./docs/) folder
- **Issues**: GitHub Issues
- **Render Support**: https://render.com/support

---

**You're all set!** Your EmEnTech platform is now live on Render.
