const User = require('../models/User');
const cloudinaryService = require('../services/cloudinary.service');
const crypto = require('crypto');

/**
 * @desc    Add work gallery image
 * @route   POST /api/v1/work-gallery
 * @access  Private (technician only)
 */
exports.addWorkGalleryImage = async (req, res) => {
  try {
    const { caption, category, date, location, isBeforeAfter, pairId } = req.body;

    // Check if user is a technician
    if (req.user.role !== 'technician') {
      return res.status(403).json({
        success: false,
        message: 'Only technicians can add work gallery images'
      });
    }

    // Validate file exists (uploaded via multer)
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    // Get the user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check max 10 images limit
    if (user.workGalleryImages && user.workGalleryImages.length >= 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 work gallery images allowed. Please delete an existing image first.'
      });
    }

    // Validate category
    const validCategories = ['plumbing', 'electrical', 'carpentry', 'masonry', 'painting', 'hvac', 'welding', 'other'];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be one of: ' + validCategories.join(', ')
      });
    }

    // Validate caption length
    if (caption && caption.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Caption must be 500 characters or less'
      });
    }

    // Determine next order number
    const nextOrder = user.workGalleryImages ? user.workGalleryImages.length + 1 : 1;

    // Upload to Cloudinary with optimizations
    const uploadResult = await cloudinaryService.uploadOptimizedImage(
      {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype
      },
      'work-gallery',
      {
        transformation: [
          { width: 1280, height: 769, crop: 'limit', quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      }
    );

    // Create new work gallery image object
    const newImage = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      caption: caption || '',
      category,
      date: date || new Date(),
      location: location || '',
      isBeforeAfter: isBeforeAfter || false,
      pairId: pairId || null,
      order: nextOrder
    };

    // Initialize array if needed and add image
    if (!user.workGalleryImages) {
      user.workGalleryImages = [];
    }
    user.workGalleryImages.push(newImage);

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Work gallery image added successfully',
      data: user.workGalleryImages[user.workGalleryImages.length - 1],
      totalImages: user.workGalleryImages.length
    });
  } catch (error) {
    console.error('Add work gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding work gallery image',
    });
  }
};

/**
 * @desc    Update work gallery image metadata
 * @route   PUT /api/v1/work-gallery/:imageId
 * @access  Private (technician, owner only)
 */
exports.updateWorkGalleryImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { caption, category, date, location, isBeforeAfter, pairId } = req.body;

    // Find user with the specific image
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the image in the gallery
    const imageIndex = user.workGalleryImages?.findIndex(
      img => img._id.toString() === imageId
    );

    if (imageIndex === -1 || imageIndex === undefined) {
      return res.status(404).json({
        success: false,
        message: 'Work gallery image not found'
      });
    }

    // Validate category if provided
    if (category) {
      const validCategories = ['plumbing', 'electrical', 'carpentry', 'masonry', 'painting', 'hvac', 'welding', 'other'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be one of: ' + validCategories.join(', ')
        });
      }
    }

    // Validate caption length if provided
    if (caption && caption.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Caption must be 500 characters or less'
      });
    }

    // Update allowed fields
    const image = user.workGalleryImages[imageIndex];
    if (caption !== undefined) image.caption = caption;
    if (category !== undefined) image.category = category;
    if (date !== undefined) image.date = date;
    if (location !== undefined) image.location = location;
    if (isBeforeAfter !== undefined) image.isBeforeAfter = isBeforeAfter;
    if (pairId !== undefined) image.pairId = pairId;

    user.markModified('workGalleryImages');
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Work gallery image updated successfully',
      data: user.workGalleryImages[imageIndex]
    });
  } catch (error) {
    console.error('Update work gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating work gallery image',
    });
  }
};

/**
 * @desc    Delete work gallery image
 * @route   DELETE /api/v1/work-gallery/:imageId
 * @access  Private (technician, owner only)
 */
exports.deleteWorkGalleryImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the image in the gallery
    const imageIndex = user.workGalleryImages?.findIndex(
      img => img._id.toString() === imageId
    );

    if (imageIndex === -1 || imageIndex === undefined) {
      return res.status(404).json({
        success: false,
        message: 'Work gallery image not found'
      });
    }

    const image = user.workGalleryImages[imageIndex];

    // Delete from Cloudinary
    try {
      await cloudinaryService.deleteFile(image.publicId, 'image');
    } catch (cloudinaryError) {
      console.warn('Failed to delete from Cloudinary:', cloudinaryError.message);
      // Continue with database deletion even if Cloudinary fails
    }

    // Remove from array
    user.workGalleryImages.splice(imageIndex, 1);

    // Reorder remaining images
    user.workGalleryImages.forEach((img, idx) => {
      img.order = idx + 1;
    });

    user.markModified('workGalleryImages');
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Work gallery image deleted successfully',
      remainingImages: user.workGalleryImages.length
    });
  } catch (error) {
    console.error('Delete work gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting work gallery image',
    });
  }
};

/**
 * @desc    Reorder work gallery images
 * @route   PUT /api/v1/work-gallery/reorder
 * @access  Private (technician only)
 */
exports.reorderGalleryImages = async (req, res) => {
  try {
    const { imageIds } = req.body; // Array of image IDs in new order

    // Validate input
    if (!Array.isArray(imageIds)) {
      return res.status(400).json({
        success: false,
        message: 'imageIds must be an array'
      });
    }

    if (imageIds.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Cannot have more than 10 images'
      });
    }

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate all IDs belong to this user
    const userImageIds = user.workGalleryImages?.map(img => img._id.toString()) || [];
    const invalidIds = imageIds.filter(id => !userImageIds.includes(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image IDs provided'
      });
    }

    // Create ordered array of images
    const reorderedImages = [];
    imageIds.forEach((id, index) => {
      const image = user.workGalleryImages.find(img => img._id.toString() === id);
      if (image) {
        image.order = index + 1;
        reorderedImages.push(image);
      }
    });

    // Add any images not in the reorder list (shouldn't happen, but safety check)
    user.workGalleryImages.forEach(img => {
      if (!imageIds.includes(img._id.toString())) {
        reorderedImages.push(img);
      }
    });

    user.workGalleryImages = reorderedImages;
    user.markModified('workGalleryImages');
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Gallery reordered successfully',
      data: user.workGalleryImages
    });
  } catch (error) {
    console.error('Reorder gallery images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering gallery images',
    });
  }
};

/**
 * @desc    Get technician's work gallery (public)
 * @route   GET /api/v1/work-gallery/technician/:technicianId
 * @access  Public
 */
exports.getTechnicianGallery = async (req, res) => {
  try {
    const { technicianId } = req.params;

    // Find technician
    const technician = await User.findById(technicianId).select('firstName lastName profilePicture businessName rating workGalleryImages');

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    if (technician.role !== 'technician') {
      return res.status(400).json({
        success: false,
        message: 'User is not a technician'
      });
    }

    // Sort images by order
    const sortedImages = technician.workGalleryImages
      ? [...technician.workGalleryImages].sort((a, b) => a.order - b.order)
      : [];

    res.status(200).json({
      success: true,
      data: {
        technicianId: technician._id,
        technicianName: `${technician.firstName} ${technician.lastName}`,
        businessName: technician.businessName,
        profilePicture: technician.profilePicture,
        rating: technician.rating,
        images: sortedImages,
        totalCount: sortedImages.length
      }
    });
  } catch (error) {
    console.error('Get technician gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching technician gallery',
    });
  }
};

/**
 * @desc    Set before/after pair for images
 * @route   POST /api/v1/work-gallery/before-after
 * @access  Private (technician only)
 */
exports.setBeforeAfterPair = async (req, res) => {
  try {
    const { beforeId, afterId } = req.body;

    // Validate input
    if (!beforeId || !afterId) {
      return res.status(400).json({
        success: false,
        message: 'Both beforeId and afterId are required'
      });
    }

    if (beforeId === afterId) {
      return res.status(400).json({
        success: false,
        message: 'Before and after images cannot be the same'
      });
    }

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find both images
    const beforeIndex = user.workGalleryImages?.findIndex(
      img => img._id.toString() === beforeId
    );
    const afterIndex = user.workGalleryImages?.findIndex(
      img => img._id.toString() === afterId
    );

    if (beforeIndex === -1 || beforeIndex === undefined) {
      return res.status(404).json({
        success: false,
        message: 'Before image not found'
      });
    }

    if (afterIndex === -1 || afterIndex === undefined) {
      return res.status(404).json({
        success: false,
        message: 'After image not found'
      });
    }

    // Set pairing
    user.workGalleryImages[beforeIndex].isBeforeAfter = true;
    user.workGalleryImages[beforeIndex].pairId = afterId;

    user.workGalleryImages[afterIndex].isBeforeAfter = true;
    user.workGalleryImages[afterIndex].pairId = beforeId;

    user.markModified('workGalleryImages');
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Before/After pair set successfully',
      data: {
        before: user.workGalleryImages[beforeIndex],
        after: user.workGalleryImages[afterIndex]
      }
    });
  } catch (error) {
    console.error('Set before/after pair error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting before/after pair',
    });
  }
};

/**
 * @desc    Get current user's work gallery
 * @route   GET /api/v1/work-gallery/my-gallery
 * @access  Private (technician only)
 */
exports.getMyGallery = async (req, res) => {
  try {
    // Find user
    const user = await User.findById(req.user.id).select('workGalleryImages');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Sort images by order
    const sortedImages = user.workGalleryImages
      ? [...user.workGalleryImages].sort((a, b) => a.order - b.order)
      : [];

    res.status(200).json({
      success: true,
      data: sortedImages,
      totalCount: sortedImages.length,
      remainingSlots: 10 - sortedImages.length
    });
  } catch (error) {
    console.error('Get my gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching gallery',
    });
  }
};
