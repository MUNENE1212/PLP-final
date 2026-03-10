# Cloudinary Setup Guide

This application now uses **Cloudinary** as the primary media storage service, replacing Google Drive.

## Why Cloudinary?

- **Built for media**: Designed specifically for images and videos
- **Automatic optimization**: Handles image compression and format conversion
- **CDN delivery**: Fast global content delivery
- **Easy transformation**: Resize, crop, and optimize images on-the-fly
- **Reliable**: No service account permission issues
- **Developer-friendly**: Simple API and excellent documentation

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Sign up for a free account (generous free tier included)
3. Verify your email address

### 2. Get Your Credentials

1. After logging in, you'll see your **Dashboard**
2. Copy the following credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Configure Your Environment

1. Open your `backend/.env` file (create it if it doesn't exist)
2. Add the following variables:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Replace `your-cloud-name`, `your-api-key`, and `your-api-secret` with your actual credentials.

### 4. Test the Setup

1. Start your backend server:
```bash
npm run dev
```

2. Check the logs for:
```
✅ Cloudinary configured successfully
```

3. Test the upload endpoint:
```bash
GET http://localhost:5000/api/v1/upload/config
```

You should see `"configured": true` in the response.

## Features

### Automatic Image Optimization

Profile pictures are automatically:
- Resized to 500x500 pixels
- Cropped to focus on faces
- Optimized for web delivery
- Converted to best format (WebP when supported)

### Organized Folders

Media is organized into folders:
- `profile-pictures/` - User profile photos
- `posts/` - Social media post images and videos
- `bookings/` - Booking and work photos

### Supported File Types

- **Images**: JPEG, JPG, PNG, GIF, WebP
- **Videos**: MP4, MOV, AVI
- **Max file size**: 10MB

## API Endpoints

### Upload Profile Picture
```
POST /api/v1/upload/profile-picture
Content-Type: multipart/form-data
Field: file

Returns: { url, publicId, user }
```

### Upload Post Media
```
POST /api/v1/upload/post-media
Content-Type: multipart/form-data
Field: files (multiple)

Returns: { media: [{ url, publicId, type, width, height }], count }
```

### Upload Booking Photos
```
POST /api/v1/upload/booking/:bookingId/photos
Content-Type: multipart/form-data
Field: files (multiple)

Returns: { photos: [{ url, publicId, uploadedAt, uploadedBy }], count }
```

### Delete File
```
DELETE /api/v1/upload/:publicId?resourceType=image
Query Parameters:
  - resourceType: 'image' or 'video' (default: 'image')

Returns: { success: true, message }
```

### Get Upload Config
```
GET /api/v1/upload/config

Returns: { provider, configured, cloudName, hasCredentials, maxFileSize, allowedTypes }
```

## Migration Notes

### Changes from Google Drive

1. **File IDs** → **Public IDs**: Cloudinary uses `publicId` instead of `fileId`
2. **Direct URLs**: No need for special shareable links - all URLs are direct and CDN-optimized
3. **No folder permissions**: No more service account permission issues
4. **Automatic optimization**: Images are automatically optimized for web

### Existing Data

If you have existing Google Drive file IDs in your database:
- They will continue to work for existing records
- New uploads will use Cloudinary
- Consider migrating old files to Cloudinary over time

## Advanced Features

### Image Transformations

You can request transformed images by modifying the URL:

```javascript
// Original
https://res.cloudinary.com/demo/image/upload/sample.jpg

// Resize to 300x300
https://res.cloudinary.com/demo/image/upload/w_300,h_300,c_fill/sample.jpg

// Add watermark
https://res.cloudinary.com/demo/image/upload/l_text:Arial_50:Watermark/sample.jpg
```

### Video Processing

Cloudinary automatically:
- Optimizes video quality
- Generates thumbnails
- Transcodes to web-friendly formats
- Provides adaptive bitrate streaming

## Troubleshooting

### "Cloudinary not configured" Error

**Solution**: Check that all three environment variables are set correctly:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Upload Fails with 401 Unauthorized

**Solution**:
- Verify your API Secret is correct
- Regenerate credentials from Cloudinary dashboard if needed

### Files Not Appearing in Cloudinary Dashboard

**Solution**:
- Check the folder structure in Media Library
- Look under the correct folder (profile-pictures, posts, bookings)
- Refresh the dashboard

## Free Tier Limits

Cloudinary free tier includes:
- **25 GB storage**
- **25 GB bandwidth per month**
- **Unlimited transformations**
- **All core features**

This is more than enough for development and small to medium production applications.

## Security Best Practices

1. **Never commit** your `.env` file
2. **Rotate credentials** regularly
3. **Use environment-specific** accounts (dev/staging/prod)
4. **Enable signed uploads** for production (prevents unauthorized uploads)

## Support

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Reference](https://cloudinary.com/documentation/node_integration)
- [Transformation Guide](https://cloudinary.com/documentation/image_transformations)

---

**Migration completed on**: $(date +%Y-%m-%d)
**Previous storage**: Google Drive
**Current storage**: Cloudinary
