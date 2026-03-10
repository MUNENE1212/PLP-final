const paymentPlanService = require('../services/paymentPlan.service');
const PaymentPlan = require('../models/PaymentPlan');

/**
 * Payment Plan Controller
 * REST API endpoints for technician payment plan management
 */

/**
 * @desc    Create a new payment plan
 * @route   POST /api/v1/payment-plans
 * @access  Private (Technician only)
 */
exports.createPaymentPlan = async (req, res) => {
  try {
    // Validate input data
    const validation = paymentPlanService.validatePaymentPlanData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const result = await paymentPlanService.createPaymentPlan(req.user.id, req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: result.message,
      data: result.data
    });

  } catch (error) {
    console.error('Create payment plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment plan',
      error: error.message
    });
  }
};

/**
 * @desc    Get technician's payment plans
 * @route   GET /api/v1/payment-plans/my-plans
 * @access  Private (Technician only)
 */
exports.getMyPaymentPlans = async (req, res) => {
  try {
    const { activeOnly = 'true' } = req.query;

    const result = await paymentPlanService.getPaymentPlansByTechnician(req.user.id, {
      activeOnly: activeOnly === 'true'
    });

    res.status(200).json({
      success: true,
      data: result.data,
      count: result.count
    });

  } catch (error) {
    console.error('Get my payment plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment plans',
      error: error.message
    });
  }
};

/**
 * @desc    Get payment plans for a specific service (public)
 * @route   GET /api/v1/payment-plans/service/:serviceId
 * @access  Public
 */
exports.getServicePaymentPlans = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { page, limit, sortBy } = req.query;

    const result = await paymentPlanService.getPaymentPlansByService(serviceId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sortBy: sortBy || 'rating'
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Get service payment plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment plans',
      error: error.message
    });
  }
};

/**
 * @desc    Get single payment plan by ID
 * @route   GET /api/v1/payment-plans/:id
 * @access  Public
 */
exports.getPaymentPlan = async (req, res) => {
  try {
    const result = await paymentPlanService.getPaymentPlanById(req.params.id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Get payment plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment plan',
      error: error.message
    });
  }
};

/**
 * @desc    Update payment plan
 * @route   PUT /api/v1/payment-plans/:id
 * @access  Private (Technician - owner only)
 */
exports.updatePaymentPlan = async (req, res) => {
  try {
    // Validate input data
    const validation = paymentPlanService.validatePaymentPlanData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const result = await paymentPlanService.updatePaymentPlan(
      req.params.id,
      req.user.id,
      req.body
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });

  } catch (error) {
    console.error('Update payment plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment plan',
      error: error.message
    });
  }
};

/**
 * @desc    Delete payment plan
 * @route   DELETE /api/v1/payment-plans/:id
 * @access  Private (Technician - owner only)
 */
exports.deletePaymentPlan = async (req, res) => {
  try {
    const result = await paymentPlanService.deletePaymentPlan(
      req.params.id,
      req.user.id
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Delete payment plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payment plan',
      error: error.message
    });
  }
};

/**
 * @desc    Deactivate payment plan (soft delete)
 * @route   PATCH /api/v1/payment-plans/:id/deactivate
 * @access  Private (Technician - owner only)
 */
exports.deactivatePaymentPlan = async (req, res) => {
  try {
    const result = await paymentPlanService.deactivatePaymentPlan(
      req.params.id,
      req.user.id
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Deactivate payment plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating payment plan',
      error: error.message
    });
  }
};

/**
 * @desc    Calculate total price for a payment plan
 * @route   POST /api/v1/payment-plans/:id/calculate
 * @access  Public
 */
exports.calculateTotal = async (req, res) => {
  try {
    const { hours, quantity } = req.body;

    const result = await paymentPlanService.calculateTotal(req.params.id, {
      hours: parseFloat(hours) || 1,
      quantity: parseInt(quantity) || 1
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || result.data?.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Calculate total error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating total',
      error: error.message
    });
  }
};

/**
 * @desc    Get active payment plan for technician-service combination
 * @route   GET /api/v1/payment-plans/technician/:technicianId/service/:serviceId
 * @access  Public
 */
exports.getTechnicianServicePlan = async (req, res) => {
  try {
    const { technicianId, serviceId } = req.params;

    const result = await paymentPlanService.getActivePaymentPlan(technicianId, serviceId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Get technician service plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment plan',
      error: error.message
    });
  }
};

/**
 * @desc    Get payment plan analytics for technician
 * @route   GET /api/v1/payment-plans/analytics
 * @access  Private (Technician only)
 */
exports.getPaymentPlanAnalytics = async (req, res) => {
  try {
    const result = await paymentPlanService.getPaymentPlanAnalytics(req.user.id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Get payment plan analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

/**
 * @desc    Validate payment plan data (for frontend validation)
 * @route   POST /api/v1/payment-plans/validate
 * @access  Private (Technician only)
 */
exports.validatePaymentPlan = async (req, res) => {
  try {
    const validation = paymentPlanService.validatePaymentPlanData(req.body);

    res.status(200).json({
      success: true,
      isValid: validation.isValid,
      errors: validation.errors
    });

  } catch (error) {
    console.error('Validate payment plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating payment plan',
      error: error.message
    });
  }
};

/**
 * @desc    Get payment plan types and their configurations
 * @route   GET /api/v1/payment-plans/types
 * @access  Public
 */
exports.getPaymentPlanTypes = async (req, res) => {
  try {
    const planTypes = [
      {
        type: 'hourly',
        name: 'Hourly Rate',
        description: 'Charge clients based on the number of hours worked',
        fields: ['hourlyRate.amount', 'hourlyRate.currency', 'hourlyRate.minimumHours'],
        recommended: 'Best for ongoing work or tasks with uncertain duration'
      },
      {
        type: 'fixed',
        name: 'Fixed Price',
        description: 'Set a single price for the entire job',
        fields: ['fixedPrice.amount', 'fixedPrice.currency', 'fixedPrice.includesMaterials', 'fixedPrice.estimatedDuration'],
        recommended: 'Best for well-defined tasks with clear scope'
      },
      {
        type: 'milestone',
        name: 'Milestone-based',
        description: 'Break down payment into multiple milestones or phases',
        fields: ['milestones'],
        recommended: 'Best for large projects with multiple deliverables'
      },
      {
        type: 'per_project',
        name: 'Per Project (Quote-based)',
        description: 'Provide custom quotes for each project',
        fields: ['perProject.baseAmount', 'perProject.requiresQuote', 'perProject.estimatedRange'],
        recommended: 'Best for complex jobs requiring detailed assessment'
      },
      {
        type: 'negotiable',
        name: 'Negotiable',
        description: 'Allow clients to negotiate the price',
        fields: [],
        recommended: 'Best for flexible pricing or varied scope work'
      }
    ];

    res.status(200).json({
      success: true,
      data: planTypes
    });

  } catch (error) {
    console.error('Get payment plan types error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plan types',
      error: error.message
    });
  }
};

module.exports = exports;
