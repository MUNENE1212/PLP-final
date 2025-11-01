const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const stream = require('stream');

/**
 * Google Drive Service for file uploads
 *
 * Setup Instructions:
 * 1. Go to Google Cloud Console: https://console.cloud.google.com/
 * 2. Create a new project (or select existing)
 * 3. Enable Google Drive API
 * 4. Create Service Account credentials
 * 5. Download the JSON key file
 * 6. Share your Google Drive folder with the service account email
 * 7. Set the folder ID in your .env file
 */

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    this.initialized = false;
  }

  /**
   * Initialize Google Drive API
   */
  async initialize() {
    if (this.initialized) return;

    try {
      let credentials;

      // Check if credentials are provided as JSON env variable (for Render/Cloud deployment)
      if (process.env.GOOGLE_CREDENTIALS_JSON) {
        console.log('Loading Google Drive credentials from environment variable...');
        try {
          credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        } catch (parseError) {
          console.error('Failed to parse GOOGLE_CREDENTIALS_JSON:', parseError.message);
          console.warn('Google Drive: Invalid credentials JSON. Uploads will be disabled.');
          return;
        }
      } else {
        // Check if service account key file exists (for local development)
        const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
                       path.join(__dirname, '../../google-credentials.json');

        if (!fs.existsSync(keyPath)) {
          console.warn('Google Drive: Service account key file not found and GOOGLE_CREDENTIALS_JSON not set. Uploads will be disabled.');
          return;
        }

        console.log('Loading Google Drive credentials from file...');
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

  /**
   * Upload file to Google Drive
   * @param {Object} fileData - File data
   * @param {Buffer} fileData.buffer - File buffer
   * @param {string} fileData.originalname - Original filename
   * @param {string} fileData.mimetype - File MIME type
   * @param {string} folder - Subfolder name (optional)
   * @returns {Promise<Object>} File metadata with shareable link
   */
  async uploadFile(fileData, folder = 'uploads') {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.drive) {
      throw new Error('Google Drive API not initialized. Please check your credentials.');
    }

    try {
      const { buffer, originalname, mimetype } = fileData;

      // Create subfolder if needed
      let targetFolderId = this.folderId;
      if (folder && folder !== 'uploads') {
        targetFolderId = await this.createOrGetFolder(folder, this.folderId);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = path.extname(originalname);
      const baseName = path.basename(originalname, extension);
      const uniqueFileName = `${baseName}_${timestamp}${extension}`;

      // Create readable stream from buffer
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);

      // Upload file
      const response = await this.drive.files.create({
        requestBody: {
          name: uniqueFileName,
          parents: [targetFolderId],
          mimeType: mimetype,
        },
        media: {
          mimeType: mimetype,
          body: bufferStream,
        },
        fields: 'id, name, mimeType, size, webViewLink, webContentLink',
      });

      const file = response.data;

      // Make file publicly accessible
      await this.drive.permissions.create({
        fileId: file.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Get shareable link
      const shareableLink = `https://drive.google.com/uc?export=view&id=${file.id}`;

      return {
        fileId: file.id,
        fileName: file.name,
        mimeType: file.mimeType,
        size: file.size,
        url: shareableLink,
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
      };
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload multiple files
   * @param {Array} files - Array of file data objects
   * @param {string} folder - Subfolder name (optional)
   * @returns {Promise<Array>} Array of file metadata
   */
  async uploadMultipleFiles(files, folder = 'uploads') {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Create or get existing folder
   * @param {string} folderName - Folder name
   * @param {string} parentId - Parent folder ID
   * @returns {Promise<string>} Folder ID
   */
  async createOrGetFolder(folderName, parentId) {
    try {
      // Check if folder exists
      const response = await this.drive.files.list({
        q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      });

      if (response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create folder if it doesn't exist
      const folderResponse = await this.drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
        },
        fields: 'id',
      });

      return folderResponse.data.id;
    } catch (error) {
      console.error('Error creating/getting folder:', error);
      throw error;
    }
  }

  /**
   * Delete file from Google Drive
   * @param {string} fileId - File ID
   * @returns {Promise<void>}
   */
  async deleteFile(fileId) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.drive) {
      throw new Error('Google Drive API not initialized');
    }

    try {
      await this.drive.files.delete({
        fileId: fileId,
      });
      console.log(`File ${fileId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      throw error;
    }
  }

  /**
   * Get file metadata
   * @param {string} fileId - File ID
   * @returns {Promise<Object>} File metadata
   */
  async getFileMetadata(fileId) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.drive) {
      throw new Error('Google Drive API not initialized');
    }

    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, webViewLink, webContentLink, createdTime',
      });

      return response.data;
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }
  }

  /**
   * Check if Google Drive is configured
   * @returns {boolean}
   */
  isConfigured() {
    return this.initialized && this.drive !== null;
  }
}

// Export singleton instance
module.exports = new GoogleDriveService();
