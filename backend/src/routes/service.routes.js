const express = require('express');
const { body, query, param } = require('express-validator');
const {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  searchServices,
  getServiceById,
  getPopularServices,
  submitCustomService,
  getMyCustomServices,
  getPendingServices,
  approveService,
  rejectService,
  getServicesByCategory,
  getServiceTechnicians,
  getApprovalStats
} = require('../controllers/service.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// ===== PUBLIC ROUTES =====

/**
 * @route   GET /api/v1/services/categories
 * @desc    Get all service categories with service counts
 * @access  Public
 */
router.get('/categories', getCategories);

/**
 * @route   GET /api/v1/services/popular
 * @desc    Get popular services
 * @access  Public
 */
router.get('/popular', getPopularServices);

/**
 * @route   GET /api/v1/services/search
 * @desc    Search services and categories
 * @access  Public
 * @query   {string} q - Search query (required)
 * @query   {string} category - Category ID filter (optional)
 * @query   {number} limit - Max results (default: 20)
 */
router.get(
  '/search',
  [
    query('q').trim().notEmpty().withMessage('Search query is required'),
    query('category').optional().isMongoId().withMessage('Invalid category ID'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate
  ],
  searchServices
);

/**
 * @route   GET /api/v1/services/category/slug/:slug
 * @desc    Get category by slug with services
 * @access  Public
 */
router.get(
  '/category/slug/:slug',
  [
    param('slug').trim().notEmpty().withMessage('Slug is required'),
    validate
  ],
  getCategoryBySlug
);

/**
 * @route   GET /api/v1/services/category/:id
 * @desc    Get category by ID with services
 * @access  Public
 */
router.get(
  '/category/:id',
  [
    param('id').isMongoId().withMessage('Invalid category ID'),
    validate
  ],
  getCategoryById
);

/**
 * @route   GET /api/v1/services/category/:categoryId/services
 * @desc    Get services by category
 * @access  Public
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Results per page (default: 20)
 * @query   {string} sort - Sort by name|popularity|price (default: name)
 */
router.get(
  '/category/:categoryId/services',
  [
    param('categoryId').isMongoId().withMessage('Invalid category ID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sort').optional().isIn(['name', 'popularity', 'price']).withMessage('Invalid sort option'),
    validate
  ],
  getServicesByCategory
);

/**
 * @route   GET /api/v1/services/:id
 * @desc    Get single service details
 * @access  Public
 */
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid service ID'),
    validate
  ],
  getServiceById
);

/**
 * @route   GET /api/v1/services/:serviceId/technicians
 * @desc    Get technicians offering a specific service
 * @access  Public
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Results per page (default: 10)
 * @query   {string} sortBy - Sort by rating|jobs|recent|price (default: rating)
 * @query   {number} minRating - Minimum rating filter (default: 0)
 */
router.get(
  '/:serviceId/technicians',
  [
    param('serviceId').isMongoId().withMessage('Invalid service ID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('sortBy').optional().isIn(['rating', 'jobs', 'recent', 'price']).withMessage('Invalid sort option'),
    query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Min rating must be between 0 and 5'),
    validate
  ],
  getServiceTechnicians
);

// ===== PROTECTED ROUTES (Technician) =====

/**
 * @route   POST /api/v1/services/custom
 * @desc    Submit a custom service for approval
 * @access  Private (Technician only)
 * @body    {string} categoryId - Category ID (required)
 * @body    {string} name - Service name (required)
 * @body    {string} description - Service description (required)
 * @body    {number} basePriceMin - Minimum price (required)
 * @body    {number} basePriceMax - Maximum price (required)
 * @body    {number} estimatedDurationMin - Min duration in minutes (optional)
 * @body    {number} estimatedDurationMax - Max duration in minutes (optional)
 * @body    {string[]} searchTags - Search tags (optional)
 * @body    {string} icon - Icon emoji or URL (optional)
 */
router.post(
  '/custom',
  protect,
  authorize('technician'),
  [
    body('categoryId')
      .isMongoId()
      .withMessage('Valid category ID is required'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Service name is required')
      .isLength({ max: 200 })
      .withMessage('Service name cannot exceed 200 characters'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('basePriceMin')
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a positive number'),
    body('basePriceMax')
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a positive number')
      .custom((value, { req }) => {
        if (value < req.body.basePriceMin) {
          throw new Error('Maximum price must be greater than or equal to minimum price');
        }
        return true;
      }),
    body('estimatedDurationMin')
      .optional()
      .isInt({ min: 15 })
      .withMessage('Minimum duration must be at least 15 minutes'),
    body('estimatedDurationMax')
      .optional()
      .isInt({ min: 15 })
      .withMessage('Maximum duration must be at least 15 minutes')
      .custom((value, { req }) => {
        if (req.body.estimatedDurationMin && value < req.body.estimatedDurationMin) {
          throw new Error('Maximum duration must be greater than or equal to minimum duration');
        }
        return true;
      }),
    body('searchTags')
      .optional()
      .isArray({ max: 20 })
      .withMessage('Search tags must be an array with max 20 items'),
    body('icon')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Icon cannot exceed 255 characters'),
    validate
  ],
  submitCustomService
);

/**
 * @route   GET /api/v1/services/my-services
 * @desc    Get technician's custom services
 * @access  Private (Technician only)
 */
router.get(
  '/my-services',
  protect,
  authorize('technician'),
  getMyCustomServices
);

// ===== PROTECTED ROUTES (Admin) =====

/**
 * @route   GET /api/v1/services/pending
 * @desc    Get pending custom services for approval
 * @access  Private (Admin only)
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Results per page (default: 20)
 * @query   {string} priority - Filter by priority (low|medium|high|urgent)
 */
router.get(
  '/pending',
  protect,
  authorize('admin'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    validate
  ],
  getPendingServices
);

/**
 * @route   GET /api/v1/services/stats/approvals
 * @desc    Get approval statistics
 * @access  Private (Admin only)
 */
router.get(
  '/stats/approvals',
  protect,
  authorize('admin'),
  getApprovalStats
);

/**
 * @route   PUT /api/v1/services/:id/approve
 * @desc    Approve a custom service
 * @access  Private (Admin only)
 * @body    {string} notes - Approval notes (optional)
 */
router.put(
  '/:id/approve',
  protect,
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid service ID'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notes cannot exceed 1000 characters'),
    validate
  ],
  approveService
);

/**
 * @route   PUT /api/v1/services/:id/reject
 * @desc    Reject a custom service
 * @access  Private (Admin only)
 * @body    {string} reason - Rejection reason (required)
 * @body    {string} notes - Additional notes (optional)
 */
router.put(
  '/:id/reject',
  protect,
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid service ID'),
    body('reason')
      .trim()
      .notEmpty()
      .withMessage('Rejection reason is required')
      .isLength({ max: 500 })
      .withMessage('Reason cannot exceed 500 characters'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Notes cannot exceed 1000 characters'),
    validate
  ],
  rejectService
);

module.exports = router;
