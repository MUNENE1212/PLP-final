const express = require('express');
const {
  uploadProfilePicture,
  uploadPostMedia,
  uploadBookingPhotos,
  deleteFile,
  getUploadConfig,
  uploadSingle,
  uploadMultiple,
} = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get upload configuration
router.get('/config', getUploadConfig);

// Upload profile picture
router.post('/profile-picture', protect, uploadSingle, uploadProfilePicture);

// Upload post media (multiple files)
router.post('/post-media', protect, uploadMultiple, uploadPostMedia);

// Upload booking/work photos
router.post('/booking/:bookingId/photos', protect, uploadMultiple, uploadBookingPhotos);

// Delete file
router.delete('/file/:fileId', protect, deleteFile);

module.exports = router;
