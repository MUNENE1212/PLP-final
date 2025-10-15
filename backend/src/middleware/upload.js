const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

// File filter for videos
const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mov|wmv|flv|mkv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('video/');

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (mp4, avi, mov, wmv, flv, mkv, webm)'), false);
  }
};

// File filter for images and videos
const mediaFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|avi|mov|wmv|flv|mkv|webm/;

  const extname = path.extname(file.originalname).toLowerCase();
  const isImage = allowedImageTypes.test(extname) && file.mimetype.startsWith('image/');
  const isVideo = allowedVideoTypes.test(extname) && file.mimetype.startsWith('video/');

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

// File filter for documents
const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Only document files are allowed (pdf, doc, docx, txt)'), false);
  }
};

// Multer middleware for single image upload
exports.uploadSingleImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  }
}).single('image');

// Multer middleware for multiple images upload
exports.uploadMultipleImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10 // Maximum 10 files
  }
}).array('images', 10);

// Multer middleware for single video upload
exports.uploadSingleVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  }
}).single('video');

// Multer middleware for media (images + videos)
exports.uploadMedia = multer({
  storage,
  fileFilter: mediaFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per file
    files: 10 // Maximum 10 files
  }
}).array('media', 10);

// Multer middleware for profile picture
exports.uploadProfilePicture = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for profile pictures
  }
}).single('profilePicture');

// Multer middleware for documents
exports.uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for documents
  }
}).single('document');

// Multer middleware for multiple documents
exports.uploadMultipleDocuments = multer({
  storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5 // Maximum 5 files
  }
}).array('documents', 5);

// Error handler middleware for multer
exports.handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Please upload a smaller file.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Please upload fewer files.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field in form data.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    // Other errors (like file type errors)
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// Cleanup uploaded files (call this after successful Cloudinary upload)
exports.cleanupFiles = (files) => {
  if (!files) return;

  const fileList = Array.isArray(files) ? files : [files];

  fileList.forEach(file => {
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
    }
  });
};
