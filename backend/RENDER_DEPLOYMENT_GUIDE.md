# Deploying to Render with Google Drive Setup

This guide explains how to deploy your application to Render with Google Drive integration for media storage.

## Prerequisites

- Render account (https://render.com)
- Google Cloud Platform account
- Google Drive API credentials (service account)

## Step 1: Set Up Google Drive Service Account

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Google Drive API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

3. **Create Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in service account details:
     - Name: `ementech-drive-service`
     - Description: "Service account for media uploads"
   - Click "Create and Continue"
   - Skip optional steps and click "Done"

4. **Create and Download Service Account Key**
   - Click on the newly created service account
   - Go to the "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose "JSON" format
   - Click "Create" - the JSON file will download automatically
   - **Keep this file secure!** It contains credentials to access your Google Drive

5. **Create Google Drive Folder**
   - Go to https://drive.google.com
   - Create a new folder (e.g., "EmEnTech-Media")
   - Open the folder and copy the folder ID from the URL:
     ```
     https://drive.google.com/drive/folders/1pFCRWY6KKZvP6-f0FSBfY6iaJUhlZdVw
                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                           This is your folder ID
     ```

6. **Share Folder with Service Account**
   - Right-click the folder > "Share"
   - Add the service account email (found in the downloaded JSON file, looks like: `ementech-drive-service@project-id.iam.gserviceaccount.com`)
   - Give it "Editor" permissions
   - Click "Share"

## Step 2: Prepare Service Account Credentials for Render

Since Render doesn't support uploading files directly, you need to convert your JSON credentials to environment variables:

### Option 1: JSON as Environment Variable (Recommended)

1. Open the downloaded JSON file
2. Copy the entire contents
3. In Render, you'll add it as an environment variable

### Option 2: Individual Fields

Alternatively, you can extract specific fields from the JSON:
- `GOOGLE_CLIENT_EMAIL`: The `client_email` field
- `GOOGLE_PRIVATE_KEY`: The `private_key` field (keep the newlines as `\n`)

## Step 3: Deploy to Render

### Backend Deployment

1. **Create Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" > "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `ementech-backend` (or your preferred name)
     - **Environment**: `Node`
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm start`
     - **Region**: Choose closest to your users
     - **Instance Type**: Free or Starter (based on your needs)

2. **Add Environment Variables**

   Click "Advanced" > "Add Environment Variable" and add the following:

   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-strong-jwt-secret-here
   JWT_REFRESH_SECRET=your-strong-refresh-secret-here
   JWT_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   CORS_ORIGIN=https://your-frontend-url.onrender.com
   CLIENT_WEB_URL=https://your-frontend-url.onrender.com
   ```

3. **Add Google Drive Configuration**

   **Option 1: Using JSON credentials (Recommended)**
   ```
   GOOGLE_DRIVE_FOLDER_ID=1pFCRWY6KKZvP6-f0FSBfY6iaJUhlZdVw
   GOOGLE_CREDENTIALS_JSON=<paste entire JSON contents here>
   ```

   **Option 2: Using individual fields**
   ```
   GOOGLE_DRIVE_FOLDER_ID=1pFCRWY6KKZvP6-f0FSBfY6iaJUhlZdVw
   GOOGLE_CLIENT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n
   ```

4. **Update Google Drive Service** (if using JSON env variable)

   Modify `backend/src/services/googleDrive.service.js`:

   ```javascript
   async initialize() {
     if (this.initialized) return;

     try {
       let credentials;

       // Check if credentials are provided as JSON env variable (for Render)
       if (process.env.GOOGLE_CREDENTIALS_JSON) {
         credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
       } else {
         // Check if service account key file exists (for local development)
         const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
                        path.join(__dirname, '../../google-credentials.json');

         if (!fs.existsSync(keyPath)) {
           console.warn('Google Drive: Service account key not found. Uploads will be disabled.');
           return;
         }

         credentials = require(keyPath);
       }

       // Create auth client
       const auth = new google.auth.GoogleAuth({
         credentials,
         scopes: ['https://www.googleapis.com/auth/drive.file'],
       });

       // Create Drive API client
       this.drive = google.drive({ version: 'v3', auth });
       this.initialized = true;

       console.log('✅ Google Drive API initialized successfully');
     } catch (error) {
       console.error('Failed to initialize Google Drive API:', error.message);
       throw error;
     }
   }
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the deployment to complete (first deploy may take 5-10 minutes)

### Frontend Deployment

1. **Create Static Site**
   - Click "New +" > "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `ementech-frontend`
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Publish Directory**: `frontend/dist`

2. **Add Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api/v1
   ```

3. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment

## Step 4: Verify Deployment

1. **Check Backend Health**
   - Visit: `https://your-backend-url.onrender.com/health`
   - Should return: `{"status": "healthy", ...}`

2. **Test Google Drive Upload**
   - Log in to your application
   - Try uploading a profile picture
   - Check your Google Drive folder - the file should appear

3. **Check Logs**
   - In Render dashboard, go to your service
   - Click "Logs" tab
   - Look for: `✅ Google Drive API initialized successfully`

## Troubleshooting

### Issue: "Service account key file not found"
**Solution**: Make sure you've added `GOOGLE_CREDENTIALS_JSON` environment variable with the full JSON contents.

### Issue: "Permission denied" when uploading
**Solution**:
1. Verify you shared the Google Drive folder with the service account email
2. Check the service account has "Editor" permissions
3. Verify the folder ID is correct

### Issue: "Invalid grant" error
**Solution**:
1. Check that the private key in your environment variable includes proper newlines (`\n`)
2. Make sure the service account hasn't been deleted
3. Verify the project is still active in Google Cloud Console

### Issue: CORS errors
**Solution**: Make sure `CORS_ORIGIN` in backend matches your frontend URL exactly.

### Issue: Files uploading but not displaying
**Solution**:
1. Check that files are set to "Anyone with the link" can view
2. Verify the `shareableLink` format in the Google Drive service is correct
3. Check browser console for mixed content errors (HTTP vs HTTPS)

## Security Best Practices

1. **Never commit credentials**
   - Add `google-credentials.json` to `.gitignore`
   - Never share service account keys publicly

2. **Rotate credentials regularly**
   - Create new service account keys every 90 days
   - Delete old keys from Google Cloud Console

3. **Use environment variables**
   - Always use environment variables for sensitive data
   - Never hardcode credentials

4. **Monitor usage**
   - Check Google Drive API quotas regularly
   - Set up billing alerts in Google Cloud Console

5. **Restrict service account permissions**
   - Only give necessary permissions (Drive API only)
   - Don't use service accounts for other purposes

## Costs

- **Render**: Free tier available (services sleep after inactivity)
- **Google Drive API**: Free for up to 20,000 requests/day
- **Google Drive Storage**: 15GB free (shared with Gmail and Photos)

For production use, consider:
- Render Starter plan ($7/month) for always-on service
- Google Workspace for more storage

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [Google Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
