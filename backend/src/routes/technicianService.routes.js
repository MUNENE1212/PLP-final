/**
 * Technician Service Routes
 * Routes for managing technician's services from the WORD BANK
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyTechnicianServices,
  addTechnicianService,
  updateTechnicianService,
  removeTechnicianService,
  getTechnicianServices,
  toggleServiceAvailability,
  addPortfolioImage,
  removePortfolioImage,
} = require('../controllers/technicianService.controller');

// All routes require authentication
router.use(protect);

// ===== TECHNICIAN-SPECIFIC ROUTES =====

/**
 * @route   GET /api/v1/technician-services/my-services
 * @desc    Get all services offered by the current technician
 * @access  Private (Technician only)
 */
router.get('/my-services', authorize('technician'), getMyTechnicianServices);

/**
 * @route   POST /api/v1/technician-services
 * @desc    Add a new service to technician's offerings
 * @access  Private (Technician only)
 */
router.post('/', authorize('technician'), addTechnicianService);

/**
 * @route   PUT /api/v1/technician-services/:id
 * @desc    Update an existing technician service
 * @access  Private (Technician only, owner)
 */
router.put('/:id', authorize('technician'), updateTechnicianService);

/**
 * @route   DELETE /api/v1/technician-services/:id
 * @desc    Remove a service from technician's offerings
 * @access  Private (Technician only, owner)
 */
router.delete('/:id', authorize('technician'), removeTechnicianService);

/**
 * @route   PUT /api/v1/technician-services/:id/availability
 * @desc    Toggle service availability
 * @access  Private (Technician only, owner)
 */
router.put('/:id/availability', authorize('technician'), toggleServiceAvailability);

/**
 * @route   POST /api/v1/technician-services/:id/portfolio
 * @desc    Add portfolio image to technician service
 * @access  Private (Technician only, owner)
 */
router.post('/:id/portfolio', authorize('technician'), addPortfolioImage);

/**
 * @route   DELETE /api/v1/technician-services/:id/portfolio/:publicId
 * @desc    Remove portfolio image from technician service
 * @access  Private (Technician only, owner)
 */
router.delete('/:id/portfolio/:publicId', authorize('technician'), removePortfolioImage);

// ===== PUBLIC ROUTES =====

/**
 * @route   GET /api/v1/technician-services/technician/:technicianId
 * @desc    Get all services offered by a specific technician (public)
 * @access  Public
 */
router.get('/technician/:technicianId', getTechnicianServices);

module.exports = router;
