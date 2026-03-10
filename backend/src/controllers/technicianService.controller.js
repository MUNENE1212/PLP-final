/**
 * Technician Service Controller
 * Controller for managing technician's services from the WORD BANK
 */

const TechnicianService = require('../models/TechnicianService');
const Service = require('../models/Service');
const ServiceCategory = require('../models/ServiceCategory');

/**
 * Get all services offered by the current technician
 * @route   GET /api/v1/technician-services/my-services
 * @access  Private (Technician only)
 */
exports.getMyTechnicianServices = async (req, res) => {
  try {
    const technicianId = req.user._id;

    const services = await TechnicianService.find({
      technician: technicianId,
      deletedAt: null,
    })
      .populate('service', 'name slug icon description basePrice estimatedDuration')
      .populate('category', 'name slug color')
      .sort({ 'rating.average': -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: services,
      count: services.length,
    });
  } catch (error) {
    console.error('Get my technician services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Add a new service to technician's offerings
 * @route   POST /api/v1/technician-services
 * @access  Private (Technician only)
 */
exports.addTechnicianService = async (req, res) => {
  try {
    const technicianId = req.user._id;
    const { serviceId, categoryId, pricing, description, customerNotes, availability, qualifications } = req.body;

    // Validate required fields
    if (!serviceId || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Service and category are required',
      });
    }

    // Verify service exists and is active
    const service = await Service.findOne({
      _id: serviceId,
      isActive: true,
      approvalStatus: 'approved',
      deletedAt: null,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or not available',
      });
    }

    // Verify category exists
    const category = await ServiceCategory.findById(categoryId);
    if (!category || !category.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or not active',
      });
    }

    // Check if technician already has this service
    const existingService = await TechnicianService.findOne({
      technician: technicianId,
      service: serviceId,
      deletedAt: null,
    });

    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'You have already added this service',
      });
    }

    // Build pricing object
    const pricingData = {
      useCustomPricing: false,
      negotiable: true,
      callOutFee: 0,
      currency: 'KES',
    };

    // Handle pricing based on type
    if (pricing) {
      if (pricing.pricingType === 'hourly' && pricing.hourlyRate) {
        pricingData.useCustomPricing = true;
        pricingData.minPrice = pricing.hourlyRate;
        pricingData.maxPrice = pricing.hourlyRate;
      } else if (pricing.pricingType === 'fixed' && pricing.fixedPrice) {
        pricingData.useCustomPricing = true;
        pricingData.minPrice = pricing.fixedPrice;
        pricingData.maxPrice = pricing.fixedPrice;
      } else if (pricing.pricingType === 'negotiable') {
        pricingData.useCustomPricing = true;
        pricingData.minPrice = pricing.minPrice;
        pricingData.maxPrice = pricing.maxPrice;
      }
      pricingData.negotiable = pricing.negotiable !== undefined ? pricing.negotiable : true;
      pricingData.callOutFee = pricing.callOutFee || 0;
    }

    // Create technician service
    const technicianService = await TechnicianService.create({
      technician: technicianId,
      service: serviceId,
      category: categoryId,
      pricing: pricingData,
      description: description || '',
      customerNotes: customerNotes || '',
      availability: {
        isActive: availability?.isActive !== undefined ? availability.isActive : true,
        emergencyAvailable: availability?.emergencyAvailable || false,
        emergencyPremium: availability?.emergencyPremium || 0,
        serviceRadius: availability?.serviceRadius || 10,
      },
      qualifications: {
        yearsOfExperience: qualifications?.yearsOfExperience || 0,
        certifications: qualifications?.certifications || [],
        equipment: qualifications?.equipment || [],
      },
    });

    // Populate the created service
    await technicianService.populate('service', 'name slug icon description basePrice estimatedDuration');
    await technicianService.populate('category', 'name slug color');

    res.status(201).json({
      success: true,
      data: technicianService,
      message: 'Service added successfully to your offerings',
    });
  } catch (error) {
    console.error('Add technician service error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already added this service',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error adding service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update an existing technician service
 * @route   PUT /api/v1/technician-services/:id
 * @access  Private (Technician only, owner)
 */
exports.updateTechnicianService = async (req, res) => {
  try {
    const technicianId = req.user._id;
    const { id } = req.params;
    const { pricing, description, customerNotes, availability, qualifications } = req.body;

    // Find the technician service
    const technicianService = await TechnicianService.findOne({
      _id: id,
      technician: technicianId,
      deletedAt: null,
    });

    if (!technicianService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or you do not have permission',
      });
    }

    // Update pricing if provided
    if (pricing) {
      if (pricing.pricingType === 'hourly' && pricing.hourlyRate) {
        technicianService.pricing.useCustomPricing = true;
        technicianService.pricing.minPrice = pricing.hourlyRate;
        technicianService.pricing.maxPrice = pricing.hourlyRate;
      } else if (pricing.pricingType === 'fixed' && pricing.fixedPrice) {
        technicianService.pricing.useCustomPricing = true;
        technicianService.pricing.minPrice = pricing.fixedPrice;
        technicianService.pricing.maxPrice = pricing.fixedPrice;
      } else if (pricing.pricingType === 'negotiable') {
        technicianService.pricing.useCustomPricing = true;
        if (pricing.minPrice !== undefined) {
          technicianService.pricing.minPrice = pricing.minPrice;
        }
        if (pricing.maxPrice !== undefined) {
          technicianService.pricing.maxPrice = pricing.maxPrice;
        }
      }
      if (pricing.negotiable !== undefined) {
        technicianService.pricing.negotiable = pricing.negotiable;
      }
      if (pricing.callOutFee !== undefined) {
        technicianService.pricing.callOutFee = pricing.callOutFee;
      }
    }

    // Update description if provided
    if (description !== undefined) {
      technicianService.description = description;
    }

    // Update customer notes if provided
    if (customerNotes !== undefined) {
      technicianService.customerNotes = customerNotes;
    }

    // Update availability if provided
    if (availability) {
      if (availability.isActive !== undefined) {
        technicianService.availability.isActive = availability.isActive;
      }
      if (availability.emergencyAvailable !== undefined) {
        technicianService.availability.emergencyAvailable = availability.emergencyAvailable;
      }
      if (availability.emergencyPremium !== undefined) {
        technicianService.availability.emergencyPremium = availability.emergencyPremium;
      }
      if (availability.serviceRadius !== undefined) {
        technicianService.availability.serviceRadius = availability.serviceRadius;
      }
    }

    // Update qualifications if provided
    if (qualifications) {
      if (qualifications.yearsOfExperience !== undefined) {
        technicianService.qualifications.yearsOfExperience = qualifications.yearsOfExperience;
      }
      if (qualifications.certifications !== undefined) {
        technicianService.qualifications.certifications = qualifications.certifications;
      }
      if (qualifications.equipment !== undefined) {
        technicianService.qualifications.equipment = qualifications.equipment;
      }
    }

    await technicianService.save();

    // Populate updated service
    await technicianService.populate('service', 'name slug icon description basePrice estimatedDuration');
    await technicianService.populate('category', 'name slug color');

    res.status(200).json({
      success: true,
      data: technicianService,
      message: 'Service updated successfully',
    });
  } catch (error) {
    console.error('Update technician service error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Remove a service from technician's offerings (soft delete)
 * @route   DELETE /api/v1/technician-services/:id
 * @access  Private (Technician only, owner)
 */
exports.removeTechnicianService = async (req, res) => {
  try {
    const technicianId = req.user._id;
    const { id } = req.params;

    // Find and soft delete
    const technicianService = await TechnicianService.findOne({
      _id: id,
      technician: technicianId,
      deletedAt: null,
    });

    if (!technicianService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or you do not have permission',
      });
    }

    // Soft delete
    technicianService.deletedAt = new Date();
    technicianService.availability.isActive = false;
    await technicianService.save();

    res.status(200).json({
      success: true,
      message: 'Service removed from your offerings',
    });
  } catch (error) {
    console.error('Remove technician service error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error removing service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Toggle service availability
 * @route   PUT /api/v1/technician-services/:id/availability
 * @access  Private (Technician only, owner)
 */
exports.toggleServiceAvailability = async (req, res) => {
  try {
    const technicianId = req.user._id;
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isActive field is required',
      });
    }

    const technicianService = await TechnicianService.findOne({
      _id: id,
      technician: technicianId,
      deletedAt: null,
    });

    if (!technicianService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or you do not have permission',
      });
    }

    technicianService.availability.isActive = isActive;
    await technicianService.save();

    await technicianService.populate('service', 'name slug icon description');
    await technicianService.populate('category', 'name slug color');

    res.status(200).json({
      success: true,
      data: technicianService,
      message: `Service ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Toggle service availability error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get all services offered by a specific technician (public)
 * @route   GET /api/v1/technician-services/technician/:technicianId
 * @access  Public
 */
exports.getTechnicianServices = async (req, res) => {
  try {
    const { technicianId } = req.params;
    const { activeOnly = 'true' } = req.query;

    const query = {
      technician: technicianId,
      deletedAt: null,
    };

    if (activeOnly === 'true') {
      query['availability.isActive'] = true;
    }

    const services = await TechnicianService.find(query)
      .populate('service', 'name slug icon description basePrice estimatedDuration')
      .populate('category', 'name slug color')
      .sort({ 'rating.average': -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: services,
      count: services.length,
    });
  } catch (error) {
    console.error('Get technician services error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid technician ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching technician services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Add portfolio image to technician service
 * @route   POST /api/v1/technician-services/:id/portfolio
 * @access  Private (Technician only, owner)
 */
exports.addPortfolioImage = async (req, res) => {
  try {
    const technicianId = req.user._id;
    const { id } = req.params;
    const { url, publicId, caption } = req.body;

    if (!url || !publicId) {
      return res.status(400).json({
        success: false,
        message: 'Image URL and public ID are required',
      });
    }

    const technicianService = await TechnicianService.findOne({
      _id: id,
      technician: technicianId,
      deletedAt: null,
    });

    if (!technicianService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or you do not have permission',
      });
    }

    // Check max portfolio images
    if (technicianService.portfolioImages.length >= 15) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 15 portfolio images allowed per service',
      });
    }

    // Add image
    technicianService.portfolioImages.push({
      url,
      publicId,
      caption: caption || '',
      order: technicianService.portfolioImages.length,
      uploadedAt: new Date(),
    });

    await technicianService.save();

    await technicianService.populate('service', 'name slug icon description');
    await technicianService.populate('category', 'name slug color');

    res.status(200).json({
      success: true,
      data: technicianService,
      message: 'Portfolio image added successfully',
    });
  } catch (error) {
    console.error('Add portfolio image error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error adding portfolio image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Remove portfolio image from technician service
 * @route   DELETE /api/v1/technician-services/:id/portfolio/:publicId
 * @access  Private (Technician only, owner)
 */
exports.removePortfolioImage = async (req, res) => {
  try {
    const technicianId = req.user._id;
    const { id, publicId } = req.params;

    const technicianService = await TechnicianService.findOne({
      _id: id,
      technician: technicianId,
      deletedAt: null,
    });

    if (!technicianService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or you do not have permission',
      });
    }

    // Remove image
    const initialLength = technicianService.portfolioImages.length;
    technicianService.portfolioImages = technicianService.portfolioImages.filter(
      (img) => img.publicId !== publicId
    );

    if (technicianService.portfolioImages.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    // Reorder remaining images
    technicianService.portfolioImages.forEach((img, index) => {
      img.order = index;
    });

    await technicianService.save();

    await technicianService.populate('service', 'name slug icon description');
    await technicianService.populate('category', 'name slug color');

    res.status(200).json({
      success: true,
      data: technicianService,
      message: 'Portfolio image removed successfully',
    });
  } catch (error) {
    console.error('Remove portfolio image error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error removing portfolio image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
