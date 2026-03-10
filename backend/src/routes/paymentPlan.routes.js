const express = require('express');
const router = express.Router();
const {
  createPaymentPlan,
  getMyPaymentPlans,
  getServicePaymentPlans,
  getPaymentPlan,
  updatePaymentPlan,
  deletePaymentPlan,
  deactivatePaymentPlan,
  calculateTotal,
  getTechnicianServicePlan,
  getPaymentPlanAnalytics,
  validatePaymentPlan,
  getPaymentPlanTypes
} = require('../controllers/paymentPlan.controller');

const { protect, authorize } = require('../middleware/auth');

// ===== PUBLIC ROUTES =====

/**
 * @route   GET /api/v1/payment-plans/types
 * @desc    Get all available payment plan types
 * @access  Public
 */
router.get('/types', getPaymentPlanTypes);

/**
 * @route   GET /api/v1/payment-plans/service/:serviceId
 * @desc    Get all payment plans for a service (for customer browsing)
 * @access  Public
 */
router.get('/service/:serviceId', getServicePaymentPlans);

/**
 * @route   GET /api/v1/payment-plans/technician/:technicianId/service/:serviceId
 * @desc    Get active payment plan for technician-service combination
 * @access  Public
 */
router.get('/technician/:technicianId/service/:serviceId', getTechnicianServicePlan);

/**
 * @route   GET /api/v1/payment-plans/:id
 * @desc    Get single payment plan by ID
 * @access  Public
 */
router.get('/:id', getPaymentPlan);

/**
 * @route   POST /api/v1/payment-plans/:id/calculate
 * @desc    Calculate total price for a payment plan
 * @access  Public
 */
router.post('/:id/calculate', calculateTotal);

// ===== PROTECTED ROUTES (Technician only) =====

/**
 * @route   POST /api/v1/payment-plans
 * @desc    Create a new payment plan
 * @access  Private (Technician only)
 */
router.post('/', protect, authorize('technician'), createPaymentPlan);

/**
 * @route   GET /api/v1/payment-plans/my-plans
 * @desc    Get technician's own payment plans
 * @access  Private (Technician only)
 */
router.get('/my-plans', protect, authorize('technician'), getMyPaymentPlans);

/**
 * @route   GET /api/v1/payment-plans/analytics
 * @desc    Get payment plan analytics for technician
 * @access  Private (Technician only)
 */
router.get('/analytics', protect, authorize('technician'), getPaymentPlanAnalytics);

/**
 * @route   POST /api/v1/payment-plans/validate
 * @desc    Validate payment plan data (for frontend)
 * @access  Private (Technician only)
 */
router.post('/validate', protect, authorize('technician'), validatePaymentPlan);

/**
 * @route   PUT /api/v1/payment-plans/:id
 * @desc    Update payment plan
 * @access  Private (Technician - owner only)
 */
router.put('/:id', protect, authorize('technician'), updatePaymentPlan);

/**
 * @route   DELETE /api/v1/payment-plans/:id
 * @desc    Delete payment plan permanently
 * @access  Private (Technician - owner only)
 */
router.delete('/:id', protect, authorize('technician'), deletePaymentPlan);

/**
 * @route   PATCH /api/v1/payment-plans/:id/deactivate
 * @desc    Deactivate payment plan (soft delete)
 * @access  Private (Technician - owner only)
 */
router.patch('/:id/deactivate', protect, authorize('technician'), deactivatePaymentPlan);

module.exports = router;
