const Booking = require('../models/Booking');
const User = require('../models/User');
const pricingService = require('../services/pricing.service');

/**
 * @desc    Create a new booking
 * @route   POST /api/v1/bookings
 * @access  Private (Customer/Corporate)
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      serviceCategory,
      serviceType,
      description,
      scheduledDate,
      serviceLocation,
      technician,
      preferredTechnician,
      urgency,
      timeSlot,
      quantity
    } = req.body;

    // Validate customer role
    if (!['customer', 'corporate'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only customers and corporate accounts can create bookings'
      });
    }

    // Generate booking number
    const bookingCount = await Booking.countDocuments();
    const bookingNumber = `BKG-${Date.now()}-${(bookingCount + 1).toString().padStart(5, '0')}`;

    // Get customer data
    const customer = await User.findById(req.user.id);

    // Calculate pricing estimate (without specific technician initially)
    const pricingResult = await pricingService.getEstimate({
      serviceCategory,
      serviceType,
      urgency: urgency || 'medium',
      serviceLocation,
      customerLocation: customer.location || serviceLocation,
      scheduledDateTime: scheduledDate,
      customerId: req.user.id,
      quantity: quantity || 1
    });

    if (!pricingResult.success) {
      return res.status(400).json({
        success: false,
        message: pricingResult.error
      });
    }

    // Validate booking fee is calculated
    if (!pricingResult.breakdown.bookingFee || pricingResult.breakdown.bookingFee <= 0) {
      console.error('ERROR: Booking fee not calculated in pricing!');
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate booking fee. Please try again.',
        error: 'Booking fee amount is missing or zero'
      });
    }

    // Create booking data
    const bookingData = {
      bookingNumber,
      customer: req.user.id,
      serviceCategory,
      serviceType,
      description,
      serviceLocation: {
        type: 'Point',
        coordinates: serviceLocation.coordinates,
        address: serviceLocation.address
      },
      timeSlot: timeSlot || {
        date: scheduledDate,
        startTime: new Date(scheduledDate).toTimeString().slice(0, 5),
        endTime: new Date(new Date(scheduledDate).getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5)
      },
      status: 'pending',
      urgency: urgency || 'medium',
      pricing: pricingResult.breakdown,
      bookingFee: {
        required: true,
        percentage: 20,
        amount: pricingResult.breakdown.bookingFee,
        status: 'pending'
      }
    };

    // If specific technician requested
    if (technician) {
      const tech = await User.findById(technician);
      if (!tech || tech.role !== 'technician') {
        return res.status(400).json({
          success: false,
          message: 'Invalid technician'
        });
      }

      // Recalculate with specific technician
      const techPricingResult = await pricingService.calculatePrice({
        serviceCategory,
        serviceType,
        urgency: urgency || 'medium',
        serviceLocation,
        technicianLocation: tech.location,
        technicianId: technician,
        scheduledDateTime: scheduledDate,
        customerId: req.user.id,
        quantity: quantity || 1
      });

      if (techPricingResult.success) {
        bookingData.pricing = techPricingResult.breakdown;
        bookingData.bookingFee.amount = techPricingResult.breakdown.bookingFee;
      }

      bookingData.preferredTechnician = technician;
    } else if (preferredTechnician) {
      bookingData.preferredTechnician = preferredTechnician;
    }

    const booking = await Booking.create(bookingData);

    // Populate data for response
    await booking.populate([
      { path: 'customer', select: 'firstName lastName phoneNumber profilePicture' },
      { path: 'technician', select: 'firstName lastName phoneNumber profilePicture rating experience skills' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully. Please pay the booking fee to proceed with matching.',
      booking,
      nextSteps: {
        action: 'pay_booking_fee',
        amount: booking.bookingFee?.amount || 0,
        currency: booking.pricing?.currency || 'KES',
        description: '20% refundable booking deposit required before technician matching',
        endpoint: `/api/v1/bookings/${booking._id}/booking-fee/confirm`
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

/**
 * @desc    Get all bookings (with filters)
 * @route   GET /api/v1/bookings
 * @access  Private
 */
exports.getBookings = async (req, res) => {
  try {
    const {
      status,
      serviceType,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    // Filter by user role
    if (req.user.role === 'customer' || req.user.role === 'corporate') {
      query.customer = req.user.id;
    } else if (req.user.role === 'technician') {
      query.technician = req.user.id;
    }
    // Admin sees all bookings

    // Additional filters
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;

    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('customer', 'firstName lastName phoneNumber profilePicture')
      .populate('technician', 'firstName lastName phoneNumber profilePicture rating skills')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    // Hide contact information for bookings without verified payment
    const isAdminOrSupport = req.user.role === 'admin' || req.user.role === 'support';
    const safeBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      const paymentVerified = ['held', 'paid', 'released'].includes(bookingObj.bookingFee?.status);

      if (!paymentVerified && !isAdminOrSupport) {
        // Hide customer contact info from technician
        if (bookingObj.customer && req.user.role === 'technician') {
          bookingObj.customer = {
            _id: bookingObj.customer._id,
            firstName: bookingObj.customer.firstName,
            lastName: bookingObj.customer.lastName,
            profilePicture: bookingObj.customer.profilePicture,
            phoneNumber: '[Hidden]'
          };
        }

        // Hide technician contact info from customer
        if (bookingObj.technician && (req.user.role === 'customer' || req.user.role === 'corporate')) {
          bookingObj.technician = {
            _id: bookingObj.technician._id,
            firstName: bookingObj.technician.firstName,
            lastName: bookingObj.technician.lastName,
            profilePicture: bookingObj.technician.profilePicture,
            rating: bookingObj.technician.rating,
            skills: bookingObj.technician.skills,
            phoneNumber: '[Hidden]'
          };
        }

        bookingObj.contactsHidden = true;
      }

      return bookingObj;
    });

    res.status(200).json({
      success: true,
      count: safeBookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      bookings: safeBookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
};

/**
 * @desc    Get single booking
 * @route   GET /api/v1/bookings/:id
 * @access  Private
 */
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName lastName email phoneNumber profilePicture location')
      .populate('technician', 'firstName lastName email phoneNumber profilePicture rating skills location');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isAuthorized =
      booking.customer?._id?.toString() === req.user.id ||
      booking.technician?._id?.toString() === req.user.id ||
      req.user.role === 'admin' ||
      req.user.role === 'support';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    // Hide contact information until payment is verified
    const paymentVerified = ['held', 'paid', 'released'].includes(booking.bookingFee?.status);
    const isAdminOrSupport = req.user.role === 'admin' || req.user.role === 'support';

    const safeBooking = booking.toObject();

    if (!paymentVerified && !isAdminOrSupport) {
      // Hide customer contact info from technician
      if (safeBooking.customer && req.user.id === booking.technician?._id?.toString()) {
        safeBooking.customer = {
          _id: safeBooking.customer._id,
          firstName: safeBooking.customer.firstName,
          lastName: safeBooking.customer.lastName,
          profilePicture: safeBooking.customer.profilePicture,
          email: '[Hidden until payment verified]',
          phoneNumber: '[Hidden until payment verified]',
          location: { type: 'Point', coordinates: [0, 0], address: '[Hidden until payment verified]' }
        };
      }

      // Hide technician contact info from customer
      if (safeBooking.technician && req.user.id === booking.customer?._id?.toString()) {
        safeBooking.technician = {
          _id: safeBooking.technician._id,
          firstName: safeBooking.technician.firstName,
          lastName: safeBooking.technician.lastName,
          profilePicture: safeBooking.technician.profilePicture,
          rating: safeBooking.technician.rating,
          skills: safeBooking.technician.skills,
          email: '[Hidden until payment verified]',
          phoneNumber: '[Hidden until payment verified]',
          location: { type: 'Point', coordinates: [0, 0], address: '[Hidden until payment verified]' }
        };
      }

      safeBooking.contactsHidden = true;
      safeBooking.contactsHiddenReason = 'Payment verification required. Complete payment to view contact information.';
    }

    res.status(200).json({
      success: true,
      booking: safeBooking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

/**
 * @desc    Get booking statistics
 * @route   GET /api/v1/bookings/stats
 * @access  Private
 */
exports.getBookingStats = async (req, res) => {
  try {
    const query = {};

    // Filter by user role
    if (req.user.role === 'customer' || req.user.role === 'corporate') {
      query.customer = req.user.id;
    } else if (req.user.role === 'technician') {
      query.technician = req.user.id;
    }

    // Get counts by status
    const totalBookings = await Booking.countDocuments(query);
    const activeBookings = await Booking.countDocuments({
      ...query,
      status: { $in: ['pending', 'awaiting_acceptance', 'accepted', 'in_progress'] }
    });
    const completedBookings = await Booking.countDocuments({
      ...query,
      status: 'completed'
    });
    const cancelledBookings = await Booking.countDocuments({
      ...query,
      status: 'cancelled'
    });
    const pendingBookings = await Booking.countDocuments({
      ...query,
      status: { $in: ['pending', 'awaiting_acceptance'] }
    });

    // Get earnings/spending data
    const revenueData = await Booking.aggregate([
      {
        $match: {
          ...query,
          status: 'completed',
          'payment.status': 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    const totalEarningsOrSpent = revenueData.length > 0 ? revenueData[0].totalAmount : 0;

    // Get average rating
    const Review = require('../models/Review');
    let averageRating = 0;

    if (req.user.role === 'technician') {
      const ratingData = await Review.aggregate([
        { $match: { technician: req.user._id } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);
      averageRating = ratingData.length > 0 ? ratingData[0].avgRating : 0;
    } else if (req.user.role === 'customer') {
      const ratingData = await Review.aggregate([
        { $match: { customer: req.user._id } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);
      averageRating = ratingData.length > 0 ? ratingData[0].avgRating : 0;
    }

    // Get unread message count
    const Conversation = require('../models/Conversation');
    const conversations = await Conversation.find({
      participants: req.user.id,
      deletedFor: { $ne: req.user.id }
    });

    let unreadMessages = 0;
    conversations.forEach(conv => {
      const participant = conv.participants.find(p => p.user.toString() === req.user.id.toString());
      if (participant) {
        unreadMessages += participant.unreadCount || 0;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        activeBookings,
        completedBookings,
        cancelledBookings,
        pendingBookings,
        ...(req.user.role === 'technician' ? { totalEarnings: totalEarningsOrSpent } : { totalSpent: totalEarningsOrSpent }),
        averageRating: averageRating > 0 ? parseFloat(averageRating.toFixed(1)) : null,
        unreadMessages
      }
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking statistics'
    });
  }
};
