/**
 * Escrow Controller
 *
 * REST API endpoints for the platform escrow system.
 * Handles all escrow-related HTTP requests.
 *
 * @module controllers/escrow.controller
 */

const escrowService = require('../services/escrow.service');

/**
 * Create escrow (internal, called by booking system)
 *
 * @route POST /api/v1/escrow
 * @access Private (system/admin)
 */
const createEscrow = async (req, res) => {
  try {
    const { bookingId, customerId, technicianId, amount, milestones } = req.body;

    // Validate required fields
    if (!bookingId || !customerId || !technicianId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: bookingId, customerId, technicianId, amount'
      });
    }

    const escrow = await escrowService.createEscrow(
      bookingId,
      customerId,
      technicianId,
      amount,
      { milestones }
    );

    res.status(201).json({
      success: true,
      message: 'Escrow created successfully',
      escrow
    });
  } catch (error) {
    console.error('Create escrow error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create escrow'
    });
  }
};

/**
 * Get escrow by ID
 *
 * @route GET /api/v1/escrow/:id
 * @access Private
 */
const getEscrow = async (req, res) => {
  try {
    const escrow = await escrowService.getEscrowById(req.params.id);

    // Check authorization
    const userId = req.user._id.toString();
    const isParticipant =
      escrow.customer._id.toString() === userId ||
      escrow.technician._id.toString() === userId;
    const isAdmin = ['admin', 'support'].includes(req.user.role);

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this escrow'
      });
    }

    res.json({
      success: true,
      escrow
    });
  } catch (error) {
    console.error('Get escrow error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Escrow not found'
    });
  }
};

/**
 * Get escrow by booking ID
 *
 * @route GET /api/v1/escrow/booking/:bookingId
 * @access Private
 */
const getEscrowByBooking = async (req, res) => {
  try {
    const escrow = await escrowService.getEscrowByBooking(req.params.bookingId);

    // Check authorization
    const userId = req.user._id.toString();
    const isParticipant =
      escrow.customer._id.toString() === userId ||
      escrow.technician._id.toString() === userId;
    const isAdmin = ['admin', 'support'].includes(req.user.role);

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this escrow'
      });
    }

    res.json({
      success: true,
      escrow
    });
  } catch (error) {
    console.error('Get escrow by booking error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Escrow not found'
    });
  }
};

/**
 * Fund escrow (M-Pesa webhook callback)
 *
 * @route POST /api/v1/escrow/:id/fund
 * @access Private (webhook/system)
 */
const fundEscrow = async (req, res) => {
  try {
    const { mpesaReference, checkoutRequestID, phoneNumber } = req.body;

    if (!mpesaReference) {
      return res.status(400).json({
        success: false,
        message: 'M-Pesa reference is required'
      });
    }

    const escrow = await escrowService.fundEscrow(
      req.params.id,
      mpesaReference,
      { checkoutRequestID, phoneNumber }
    );

    res.json({
      success: true,
      message: 'Escrow funded successfully',
      escrow
    });
  } catch (error) {
    console.error('Fund escrow error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to fund escrow'
    });
  }
};

/**
 * Release escrow to technician
 *
 * @route POST /api/v1/escrow/:id/release
 * @access Private (customer/admin/support)
 */
const releaseEscrow = async (req, res) => {
  try {
    const { notes, mpesaReference } = req.body;

    const escrow = await escrowService.releaseEscrow(
      req.params.id,
      req.user._id,
      { notes, mpesaReference }
    );

    res.json({
      success: true,
      message: 'Escrow released successfully',
      escrow
    });
  } catch (error) {
    console.error('Release escrow error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to release escrow'
    });
  }
};

/**
 * Release milestone payment
 *
 * @route POST /api/v1/escrow/:id/release-milestone
 * @access Private (customer/admin/support)
 */
const releaseMilestone = async (req, res) => {
  try {
    const { milestoneIndex } = req.body;

    if (typeof milestoneIndex !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Milestone index is required'
      });
    }

    const escrow = await escrowService.releaseMilestone(
      req.params.id,
      milestoneIndex,
      req.user._id
    );

    res.json({
      success: true,
      message: 'Milestone released successfully',
      escrow
    });
  } catch (error) {
    console.error('Release milestone error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to release milestone'
    });
  }
};

/**
 * Refund escrow to customer
 *
 * @route POST /api/v1/escrow/:id/refund
 * @access Private (admin/support)
 */
const refundEscrow = async (req, res) => {
  try {
    const { reason, amount } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Refund reason is required'
      });
    }

    const escrow = await escrowService.refundEscrow(
      req.params.id,
      reason,
      amount,
      req.user._id
    );

    res.json({
      success: true,
      message: 'Escrow refunded successfully',
      escrow
    });
  } catch (error) {
    console.error('Refund escrow error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to refund escrow'
    });
  }
};

/**
 * Open dispute on escrow
 *
 * @route POST /api/v1/escrow/:id/dispute
 * @access Private (customer/technician)
 */
const openDispute = async (req, res) => {
  try {
    const { reason, description, evidence } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Dispute reason is required'
      });
    }

    const escrow = await escrowService.openDispute(
      req.params.id,
      reason,
      req.user._id,
      { description, evidence }
    );

    res.json({
      success: true,
      message: 'Dispute opened successfully',
      escrow
    });
  } catch (error) {
    console.error('Open dispute error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to open dispute'
    });
  }
};

/**
 * Resolve dispute
 *
 * @route POST /api/v1/escrow/:id/resolve
 * @access Private (admin)
 */
const resolveDispute = async (req, res) => {
  try {
    const { resolution, splitRatio, notes } = req.body;

    if (!resolution) {
      return res.status(400).json({
        success: false,
        message: 'Resolution type is required'
      });
    }

    const escrow = await escrowService.resolveDispute(
      req.params.id,
      resolution,
      splitRatio,
      req.user._id,
      notes
    );

    res.json({
      success: true,
      message: 'Dispute resolved successfully',
      escrow
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to resolve dispute'
    });
  }
};

/**
 * Get user's escrows
 *
 * @route GET /api/v1/escrow/my-escrows
 * @access Private
 */
const getMyEscrows = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filters = { status, page: parseInt(page), limit: parseInt(limit) };

    let result;
    if (req.user.role === 'customer' || req.user.role === 'corporate') {
      result = await escrowService.getEscrowsByCustomer(req.user._id, filters);
    } else if (req.user.role === 'technician') {
      result = await escrowService.getEscrowsByTechnician(req.user._id, filters);
    } else {
      // Admin/support can see all
      result = await escrowService.getAllEscrows(filters);
    }

    res.json({
      success: true,
      escrows: result.escrows,
      pagination: result.pagination || {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.total,
        pages: Math.ceil(result.total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get my escrows error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get escrows'
    });
  }
};

/**
 * Get all escrows (admin/support)
 *
 * @route GET /api/v1/escrow
 * @access Private (admin/support)
 */
const getAllEscrows = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
    const filters = {
      status,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await escrowService.getAllEscrows(filters);

    res.json({
      success: true,
      escrows: result.escrows,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get all escrows error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get escrows'
    });
  }
};

/**
 * Get escrow statistics
 *
 * @route GET /api/v1/escrow/stats
 * @access Private (admin)
 */
const getEscrowStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await escrowService.getEscrowStats({ startDate, endDate });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get escrow stats error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get escrow statistics'
    });
  }
};

/**
 * Process auto-releases (cron job)
 *
 * @route POST /api/v1/escrow/process-auto-releases
 * @access Private (system/admin)
 */
const processAutoReleases = async (req, res) => {
  try {
    const results = await escrowService.processAutoReleases();

    res.json({
      success: true,
      message: 'Auto-release processing completed',
      results
    });
  } catch (error) {
    console.error('Process auto-releases error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process auto-releases'
    });
  }
};

module.exports = {
  createEscrow,
  getEscrow,
  getEscrowByBooking,
  fundEscrow,
  releaseEscrow,
  releaseMilestone,
  refundEscrow,
  openDispute,
  resolveDispute,
  getMyEscrows,
  getAllEscrows,
  getEscrowStats,
  processAutoReleases
};
