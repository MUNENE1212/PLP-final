const PaymentPlan = require('../models/PaymentPlan');
const User = require('../models/User');
const Service = require('../models/Service');

/**
 * Payment Plan Service
 * Business logic for technician payment plan management
 */

/**
 * Create a new payment plan for a technician
 * @param {ObjectId} technicianId - Technician's user ID
 * @param {Object} data - Payment plan data
 * @returns {Object} Created payment plan or error
 */
async function createPaymentPlan(technicianId, data) {
  try {
    // Verify technician exists and has correct role
    const technician = await User.findById(technicianId);
    if (!technician) {
      return {
        success: false,
        error: 'Technician not found'
      };
    }

    if (technician.role !== 'technician') {
      return {
        success: false,
        error: 'Only technicians can create payment plans'
      };
    }

    // Verify service exists
    const service = await Service.findById(data.service);
    if (!service) {
      return {
        success: false,
        error: 'Service not found'
      };
    }

    // Check if plan already exists for this technician-service combination
    const existingPlan = await PaymentPlan.findOne({
      technician: technicianId,
      service: data.service
    });

    if (existingPlan) {
      return {
        success: false,
        error: 'A payment plan already exists for this service. Please update the existing plan.'
      };
    }

    // Calculate milestone amounts if total is provided
    if (data.planType === 'milestone' && data.milestones?.length > 0 && data.totalAmount) {
      data.milestones = data.milestones.map(milestone => ({
        ...milestone,
        amount: (data.totalAmount * milestone.percentage) / 100
      }));
    }

    // Create the payment plan
    const paymentPlan = await PaymentPlan.create({
      technician: technicianId,
      ...data
    });

    // Populate references
    await paymentPlan.populate('service', 'name description category');

    return {
      success: true,
      data: paymentPlan,
      message: 'Payment plan created successfully'
    };

  } catch (error) {
    console.error('Create payment plan error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create payment plan'
    };
  }
}

/**
 * Update an existing payment plan
 * @param {ObjectId} planId - Payment plan ID
 * @param {ObjectId} technicianId - Technician's user ID (for authorization)
 * @param {Object} data - Updated payment plan data
 * @returns {Object} Updated payment plan or error
 */
async function updatePaymentPlan(planId, technicianId, data) {
  try {
    const paymentPlan = await PaymentPlan.findById(planId);

    if (!paymentPlan) {
      return {
        success: false,
        error: 'Payment plan not found'
      };
    }

    // Verify ownership
    if (paymentPlan.technician.toString() !== technicianId.toString()) {
      return {
        success: false,
        error: 'You can only update your own payment plans'
      };
    }

    // Prevent changing technician or service
    delete data.technician;
    delete data.service;

    // Recalculate milestone amounts if updating milestones with total
    if (data.planType === 'milestone' && data.milestones?.length > 0 && data.totalAmount) {
      data.milestones = data.milestones.map(milestone => ({
        ...milestone,
        amount: (data.totalAmount * milestone.percentage) / 100
      }));
    }

    // Update the plan
    Object.assign(paymentPlan, data);
    await paymentPlan.save();

    // Populate references
    await paymentPlan.populate('service', 'name description category');

    return {
      success: true,
      data: paymentPlan,
      message: 'Payment plan updated successfully'
    };

  } catch (error) {
    console.error('Update payment plan error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update payment plan'
    };
  }
}

/**
 * Get all payment plans for a technician
 * @param {ObjectId} technicianId - Technician's user ID
 * @param {Object} options - Query options
 * @param {boolean} options.activeOnly - Only return active plans
 * @returns {Object} List of payment plans
 */
async function getPaymentPlansByTechnician(technicianId, options = {}) {
  try {
    const { activeOnly = true } = options;

    const query = { technician: technicianId };
    if (activeOnly) {
      query.isActive = true;
    }

    const plans = await PaymentPlan.find(query)
      .populate('service', 'name description category basePrice')
      .sort({ createdAt: -1 });

    return {
      success: true,
      data: plans,
      count: plans.length
    };

  } catch (error) {
    console.error('Get technician payment plans error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch payment plans'
    };
  }
}

/**
 * Get all payment plans for a service (for customer browsing)
 * @param {ObjectId} serviceId - Service ID
 * @param {Object} options - Query options
 * @returns {Object} List of payment plans with technician info
 */
async function getPaymentPlansByService(serviceId, options = {}) {
  try {
    const { page = 1, limit = 10, sortBy = 'rating' } = options;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const plans = await PaymentPlan.find({
      service: serviceId,
      isActive: true
    })
      .populate({
        path: 'technician',
        select: 'firstName lastName rating businessName hourlyRate stats location',
        match: { status: 'active' }
      })
      .populate('service', 'name description')
      .sort(sortBy === 'rating' ? { 'stats.averageRating': -1 } : { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out plans where technician wasn't populated (inactive/deleted)
    const validPlans = plans.filter(plan => plan.technician);

    const total = await PaymentPlan.countDocuments({
      service: serviceId,
      isActive: true
    });

    return {
      success: true,
      data: validPlans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };

  } catch (error) {
    console.error('Get service payment plans error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch payment plans'
    };
  }
}

/**
 * Get active payment plan for a technician-service combination
 * @param {ObjectId} technicianId - Technician's user ID
 * @param {ObjectId} serviceId - Service ID
 * @returns {Object} Payment plan or null
 */
async function getActivePaymentPlan(technicianId, serviceId) {
  try {
    const plan = await PaymentPlan.getActivePlan(technicianId, serviceId);

    if (!plan) {
      return {
        success: false,
        error: 'No active payment plan found for this technician and service'
      };
    }

    return {
      success: true,
      data: plan
    };

  } catch (error) {
    console.error('Get active payment plan error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch payment plan'
    };
  }
}

/**
 * Get a single payment plan by ID
 * @param {ObjectId} planId - Payment plan ID
 * @returns {Object} Payment plan or error
 */
async function getPaymentPlanById(planId) {
  try {
    const plan = await PaymentPlan.findById(planId)
      .populate('technician', 'firstName lastName rating businessName')
      .populate('service', 'name description category');

    if (!plan) {
      return {
        success: false,
        error: 'Payment plan not found'
      };
    }

    return {
      success: true,
      data: plan
    };

  } catch (error) {
    console.error('Get payment plan error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch payment plan'
    };
  }
}

/**
 * Deactivate a payment plan (soft delete)
 * @param {ObjectId} planId - Payment plan ID
 * @param {ObjectId} technicianId - Technician's user ID (for authorization)
 * @returns {Object} Success status or error
 */
async function deactivatePaymentPlan(planId, technicianId) {
  try {
    const paymentPlan = await PaymentPlan.findById(planId);

    if (!paymentPlan) {
      return {
        success: false,
        error: 'Payment plan not found'
      };
    }

    // Verify ownership
    if (paymentPlan.technician.toString() !== technicianId.toString()) {
      return {
        success: false,
        error: 'You can only deactivate your own payment plans'
      };
    }

    paymentPlan.isActive = false;
    await paymentPlan.save();

    return {
      success: true,
      message: 'Payment plan deactivated successfully'
    };

  } catch (error) {
    console.error('Deactivate payment plan error:', error);
    return {
      success: false,
      error: error.message || 'Failed to deactivate payment plan'
    };
  }
}

/**
 * Delete a payment plan permanently
 * @param {ObjectId} planId - Payment plan ID
 * @param {ObjectId} technicianId - Technician's user ID (for authorization)
 * @returns {Object} Success status or error
 */
async function deletePaymentPlan(planId, technicianId) {
  try {
    const paymentPlan = await PaymentPlan.findById(planId);

    if (!paymentPlan) {
      return {
        success: false,
        error: 'Payment plan not found'
      };
    }

    // Verify ownership
    if (paymentPlan.technician.toString() !== technicianId.toString()) {
      return {
        success: false,
        error: 'You can only delete your own payment plans'
      };
    }

    await PaymentPlan.findByIdAndDelete(planId);

    return {
      success: true,
      message: 'Payment plan deleted successfully'
    };

  } catch (error) {
    console.error('Delete payment plan error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete payment plan'
    };
  }
}

/**
 * Calculate total price based on plan type and options
 * @param {ObjectId} planId - Payment plan ID
 * @param {Object} options - Calculation options
 * @returns {Object} Calculation result with breakdown
 */
async function calculateTotal(planId, options = {}) {
  try {
    const paymentPlan = await PaymentPlan.findById(planId);

    if (!paymentPlan) {
      return {
        success: false,
        error: 'Payment plan not found'
      };
    }

    if (!paymentPlan.isActive) {
      return {
        success: false,
        error: 'This payment plan is no longer active'
      };
    }

    const result = paymentPlan.calculateTotal(options);

    return {
      success: result.success,
      data: result,
      error: result.error
    };

  } catch (error) {
    console.error('Calculate total error:', error);
    return {
      success: false,
      error: error.message || 'Failed to calculate total'
    };
  }
}

/**
 * Update payment plan statistics (called after booking completion)
 * @param {ObjectId} planId - Payment plan ID
 * @param {Object} stats - Statistics to update
 * @returns {Object} Success status
 */
async function updatePlanStats(planId, stats = {}) {
  try {
    const paymentPlan = await PaymentPlan.findById(planId);

    if (!paymentPlan) {
      return {
        success: false,
        error: 'Payment plan not found'
      };
    }

    if (stats.revenue) {
      paymentPlan.stats.totalRevenue += stats.revenue;
    }

    if (stats.used) {
      paymentPlan.stats.timesUsed += 1;
    }

    if (stats.rating !== undefined) {
      // Calculate new average rating
      const currentTotal = paymentPlan.stats.averageRating * paymentPlan.stats.timesUsed;
      const newCount = paymentPlan.stats.timesUsed + (stats.used ? 0 : 1);
      paymentPlan.stats.averageRating = (currentTotal + stats.rating) / newCount;
    }

    await paymentPlan.save();

    return {
      success: true,
      message: 'Statistics updated successfully'
    };

  } catch (error) {
    console.error('Update plan stats error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update statistics'
    };
  }
}

/**
 * Get payment plan analytics for a technician
 * @param {ObjectId} technicianId - Technician's user ID
 * @returns {Object} Analytics data
 */
async function getPaymentPlanAnalytics(technicianId) {
  try {
    const plans = await PaymentPlan.find({ technician: technicianId });

    const analytics = {
      totalPlans: plans.length,
      activePlans: plans.filter(p => p.isActive).length,
      planTypeBreakdown: {},
      totalRevenue: 0,
      averageRating: 0,
      mostUsedPlanType: null
    };

    // Calculate breakdown by plan type
    plans.forEach(plan => {
      const type = plan.planType;
      if (!analytics.planTypeBreakdown[type]) {
        analytics.planTypeBreakdown[type] = {
          count: 0,
          totalRevenue: 0,
          timesUsed: 0
        };
      }
      analytics.planTypeBreakdown[type].count += 1;
      analytics.planTypeBreakdown[type].totalRevenue += plan.stats?.totalRevenue || 0;
      analytics.planTypeBreakdown[type].timesUsed += plan.stats?.timesUsed || 0;
      analytics.totalRevenue += plan.stats?.totalRevenue || 0;
    });

    // Calculate average rating
    const plansWithRatings = plans.filter(p => p.stats?.averageRating > 0);
    if (plansWithRatings.length > 0) {
      analytics.averageRating = plansWithRatings.reduce((sum, p) => sum + p.stats.averageRating, 0) / plansWithRatings.length;
    }

    // Find most used plan type
    const planTypes = Object.entries(analytics.planTypeBreakdown);
    if (planTypes.length > 0) {
      planTypes.sort((a, b) => b[1].timesUsed - a[1].timesUsed);
      analytics.mostUsedPlanType = planTypes[0][0];
    }

    return {
      success: true,
      data: analytics
    };

  } catch (error) {
    console.error('Get analytics error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch analytics'
    };
  }
}

/**
 * Validate payment plan data before creation/update
 * @param {Object} data - Payment plan data to validate
 * @returns {Object} Validation result
 */
function validatePaymentPlanData(data) {
  const errors = [];

  // Required fields
  if (!data.planType) {
    errors.push('Plan type is required');
  }

  if (!data.service) {
    errors.push('Service is required');
  }

  // Validate plan type specific fields
  switch (data.planType) {
    case 'hourly':
      if (!data.hourlyRate?.amount || data.hourlyRate.amount <= 0) {
        errors.push('Valid hourly rate amount is required for hourly plans');
      }
      break;

    case 'fixed':
      if (!data.fixedPrice?.amount || data.fixedPrice.amount <= 0) {
        errors.push('Valid fixed price amount is required for fixed price plans');
      }
      break;

    case 'milestone':
      if (!data.milestones || data.milestones.length === 0) {
        errors.push('At least one milestone is required for milestone plans');
      } else {
        const totalPercentage = data.milestones.reduce((sum, m) => sum + (m.percentage || 0), 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          errors.push('Milestone percentages must sum to 100%');
        }
        data.milestones.forEach((m, i) => {
          if (!m.name) {
            errors.push(`Milestone ${i + 1}: Name is required`);
          }
          if (m.percentage === undefined || m.percentage < 0 || m.percentage > 100) {
            errors.push(`Milestone ${i + 1}: Valid percentage (0-100) is required`);
          }
        });
      }
      break;

    case 'per_project':
      if (!data.perProject?.requiresQuote) {
        if (!data.perProject?.baseAmount || data.perProject.baseAmount <= 0) {
          errors.push('Base amount is required for non-quote per-project plans');
        }
      }
      if (data.perProject?.estimatedRange) {
        if (data.perProject.estimatedRange.min && data.perProject.estimatedRange.max) {
          if (data.perProject.estimatedRange.min > data.perProject.estimatedRange.max) {
            errors.push('Minimum estimate cannot be greater than maximum');
          }
        }
      }
      break;

    case 'negotiable':
      // No specific validation
      break;

    default:
      if (data.planType) {
        errors.push(`Invalid plan type: ${data.planType}`);
      }
  }

  // Validate deposit settings
  if (data.deposit?.required) {
    if (!data.deposit.percentage && !data.deposit.minimumAmount) {
      errors.push('Deposit percentage or minimum amount is required when deposit is required');
    }
    if (data.deposit.percentage && (data.deposit.percentage < 0 || data.deposit.percentage > 100)) {
      errors.push('Deposit percentage must be between 0 and 100');
    }
  }

  // Validate date range
  if (data.validFrom && data.validUntil) {
    if (new Date(data.validFrom) >= new Date(data.validUntil)) {
      errors.push('Valid until date must be after valid from date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  createPaymentPlan,
  updatePaymentPlan,
  getPaymentPlansByTechnician,
  getPaymentPlansByService,
  getActivePaymentPlan,
  getPaymentPlanById,
  deactivatePaymentPlan,
  deletePaymentPlan,
  calculateTotal,
  updatePlanStats,
  getPaymentPlanAnalytics,
  validatePaymentPlanData
};
