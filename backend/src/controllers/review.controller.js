const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');

/**
 * @desc    Create a review
 * @route   POST /api/v1/reviews
 * @access  Private
 */
exports.createReview = async (req, res) => {
  try {
    const { booking, reviewee, rating, title, comment, detailedRatings, images } = req.body;

    // Verify booking exists and is completed
    const bookingDoc = await Booking.findById(booking);
    if (!bookingDoc) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (bookingDoc.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    // Determine reviewer role
    let reviewerRole;
    if (bookingDoc.customer.toString() === req.user.id) {
      reviewerRole = 'customer';
      if (reviewee !== bookingDoc.technician.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reviewee for this booking'
        });
      }
    } else if (bookingDoc.technician?.toString() === req.user.id) {
      reviewerRole = 'technician';
      if (reviewee !== bookingDoc.customer.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reviewee for this booking'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking'
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      booking,
      reviewerRole
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Create review
    const review = await Review.create({
      booking,
      reviewer: req.user.id,
      reviewee,
      reviewerRole,
      rating: {
        overall: rating,
        ...detailedRatings
      },
      title,
      comment,
      images: images || [],
      isVerifiedPurchase: true
    });

    // Update user rating
    const reviews = await Review.find({ reviewee, status: 'published' });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating.overall, 0) / reviews.length;

    await User.findByIdAndUpdate(reviewee, {
      'rating.average': avgRating,
      'rating.count': reviews.length
    });

    await review.populate([
      { path: 'reviewer', select: 'firstName lastName profilePicture' },
      { path: 'reviewee', select: 'firstName lastName profilePicture' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

/**
 * @desc    Get all reviews
 * @route   GET /api/v1/reviews
 * @access  Public
 */
exports.getReviews = async (req, res) => {
  try {
    const { reviewee, reviewer, booking, minRating, page = 1, limit = 20 } = req.query;

    const query = { status: 'published' };

    if (reviewee) query.reviewee = reviewee;
    if (reviewer) query.reviewer = reviewer;
    if (booking) query.booking = booking;
    if (minRating) query['rating.overall'] = { $gte: parseFloat(minRating) };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(query)
      .populate('reviewer', 'firstName lastName profilePicture')
      .populate('reviewee', 'firstName lastName profilePicture role')
      .populate('booking', 'bookingNumber serviceType')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews'
    });
  }
};

/**
 * @desc    Get single review
 * @route   GET /api/v1/reviews/:id
 * @access  Public
 */
exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('reviewer', 'firstName lastName profilePicture')
      .populate('reviewee', 'firstName lastName profilePicture role')
      .populate('booking');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review'
    });
  }
};

/**
 * @desc    Update review
 * @route   PUT /api/v1/reviews/:id
 * @access  Private
 */
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const { rating, title, comment, images } = req.body;

    if (rating) review.rating.overall = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review'
    });
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private
 */
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review'
    });
  }
};

/**
 * @desc    Mark review as helpful
 * @route   POST /api/v1/reviews/:id/helpful
 * @access  Private
 */
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const alreadyMarked = review.helpful.includes(req.user.id);

    if (alreadyMarked) {
      review.helpful = review.helpful.filter(id => id.toString() !== req.user.id);
    } else {
      review.helpful.push(req.user.id);
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: alreadyMarked ? 'Removed helpful mark' : 'Marked as helpful',
      helpfulCount: review.helpful.length
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking review as helpful'
    });
  }
};

/**
 * @desc    Add business response to review
 * @route   POST /api/v1/reviews/:id/response
 * @access  Private (Reviewee only)
 */
exports.addResponse = async (req, res) => {
  try {
    const { text } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.reviewee.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the reviewee can respond to this review'
      });
    }

    if (review.response.text) {
      return res.status(400).json({
        success: false,
        message: 'Review already has a response'
      });
    }

    review.response = {
      text,
      respondedAt: new Date()
    };

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      response: review.response
    });
  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding response'
    });
  }
};
