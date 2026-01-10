const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Portfolio = require('../models/Portfolio');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');
const { uploadMultipleImages } = require('../middleware/upload');
const { uploadImage, deleteFile } = require('../config/cloudinary');

// Custom multer for adding images (max 5 additional images)
const uploadAdditionalImages = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const path = require('path');
      const fs = require('fs');
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const path = require('path');
      const ext = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, ext);
      cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const path = require('path');
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Maximum 5 additional images
  }
}).array('images', 5);

/**
 * @route   POST /api/v1/portfolio
 * @desc    Create a new portfolio item (technician only)
 * @access  Private (Technician)
 */
router.post('/', protect, authorize('technician', 'admin'), uploadMultipleImages, async (req, res) => {
  try {
    const { title, description, serviceCategory, location, tags, costRange, duration, bookingId } = req.body;

    // Verify booking if provided
    let booking = null;
    let verificationStatus = 'pending';

    if (bookingId) {
      booking = await Booking.findOne({
        _id: bookingId,
        technician: req.user._id,
        status: 'completed'
      }).populate('customer');

      if (!booking) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking or booking not completed'
        });
      }

      // Auto-verify if from completed booking
      verificationStatus = 'auto-verified';
    }

    // Process uploaded images
    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      type: 'final',
      caption: ''
    }));

    // Create portfolio item
    const portfolio = await Portfolio.create({
      technician: req.user._id,
      booking: bookingId || null,
      customer: booking?.customer || null,
      title,
      description,
      serviceCategory,
      location: JSON.parse(location),
      tags: tags ? JSON.parse(tags) : [],
      costRange: costRange ? JSON.parse(costRange) : undefined,
      duration: duration ? JSON.parse(duration) : undefined,
      images,
      verificationStatus
    });

    await portfolio.populate('customer', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: portfolio,
      message: verificationStatus === 'auto-verified'
        ? 'Portfolio item auto-verified from completed booking'
        : 'Portfolio item submitted for review'
    });
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create portfolio item'
    });
  }
});

/**
 * @route   GET /api/v1/portfolio/technician/:technicianId
 * @desc    Get all portfolio items for a technician (public)
 * @access  Public
 */
router.get('/technician/:technicianId', async (req, res) => {
  try {
    const { technicianId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const portfolio = await Portfolio.find({
      technician: technicianId,
      verificationStatus: { $in: ['auto-verified', 'verified'] },
      deletedAt: null
    })
    .populate('customer', 'firstName lastName')
    .sort({ completedAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .lean();

    const total = await Portfolio.countDocuments({
      technician: technicianId,
      verificationStatus: { $in: ['auto-verified', 'verified'] },
      deletedAt: null
    });

    res.json({
      success: true,
      data: {
        portfolio,
        total,
        hasMore: (parseInt(skip) + parseInt(limit)) < total
      }
    });
  } catch (error) {
    console.error('Error fetching technician portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio'
    });
  }
});

/**
 * @route   GET /api/v1/portfolio/featured
 * @desc    Get featured portfolio items across platform (public)
 * @access  Public
 */
router.get('/featured', async (req, res) => {
  try {
    const { limit = 12, serviceCategory } = req.query;

    const query = {
      verificationStatus: { $in: ['auto-verified', 'verified'] },
      deletedAt: null
    };

    if (serviceCategory) {
      query.serviceCategory = serviceCategory;
    }

    const portfolio = await Portfolio.find(query)
      .populate('technician', 'firstName lastName businessName location rating profileImage')
      .populate('customer', 'firstName')
      .sort({ views: -1, 'likes.length': -1, completedAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Error fetching featured portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured portfolio'
    });
  }
});

/**
 * @route   GET /api/v1/portfolio/my
 * @desc    Get current technician's portfolio (including pending)
 * @access  Private (Technician)
 */
router.get('/my', protect, authorize('technician'), async (req, res) => {
  try {
    const portfolio = await Portfolio.find({
      technician: req.user._id,
      deletedAt: null
    })
    .populate('customer', 'firstName lastName')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Error fetching my portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio'
    });
  }
});

/**
 * @route   GET /api/v1/portfolio/:id
 * @desc    Get single portfolio item with details
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id)
      .populate('technician', 'firstName lastName businessName location rating profileImage bio')
      .populate('customer', 'firstName lastName')
      .populate('booking', 'serviceCategory status');

    if (!portfolio || portfolio.deletedAt) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // Only show verified/auto-verified items publicly
    if (
      !['auto-verified', 'verified'].includes(portfolio.verificationStatus) &&
      (!req.user || req.user._id.toString() !== portfolio.technician._id.toString())
    ) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // Increment view count
    portfolio.views += 1;
    await portfolio.save();

    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio item'
    });
  }
});

/**
 * @route   PUT /api/v1/portfolio/:id
 * @desc    Update portfolio item (owner only)
 * @access  Private (Technician)
 */
router.put('/:id', protect, authorize('technician'), async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio || portfolio.deletedAt) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // Check ownership
    if (portfolio.technician.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this portfolio item'
      });
    }

    const { title, description, tags, costRange, duration } = req.body;

    portfolio.title = title || portfolio.title;
    portfolio.description = description || portfolio.description;
    portfolio.tags = tags || portfolio.tags;
    portfolio.costRange = costRange || portfolio.costRange;
    portfolio.duration = duration || portfolio.duration;

    await portfolio.save();

    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio item'
    });
  }
});

/**
 * @route   POST /api/v1/portfolio/:id/images
 * @desc    Add images to portfolio item
 * @access  Private (Technician)
 */
router.post('/:id/images', protect, authorize('technician'), uploadAdditionalImages, async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio || portfolio.deletedAt) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    if (portfolio.technician.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const newImages = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      type: 'final',
      caption: ''
    }));

    portfolio.images.push(...newImages);
    await portfolio.save();

    res.json({
      success: true,
      data: portfolio,
      message: `${newImages.length} image(s) added`
    });
  } catch (error) {
    console.error('Error adding images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add images'
    });
  }
});

/**
 * @route   DELETE /api/v1/portfolio/:id/images/:imageId
 * @desc    Remove image from portfolio item
 * @access  Private (Technician)
 */
router.delete('/:id/images/:imageId', protect, authorize('technician'), async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio || portfolio.deletedAt) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    if (portfolio.technician.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const image = portfolio.images.id(req.params.imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // Remove from array
    image.deleteOne();
    await portfolio.save();

    res.json({
      success: true,
      message: 'Image removed'
    });
  } catch (error) {
    console.error('Error removing image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove image'
    });
  }
});

/**
 * @route   POST /api/v1/portfolio/:id/like
 * @desc    Like/unlike portfolio item
 * @access  Private
 */
router.post('/:id/like', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio || portfolio.deletedAt) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    const alreadyLiked = portfolio.likes.includes(req.user._id);

    if (alreadyLiked) {
      portfolio.likes = portfolio.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      portfolio.likes.push(req.user._id);
    }

    await portfolio.save();

    res.json({
      success: true,
      data: {
        liked: !alreadyLiked,
        likeCount: portfolio.likes.length
      }
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update like'
    });
  }
});

/**
 * @route   DELETE /api/v1/portfolio/:id
 * @desc    Delete portfolio item (soft delete)
 * @access  Private (Technician)
 */
router.delete('/:id', protect, authorize('technician'), async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio || portfolio.deletedAt) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    if (portfolio.technician.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this portfolio item'
      });
    }

    // Soft delete
    portfolio.deletedAt = new Date();
    await portfolio.save();

    res.json({
      success: true,
      message: 'Portfolio item deleted'
    });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete portfolio item'
    });
  }
});

/**
 * @route   PUT /api/v1/portfolio/:id/verify
 * @desc    Approve/reject portfolio item (admin only)
 * @access  Private (Admin)
 */
router.put('/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio || portfolio.deletedAt) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    portfolio.verificationStatus = status;
    portfolio.reviewedBy = req.user._id;
    portfolio.reviewedAt = new Date();

    if (status === 'rejected') {
      portfolio.rejectionReason = rejectionReason || '';
    }

    await portfolio.save();

    res.json({
      success: true,
      data: portfolio,
      message: status === 'verified'
        ? 'Portfolio item approved'
        : 'Portfolio item rejected'
    });
  } catch (error) {
    console.error('Error verifying portfolio item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update verification status'
    });
  }
});

module.exports = router;
