const ServiceCategory = require('../models/ServiceCategory');
const Service = require('../models/Service');
const ServiceApproval = require('../models/ServiceApproval');
const TechnicianService = require('../models/TechnicianService');

/**
 * @desc    Get all service categories
 * @route   GET /api/v1/services/categories
 * @access  Public
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.getCategoriesWithCounts();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single category with services
 * @route   GET /api/v1/services/category/:id
 * @access  Public
 */
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await ServiceCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get services in this category
    const services = await Service.findByCategory(category._id);

    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        services
      }
    });
  } catch (error) {
    console.error('Get category error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get category by slug
 * @route   GET /api/v1/services/category/slug/:slug
 * @access  Public
 */
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await ServiceCategory.findBySlug(slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get services in this category
    const services = await Service.findByCategory(category._id);

    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        services
      }
    });
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Search services
 * @route   GET /api/v1/services/search
 * @access  Public
 */
exports.searchServices = async (req, res) => {
  try {
    const { q, category, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchOptions = {
      limit: parseInt(limit, 10),
      categoryId: category || null
    };

    const services = await Service.searchServices(q.trim(), searchOptions);

    // Also search categories
    const categories = await ServiceCategory.searchCategories(q.trim());

    res.status(200).json({
      success: true,
      data: {
        services,
        categories,
        totalServices: services.length,
        totalCategories: categories.length
      }
    });
  } catch (error) {
    console.error('Search services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single service details
 * @route   GET /api/v1/services/:id
 * @access  Public
 */
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id)
      .populate('category', 'name slug icon color description');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Get technicians offering this service (top 5)
    const technicians = await TechnicianService.findByService(id, { limit: 5 });

    res.status(200).json({
      success: true,
      data: {
        ...service.toObject(),
        technicians
      }
    });
  } catch (error) {
    console.error('Get service error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get popular services
 * @route   GET /api/v1/services/popular
 * @access  Public
 */
exports.getPopularServices = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const services = await Service.getPopular(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Get popular services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Submit custom service (Technician only)
 * @route   POST /api/v1/services/custom
 * @access  Private (Technician)
 */
exports.submitCustomService = async (req, res) => {
  try {
    const {
      categoryId,
      name,
      description,
      basePriceMin,
      basePriceMax,
      estimatedDurationMin,
      estimatedDurationMax,
      searchTags,
      icon
    } = req.body;

    // Validate required fields
    if (!categoryId || !name || !description || !basePriceMin || !basePriceMax) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: categoryId, name, description, basePriceMin, basePriceMax'
      });
    }

    // Validate category exists
    const category = await ServiceCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if service with same name already exists in category
    const existingService = await Service.findOne({
      name: name.toUpperCase(),
      category: categoryId
    });

    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'A service with this name already exists in this category'
      });
    }

    // Create the custom service
    const service = await Service.create({
      category: categoryId,
      name: name.toUpperCase(),
      description,
      icon: icon || null,
      basePrice: {
        min: basePriceMin,
        max: basePriceMax,
        currency: 'KES'
      },
      estimatedDuration: {
        min: estimatedDurationMin || 30,
        max: estimatedDurationMax || 120,
        unit: 'minutes'
      },
      isCustom: true,
      createdBy: req.user._id,
      approvalStatus: 'pending',
      searchTags: searchTags || [],
      isActive: true
    });

    // Create approval request
    const approval = await ServiceApproval.create({
      service: service._id,
      requestedBy: req.user._id,
      status: 'pending',
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Custom service submitted successfully. It will be reviewed by an administrator.',
      data: {
        service: await Service.findById(service._id).populate('category', 'name slug'),
        approval: {
          id: approval._id,
          status: approval.status,
          targetReviewDate: approval.targetReviewDate
        }
      }
    });
  } catch (error) {
    console.error('Submit custom service error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting custom service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get technician's custom services
 * @route   GET /api/v1/services/my-services
 * @access  Private (Technician)
 */
exports.getMyCustomServices = async (req, res) => {
  try {
    const services = await Service.findByTechnician(req.user._id);

    // Get approval status for each service
    const servicesWithApproval = await Promise.all(
      services.map(async (service) => {
        const approval = await ServiceApproval.findOne({ service: service._id })
          .sort({ createdAt: -1 });

        return {
          ...service.toObject(),
          approval
        };
      })
    );

    res.status(200).json({
      success: true,
      count: servicesWithApproval.length,
      data: servicesWithApproval
    });
  } catch (error) {
    console.error('Get my services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get pending custom services (Admin only)
 * @route   GET /api/v1/services/pending
 * @access  Private (Admin)
 */
exports.getPendingServices = async (req, res) => {
  try {
    const { page = 1, limit = 20, priority } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Get pending approvals
    const approvals = await ServiceApproval.findPending({
      limit: parseInt(limit, 10),
      skip,
      priority
    });

    // Get total count for pagination
    const totalQuery = { status: 'pending' };
    if (priority) totalQuery.priority = priority;
    const total = await ServiceApproval.countDocuments(totalQuery);

    res.status(200).json({
      success: true,
      data: approvals,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (error) {
    console.error('Get pending services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Approve custom service (Admin only)
 * @route   PUT /api/v1/services/:id/approve
 * @access  Private (Admin)
 */
exports.approveService = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Find the service
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (service.approvalStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Service is already ${service.approvalStatus}`
      });
    }

    // Find or create approval record
    let approval = await ServiceApproval.findOne({ service: id });

    if (!approval) {
      approval = await ServiceApproval.create({
        service: id,
        requestedBy: service.createdBy,
        status: 'pending'
      });
    }

    // Approve the service
    await approval.approve(req.user._id, notes);

    // Update service
    service.approvalStatus = 'approved';
    service.rejectionReason = undefined;
    await service.save();

    // Populate for response
    await service.populate('category', 'name slug');
    await service.populate('createdBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Service approved successfully',
      data: {
        service,
        approval
      }
    });
  } catch (error) {
    console.error('Approve service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Reject custom service (Admin only)
 * @route   PUT /api/v1/services/:id/reject
 * @access  Private (Admin)
 */
exports.rejectService = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Find the service
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (service.approvalStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Service is already ${service.approvalStatus}`
      });
    }

    // Find or create approval record
    let approval = await ServiceApproval.findOne({ service: id });

    if (!approval) {
      approval = await ServiceApproval.create({
        service: id,
        requestedBy: service.createdBy,
        status: 'pending'
      });
    }

    // Reject the service
    await approval.reject(req.user._id, reason, notes);

    // Update service
    service.approvalStatus = 'rejected';
    service.rejectionReason = reason;
    await service.save();

    // Populate for response
    await service.populate('category', 'name slug');
    await service.populate('createdBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Service rejected',
      data: {
        service,
        approval
      }
    });
  } catch (error) {
    console.error('Reject service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get services by category ID
 * @route   GET /api/v1/services/category/:categoryId/services
 * @access  Public
 */
exports.getServicesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20, sort = 'name' } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Validate category exists
    const category = await ServiceCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Build sort options
    const sortOptions = {
      name: { name: 1 },
      popularity: { 'stats.totalBookings': -1 },
      price: { 'basePrice.min': 1 }
    };

    const services = await Service.find({
      category: categoryId,
      isActive: true,
      approvalStatus: 'approved',
      deletedAt: null
    })
      .sort(sortOptions[sort] || sortOptions.name)
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Service.countDocuments({
      category: categoryId,
      isActive: true,
      approvalStatus: 'approved',
      deletedAt: null
    });

    res.status(200).json({
      success: true,
      data: services,
      category: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        color: category.color
      },
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (error) {
    console.error('Get services by category error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get technicians offering a service
 * @route   GET /api/v1/services/:serviceId/technicians
 * @access  Public
 */
exports.getServiceTechnicians = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { page = 1, limit = 10, sortBy = 'rating', minRating = 0 } = req.query;

    // Validate service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const technicianServices = await TechnicianService.findByService(serviceId, {
      limit: parseInt(limit, 10),
      minRating: parseFloat(minRating),
      sortBy
    });

    res.status(200).json({
      success: true,
      service: {
        _id: service._id,
        name: service.name,
        category: service.category
      },
      data: technicianServices,
      count: technicianServices.length
    });
  } catch (error) {
    console.error('Get service technicians error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching technicians',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get approval statistics (Admin only)
 * @route   GET /api/v1/services/stats/approvals
 * @access  Private (Admin)
 */
exports.getApprovalStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await ServiceApproval.getStats({
      startDate,
      endDate
    });

    // Get overdue count
    const overdueCount = await ServiceApproval.countDocuments({
      status: 'pending',
      targetReviewDate: { $lt: new Date() }
    });

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        overdueCount
      }
    });
  } catch (error) {
    console.error('Get approval stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching approval statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
