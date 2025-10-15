const cloudinaryConfig = require('../config/cloudinary');
const { cleanupFiles } = require('../middleware/upload');
const fs = require('fs');

/**
 * Upload single image to Cloudinary
 * @param {Object} file - Multer file object
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with URL and metadata
 */
exports.uploadImage = async (file, options = {}) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const result = await cloudinaryConfig.uploader.upload(file.path, {
      folder: options.folder || 'baitech/images',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      ...options
    });

    // Cleanup local file after upload
    cleanupFiles(file);

    return {
      type: 'image',
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    // Cleanup local file on error
    cleanupFiles(file);
    console.error('Image upload error:', error);
    throw new Error('Failed to upload image: ' + error.message);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<Object>} files - Array of multer file objects
 * @param {Object} options - Upload options
 * @returns {Promise<Array<Object>>} Array of upload results
 */
exports.uploadMultipleImages = async (files, options = {}) => {
  try {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploadPromises = files.map((file, index) =>
      cloudinaryConfig.uploader.upload(file.path, {
        folder: options.folder || 'baitech/images',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ],
        ...options
      }).then(result => ({
        type: 'image',
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        order: index
      }))
    );

    const results = await Promise.all(uploadPromises);

    // Cleanup local files after upload
    cleanupFiles(files);

    return results;
  } catch (error) {
    // Cleanup local files on error
    cleanupFiles(files);
    console.error('Multiple images upload error:', error);
    throw new Error('Failed to upload images: ' + error.message);
  }
};

/**
 * Upload single video to Cloudinary
 * @param {Object} file - Multer file object
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with URL and metadata
 */
exports.uploadVideo = async (file, options = {}) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const result = await cloudinaryConfig.uploader.upload(file.path, {
      folder: options.folder || 'baitech/videos',
      resource_type: 'video',
      eager: [
        { width: 300, height: 300, crop: 'pad', format: 'jpg' } // Thumbnail
      ],
      eager_async: true,
      ...options
    });

    // Cleanup local file after upload
    cleanupFiles(file);

    return {
      type: 'video',
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      duration: result.duration,
      thumbnail: result.eager?.[0]?.secure_url || null
    };
  } catch (error) {
    // Cleanup local file on error
    cleanupFiles(file);
    console.error('Video upload error:', error);
    throw new Error('Failed to upload video: ' + error.message);
  }
};

/**
 * Upload mixed media (images and videos)
 * @param {Array<Object>} files - Array of multer file objects
 * @param {Object} options - Upload options
 * @returns {Promise<Array<Object>>} Array of upload results
 */
exports.uploadMedia = async (files, options = {}) => {
  try {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploadPromises = files.map((file, index) => {
      const isVideo = file.mimetype.startsWith('video/');

      if (isVideo) {
        return cloudinaryConfig.uploader.upload(file.path, {
          folder: options.folder || 'baitech/videos',
          resource_type: 'video',
          eager: [
            { width: 300, height: 300, crop: 'pad', format: 'jpg' }
          ],
          eager_async: true
        }).then(result => ({
          type: 'video',
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
          duration: result.duration,
          thumbnail: result.eager?.[0]?.secure_url || null,
          order: index
        }));
      } else {
        return cloudinaryConfig.uploader.upload(file.path, {
          folder: options.folder || 'baitech/images',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        }).then(result => ({
          type: 'image',
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
          order: index
        }));
      }
    });

    const results = await Promise.all(uploadPromises);

    // Cleanup local files after upload
    cleanupFiles(files);

    return results;
  } catch (error) {
    // Cleanup local files on error
    cleanupFiles(files);
    console.error('Media upload error:', error);
    throw new Error('Failed to upload media: ' + error.message);
  }
};

/**
 * Upload profile picture with optimized transformations
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} Upload result
 */
exports.uploadProfilePicture = async (file) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const result = await cloudinaryConfig.uploader.upload(file.path, {
      folder: 'baitech/profiles',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    // Cleanup local file after upload
    cleanupFiles(file);

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    // Cleanup local file on error
    cleanupFiles(file);
    console.error('Profile picture upload error:', error);
    throw new Error('Failed to upload profile picture: ' + error.message);
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @param {String} resourceType - Type of resource (image/video)
 * @returns {Promise<Object>} Deletion result
 */
exports.deleteFile = async (publicId, resourceType = 'image') => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    const result = await cloudinaryConfig.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error('Failed to delete file from Cloudinary');
    }

    return {
      success: true,
      result: result.result
    };
  } catch (error) {
    console.error('File deletion error:', error);
    throw new Error('Failed to delete file: ' + error.message);
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array<String>} publicIds - Array of Cloudinary public IDs
 * @param {String} resourceType - Type of resource (image/video)
 * @returns {Promise<Object>} Deletion result
 */
exports.deleteMultipleFiles = async (publicIds, resourceType = 'image') => {
  try {
    if (!publicIds || publicIds.length === 0) {
      throw new Error('Public IDs are required');
    }

    const result = await cloudinaryConfig.api.delete_resources(publicIds, {
      resource_type: resourceType
    });

    return {
      success: true,
      deleted: result.deleted,
      deletedCount: Object.keys(result.deleted).length
    };
  } catch (error) {
    console.error('Batch deletion error:', error);
    throw new Error('Failed to delete files: ' + error.message);
  }
};

/**
 * Get file details from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @param {String} resourceType - Type of resource (image/video)
 * @returns {Promise<Object>} File details
 */
exports.getFileDetails = async (publicId, resourceType = 'image') => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    const result = await cloudinaryConfig.api.resource(publicId, {
      resource_type: resourceType
    });

    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes,
      createdAt: result.created_at,
      resourceType: result.resource_type
    };
  } catch (error) {
    console.error('Get file details error:', error);
    throw new Error('Failed to get file details: ' + error.message);
  }
};

/**
 * Generate optimized image URL with transformations
 * @param {String} publicId - Cloudinary public ID
 * @param {Object} transformations - Transformation options
 * @returns {String} Optimized URL
 */
exports.getOptimizedImageUrl = (publicId, transformations = {}) => {
  return cloudinaryConfig.url(publicId, {
    secure: true,
    ...transformations
  });
};

/**
 * Generate signed upload URL for direct client uploads
 * @param {Object} options - Upload options
 * @returns {Object} Signature and upload parameters
 */
exports.generateUploadSignature = (options = {}) => {
  const timestamp = Math.round(Date.now() / 1000);

  const params = {
    timestamp,
    folder: options.folder || 'baitech',
    ...options
  };

  const signature = cloudinaryConfig.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: params.folder
  };
};

/**
 * Validate if file is an image
 * @param {String} mimetype - File mimetype
 * @returns {Boolean}
 */
exports.isImage = (mimetype) => {
  return mimetype && mimetype.startsWith('image/');
};

/**
 * Validate if file is a video
 * @param {String} mimetype - File mimetype
 * @returns {Boolean}
 */
exports.isVideo = (mimetype) => {
  return mimetype && mimetype.startsWith('video/');
};

/**
 * Get media type from file
 * @param {Object} file - Multer file object
 * @returns {String} Media type (image/video)
 */
exports.getMediaType = (file) => {
  if (!file || !file.mimetype) return null;
  if (this.isImage(file.mimetype)) return 'image';
  if (this.isVideo(file.mimetype)) return 'video';
  return null;
};
