const express = require('express');
const router = express.Router();
const {
  calculatePrice,
  getEstimate,
  comparePrices,
  getServiceCatalog,
  getServiceTypes,
  validateServiceType,
  getPricingConfig,
  createPricingConfig,
  updatePricingConfig,
  addServicePrice,
  updateServicePrice,
  getConfigHistory
} = require('../controllers/pricing.controller');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/catalog/:category', getServiceCatalog);
router.get('/service-types/:category', getServiceTypes);
router.post('/validate-service', validateServiceType);

// Protected routes (requires authentication)
router.post('/calculate', protect, calculatePrice);
router.post('/estimate', protect, getEstimate);
router.post('/compare', protect, comparePrices);

// Admin only routes
router.get('/config', protect, authorize('admin'), getPricingConfig);
router.post('/config', protect, authorize('admin'), createPricingConfig);
router.put('/config/:id', protect, authorize('admin'), updatePricingConfig);
router.post('/config/:id/services', protect, authorize('admin'), addServicePrice);
router.put('/config/:id/services/:serviceCategory/:serviceType', protect, authorize('admin'), updateServicePrice);
router.get('/config/history', protect, authorize('admin'), getConfigHistory);

module.exports = router;
