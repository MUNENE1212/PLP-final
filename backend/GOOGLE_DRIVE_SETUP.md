# Google Drive Media Storage Setup Guide

This guide will help you configure Google Drive as a media storage solution for EmEnTech.

## Why Google Drive?

- ✅ **Free Storage**: 15GB free storage per Google account
- ✅ **Shareable Links**: Direct image/video URLs for web display
- ✅ **Easy Setup**: Simple API configuration
- ✅ **No Cost**: No charges for API usage
- ✅ **Reliable**: 99.9% uptime guarantee

---

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"New Project"** (top bar, project dropdown)
3. Name your project (e.g., "EmEnTech Media Storage")
4. Click **"Create"**

### 2. Enable Google Drive API

1. In your project, go to **"APIs & Services" > "Library"**
2. Search for **"Google Drive API"**
3. Click on it and press **"Enable"**

### 3. Create Service Account Credentials

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials" > "Service Account"**
3. Fill in the details:
   - **Service account name**: `ementech-media-uploader`
   - **Service account ID**: (auto-generated)
   - **Description**: "Service account for media uploads"
4. Click **"Create and Continue"**
5. **Role**: Select **"Basic" > "Editor"** (or use custom role with Drive permissions)
6. Click **"Continue"** and then **"Done"**

### 4. Generate and Download JSON Key

1. In the **"Credentials"** page, find your service account
2. Click on the service account email
3. Go to the **"Keys"** tab
4. Click **"Add Key" > "Create new key"**
5. Select **"JSON"** format
6. Click **"Create"**
7. A JSON file will download automatically - **KEEP THIS SAFE!**

### 5. Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder (e.g., "EmEnTech Media")
3. Right-click the folder > **"Share"**
4. Add the service account email (from step 3) as an **Editor**
   - The email looks like: `ementech-media-uploader@project-id.iam.gserviceaccount.com`
5. Copy the **Folder ID** from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy the `FOLDER_ID_HERE` part

### 6. Configure Backend

1. **Rename the JSON key file**:
   ```bash
   mv ~/Downloads/project-id-xxxxx.json backend/google-credentials.json
   ```

2. **Update `.env` file**:
   ```env
   # Google Drive Configuration
   GOOGLE_DRIVE_FOLDER_ID=your-folder-id-from-step-5
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./google-credentials.json
   ```

3. **Add to `.gitignore`** (if not already there):
   ```
   # Google credentials
   google-credentials.json
   ```

4. **Install required package** (if not installed):
   ```bash
   cd backend
   npm install googleapis multer
   ```

### 7. Test the Setup

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Test the upload endpoint** using Postman or curl:
   ```bash
   curl -X GET http://localhost:5000/api/v1/upload/config
   ```

   Expected response:
   ```json
   {
     "success": true,
     "data": {
       "provider": "google-drive",
       "configured": true,
       "maxFileSize": "10MB",
       "allowedTypes": ["image/jpeg", "image/png", ...]
     }
   }
   ```

3. **Test file upload**:
   ```bash
   curl -X POST http://localhost:5000/api/v1/upload/profile-picture \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "file=@/path/to/image.jpg"
   ```

---

## Folder Structure in Google Drive

The service will automatically create subfolders:

```
EmEnTech Media/
├── profile-pictures/      # User profile photos
├── post-media/            # Social feed images/videos
└── bookings/
    ├── booking-id-1/      # Photos for specific bookings
    ├── booking-id-2/
    └── ...
```

---

## Available API Endpoints

### 1. Upload Profile Picture
```
POST /api/v1/upload/profile-picture
Headers: Authorization: Bearer {token}
Body: multipart/form-data
  - file: image file
```

### 2. Upload Post Media (Multiple)
```
POST /api/v1/upload/post-media
Headers: Authorization: Bearer {token}
Body: multipart/form-data
  - files[]: image/video files (max 10)
```

### 3. Upload Booking Photos
```
POST /api/v1/upload/booking/:bookingId/photos
Headers: Authorization: Bearer {token}
Body: multipart/form-data
  - files[]: image files
```

### 4. Delete File
```
DELETE /api/v1/upload/file/:fileId
Headers: Authorization: Bearer {token}
```

### 5. Get Config
```
GET /api/v1/upload/config
```

---

## Frontend Usage

### Using the ImageUpload Component

```tsx
import ImageUpload from '@/components/upload/ImageUpload';

// Profile picture upload
<ImageUpload
  uploadType="profile-picture"
  currentImage={user?.profilePicture}
  onUploadComplete={(url, fileId) => {
    console.log('Uploaded:', url);
    // Update user profile
  }}
/>

// Post media upload
<ImageUpload
  uploadType="post-media"
  onUploadComplete={(url, fileId) => {
    // Add to post media array
  }}
/>

// Booking photos
<ImageUpload
  uploadType="booking-photos"
  bookingId={bookingId}
  onUploadComplete={(url, fileId) => {
    // Add to booking photos
  }}
/>
```

---

## Troubleshooting

### Error: "Google Drive API not initialized"
- Check that `google-credentials.json` exists in the backend folder
- Verify the path in `.env` is correct

### Error: "Failed to upload file"
- Ensure the service account has **Editor** access to the folder
- Check that the folder ID in `.env` is correct
- Verify the Google Drive API is enabled in your project

### Error: "Permission denied"
- The service account email must have access to the folder
- Re-share the folder with the service account as **Editor**

### Images not displaying
- Check the shareable link format: `https://drive.google.com/uc?export=view&id={fileId}`
- Ensure file permissions are set to **"Anyone with the link"**

### File size errors
- Default max size is 10MB
- Increase limit in `backend/src/controllers/upload.controller.js` if needed:
  ```javascript
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  }
  ```

---

## Security Best Practices

1. **Never commit `google-credentials.json`** to version control
2. **Use environment variables** for all configuration
3. **Rotate service account keys** periodically
4. **Limit API scopes** to only what's needed
5. **Monitor API usage** in Google Cloud Console
6. **Set up file size limits** to prevent abuse
7. **Validate file types** on both frontend and backend

---

## Cost Considerations

- **Storage**: First 15GB free, then ~$0.02/GB/month
- **API Calls**: Free (with generous quota)
- **Bandwidth**: Free for reasonable usage
- **Recommended**: Monitor usage in [Google Cloud Console](https://console.cloud.google.com/)

---

## Alternative: Using Your Personal Google Drive

If you want to use your personal Google Drive instead of a service account:

1. Create an OAuth 2.0 Client ID instead of a service account
2. Implement OAuth flow in the frontend
3. Users upload to their own Google Drive
4. Share links are generated automatically

*(This is more complex but gives users control over their files)*

---

## Support

For issues or questions:
- **Backend logs**: Check `console` output for detailed error messages
- **Frontend errors**: Check browser console
- **Google Cloud**: Check [API usage dashboard](https://console.cloud.google.com/apis/dashboard)

---

## Summary Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Google Drive API
- [ ] Created service account
- [ ] Downloaded JSON credentials
- [ ] Created Google Drive folder
- [ ] Shared folder with service account
- [ ] Copied folder ID
- [ ] Placed `google-credentials.json` in backend folder
- [ ] Updated `.env` file
- [ ] Tested configuration endpoint
- [ ] Tested file upload

**Setup complete! 🎉**
