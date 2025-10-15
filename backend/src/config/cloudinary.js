const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload image to Cloudinary
 * @param {String} filePath - Path to the file
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
exports.uploadImage = async (filePath, options = {}) => {
  try {
    const defaultOptions = {
      folder: options.folder || 'baitech',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      ...options
    };

    const result = await cloudinary.uploader.upload(filePath, defaultOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      thumbnail: result.eager?.[0]?.secure_url || result.secure_url
    };
  } catch (error) {
    console.error('Cloudinary image upload error:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Upload video to Cloudinary
 * @param {String} filePath - Path to the file
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
exports.uploadVideo = async (filePath, options = {}) => {
  try {
    const defaultOptions = {
      folder: options.folder || 'baitech/videos',
      resource_type: 'video',
      eager: [
        { width: 300, height: 300, crop: 'pad', format: 'jpg' } // Thumbnail
      ],
      eager_async: true,
      ...options
    };

    const result = await cloudinary.uploader.upload(filePath, defaultOptions);

    return {
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
    console.error('Cloudinary video upload error:', error);
    throw new Error('Failed to upload video');
  }
};

/**
 * Upload profile picture with specific transformations
 * @param {String} filePath - Path to the file
 * @returns {Promise<Object>} Upload result
 */
exports.uploadProfilePicture = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'baitech/profiles',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Profile picture upload error:', error);
    throw new Error('Failed to upload profile picture');
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
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array<String>} publicIds - Array of public IDs
 * @param {String} resourceType - Type of resource
 * @returns {Promise<Object>} Deletion result
 */
exports.deleteMultipleFiles = async (publicIds, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary batch delete error:', error);
    throw new Error('Failed to delete files');
  }
};

/**
 * Get file details from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @param {String} resourceType - Type of resource
 * @returns {Promise<Object>} File details
 */
exports.getFileDetails = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary get details error:', error);
    throw new Error('Failed to get file details');
  }
};

/**
 * Generate signed upload URL (for direct client uploads)
 * @param {Object} options - Upload options
 * @returns {Object} Signature and timestamp
 */
exports.generateSignedUploadUrl = (options = {}) => {
  const timestamp = Math.round(Date.now() / 1000);

  const params = {
    timestamp,
    folder: options.folder || 'baitech',
    ...options
  };

  const signature = cloudinary.utils.api_sign_request(
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

module.exports = cloudinary;
