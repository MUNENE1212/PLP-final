const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

/**
 * Cloudinary Service for file uploads
 *
 * Setup Instructions:
 * 1. Sign up for Cloudinary at https://cloudinary.com/
 * 2. Get your Cloud Name, API Key, and API Secret from the dashboard
 * 3. Add these to your .env file:
 *    CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    CLOUDINARY_API_KEY=your_api_key
 *    CLOUDINARY_API_SECRET=your_api_secret
 */

class CloudinaryService {
  constructor() {
    this.initialized = false;
    this.configure();
  }

  /**
   * Configure Cloudinary with credentials
   */
  configure() {
    try {
      if (!process.env.CLOUDINARY_CLOUD_NAME ||
          !process.env.CLOUDINARY_API_KEY ||
          !process.env.CLOUDINARY_API_SECRET) {
        console.warn('Cloudinary: Configuration missing. Uploads will be disabled.');
        console.warn('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
        return;
      }

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
      });

      this.initialized = true;
      console.log('✅ Cloudinary configured successfully');
    } catch (error) {
      console.error('Failed to configure Cloudinary:', error.message);
    }
  }

  /**
   * Upload file to Cloudinary from buffer
   * @param {Object} fileData - File data
   * @param {Buffer} fileData.buffer - File buffer
   * @param {string} fileData.originalname - Original filename
   * @param {string} fileData.mimetype - File MIME type
   * @param {string} folder - Folder name in Cloudinary (optional)
   * @param {Object} options - Additional upload options
   * @returns {Promise<Object>} Upload result with URL and public ID
   */
  async uploadFile(fileData, folder = 'uploads', options = {}) {
    if (!this.initialized) {
      throw new Error('Cloudinary not configured. Please check your credentials.');
    }

    return new Promise((resolve, reject) => {
      const { buffer, originalname, mimetype } = fileData;

      // Determine resource type based on MIME type
      const resourceType = mimetype.startsWith('video/') ? 'video' : 'image';

      // Default upload options
      const uploadOptions = {
        folder: folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        ...options
      };

      // Create upload stream
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(new Error(`Failed to upload file: ${error.message}`));
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            createdAt: result.created_at
          });
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload multiple files to Cloudinary
   * @param {Array} files - Array of file data objects
   * @param {string} folder - Folder name in Cloudinary (optional)
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadMultipleFiles(files, folder = 'uploads') {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete file from Cloudinary
   * @param {string} publicId - Public ID of the file to delete
   * @param {string} resourceType - Resource type ('image' or 'video')
   * @returns {Promise<Object>} Deletion result
   */
  async deleteFile(publicId, resourceType = 'image') {
    if (!this.initialized) {
      throw new Error('Cloudinary not configured');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });

      if (result.result !== 'ok') {
        throw new Error(`Failed to delete file: ${result.result}`);
      }

      console.log(`File ${publicId} deleted successfully`);
      return result;
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Delete multiple files from Cloudinary
   * @param {Array} publicIds - Array of public IDs to delete
   * @param {string} resourceType - Resource type ('image' or 'video')
   * @returns {Promise<Object>} Deletion result
   */
  async deleteMultipleFiles(publicIds, resourceType = 'image') {
    if (!this.initialized) {
      throw new Error('Cloudinary not configured');
    }

    try {
      const result = await cloudinary.api.delete_resources(publicIds, {
        resource_type: resourceType
      });
      return result;
    } catch (error) {
      console.error('Error deleting multiple files from Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Get file details from Cloudinary
   * @param {string} publicId - Public ID of the file
   * @param {string} resourceType - Resource type ('image' or 'video')
   * @returns {Promise<Object>} File details
   */
  async getFileDetails(publicId, resourceType = 'image') {
    if (!this.initialized) {
      throw new Error('Cloudinary not configured');
    }

    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType
      });
      return result;
    } catch (error) {
      console.error('Error getting file details from Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Generate a transformation URL for an image
   * @param {string} publicId - Public ID of the file
   * @param {Object} transformations - Transformation options
   * @returns {string} Transformed image URL
   */
  getTransformationUrl(publicId, transformations = {}) {
    if (!this.initialized) {
      throw new Error('Cloudinary not configured');
    }

    return cloudinary.url(publicId, {
      secure: true,
      ...transformations
    });
  }

  /**
   * Upload image with automatic optimization
   * @param {Object} fileData - File data
   * @param {string} folder - Folder name in Cloudinary
   * @param {Object} transformations - Optional transformations
   * @returns {Promise<Object>} Upload result
   */
  async uploadOptimizedImage(fileData, folder = 'uploads', transformations = {}) {
    const defaultTransformations = {
      quality: 'auto',
      fetch_format: 'auto'
    };

    return this.uploadFile(fileData, folder, {
      ...defaultTransformations,
      ...transformations
    });
  }

  /**
   * Check if Cloudinary is configured
   * @returns {boolean}
   */
  isConfigured() {
    return this.initialized;
  }
}

// Export singleton instance
module.exports = new CloudinaryService();
