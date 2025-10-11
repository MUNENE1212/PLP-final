const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Post = require('../models/Post');

/**
 * @desc    Get all users (with filters)
 * @route   GET /api/v1/users
 * @access  Public (filtered) / Admin (full)
 */
exports.getUsers = async (req, res) => {
  try {
    const {
      role,
      status,
      search,
      skills,
      minRating,
      lat,
      lng,
      radius = 10, // km
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    // Filters
    if (role) query.role = role;
    if (status && req.user?.role === 'admin') {
      query.status = status;
    } else {
      query.status = 'active'; // Public can only see active users
    }

    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query['skills.name'] = { $in: skillsArray };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Geospatial search
    if (lat && lng) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password -twoFactorAuth -loginHistory')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * @desc    Get nearby technicians
 * @route   GET /api/v1/users/nearby-technicians
 * @access  Public
 */
exports.getNearbyTechnicians = async (req, res) => {
  try {
    const { lat, lng, radius = 10, skills, minRating } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    const query = {
      role: 'technician',
      status: 'active',
      'availability.isAvailable': true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000
        }
      }
    };

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query['skills.name'] = { $in: skillsArray };
    }

    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    const technicians = await User.find(query)
      .select('firstName lastName profilePicture rating skills location businessName')
      .limit(20);

    res.status(200).json({
      success: true,
      count: technicians.length,
      technicians
    });
  } catch (error) {
    console.error('Get nearby technicians error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby technicians'
    });
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -twoFactorAuth -loginHistory');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get additional stats for technicians
    if (user.role === 'technician') {
      const [completedBookings, reviewStats] = await Promise.all([
        Booking.countDocuments({
          technician: user._id,
          status: 'completed'
        }),
        Review.aggregate([
          { $match: { reviewee: user._id } },
          {
            $group: {
              _id: null,
              avgRating: { $avg: '$rating.overall' },
              totalReviews: { $sum: 1 }
            }
          }
        ])
      ]);

      user._doc.stats = {
        completedBookings,
        reviews: reviewStats[0] || { avgRating: 0, totalReviews: 0 }
      };
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/:id
 * @access  Private (own profile) / Admin
 */
exports.updateUser = async (req, res) => {
  try {
    // Check authorization
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const allowedFields = [
      'firstName',
      'lastName',
      'bio',
      'profilePicture',
      'phoneNumber',
      'location',
      'businessName',
      'skills',
      'availability',
      'preferences',
      'emergencyContact',
      'socialLinks'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Admin-only fields
    if (req.user.role === 'admin') {
      if (req.body.role) updates.role = req.body.role;
      if (req.body.status) updates.status = req.body.status;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    ).select('-password -twoFactorAuth');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message
    });
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/v1/users/:id
 * @access  Private (own profile) / Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    // Check authorization
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this account'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - set status to deleted
    user.status = 'deleted';
    user.deletedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account'
    });
  }
};

/**
 * @desc    Follow/Unfollow user
 * @route   POST /api/v1/users/:id/follow
 * @access  Private
 */
exports.toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const [targetUser, currentUser] = await Promise.all([
      User.findById(targetUserId),
      User.findById(currentUserId)
    ]);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        id => id.toString() !== currentUserId
      );

      await Promise.all([currentUser.save(), targetUser.save()]);

      return res.status(200).json({
        success: true,
        message: 'Unfollowed successfully',
        isFollowing: false
      });
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);

      await Promise.all([currentUser.save(), targetUser.save()]);

      // TODO: Create notification for target user

      return res.status(200).json({
        success: true,
        message: 'Followed successfully',
        isFollowing: true
      });
    }
  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating follow status'
    });
  }
};

/**
 * @desc    Get user's followers
 * @route   GET /api/v1/users/:id/followers
 * @access  Public
 */
exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'firstName lastName profilePicture role rating');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      count: user.followers.length,
      followers: user.followers
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching followers'
    });
  }
};

/**
 * @desc    Get user's following
 * @route   GET /api/v1/users/:id/following
 * @access  Public
 */
exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'firstName lastName profilePicture role rating');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      count: user.following.length,
      following: user.following
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching following'
    });
  }
};

/**
 * @desc    Upload profile picture
 * @route   POST /api/v1/users/:id/profile-picture
 * @access  Private
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    // Check authorization
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    // TODO: Upload to Cloudinary
    // const result = await cloudinary.uploader.upload(req.file.path);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profilePicture: req.file.path }, // Use Cloudinary URL in production
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture'
    });
  }
};

/**
 * @desc    Get user's portfolio (for technicians)
 * @route   GET /api/v1/users/:id/portfolio
 * @access  Public
 */
exports.getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'technician') {
      return res.status(400).json({
        success: false,
        message: 'User is not a technician'
      });
    }

    // Get portfolio posts
    const portfolioPosts = await Post.find({
      author: user._id,
      type: 'portfolio',
      status: 'published'
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      portfolio: user.portfolio || [],
      posts: portfolioPosts
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching portfolio'
    });
  }
};

/**
 * @desc    Update user availability (for technicians)
 * @route   PUT /api/v1/users/:id/availability
 * @access  Private (technician)
 */
exports.updateAvailability = async (req, res) => {
  try {
    // Check authorization
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const user = await User.findById(req.params.id);

    if (user.role !== 'technician') {
      return res.status(400).json({
        success: false,
        message: 'Only technicians can set availability'
      });
    }

    const { isAvailable, schedule } = req.body;

    if (isAvailable !== undefined) {
      user.availability.isAvailable = isAvailable;
    }

    if (schedule) {
      user.availability.schedule = schedule;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      availability: user.availability
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability'
    });
  }
};

/**
 * @desc    Add FCM token for push notifications
 * @route   POST /api/v1/users/:id/fcm-token
 * @access  Private
 */
exports.addFCMToken = async (req, res) => {
  try {
    // Check authorization
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { token, device, platform } = req.body;

    if (!token || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token and platform'
      });
    }

    const user = await User.findById(req.params.id);

    // Remove existing token if it exists
    user.fcmTokens = user.fcmTokens.filter(t => t.token !== token);

    // Add new token
    user.fcmTokens.push({
      token,
      device,
      platform,
      addedAt: new Date()
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'FCM token added successfully'
    });
  } catch (error) {
    console.error('Add FCM token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding FCM token'
    });
  }
};

/**
 * @desc    Remove FCM token
 * @route   DELETE /api/v1/users/:id/fcm-token
 * @access  Private
 */
exports.removeFCMToken = async (req, res) => {
  try {
    // Check authorization
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { token } = req.body;

    const user = await User.findById(req.params.id);

    user.fcmTokens = user.fcmTokens.filter(t => t.token !== token);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'FCM token removed successfully'
    });
  } catch (error) {
    console.error('Remove FCM token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing FCM token'
    });
  }
};
