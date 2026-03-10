/**
 * Escrow Service
 *
 * Business logic for the platform escrow system.
 * Handles payment holding, releases, refunds, and disputes.
 *
 * @module services/escrow.service
 */

const Escrow = require('../models/Escrow');
const Booking = require('../models/Booking');
const User = require('../models/User');
const {
  calculatePlatformFee,
  getAutoReleaseDate,
  getAutoRefundDate,
  getDisputeDeadline
} = require('../config/fees');

/**
 * Create escrow for a booking
 *
 * @param {ObjectId} bookingId - Booking ID
 * @param {ObjectId} customerId - Customer ID
 * @param {ObjectId} technicianId - Technician ID
 * @param {number} amount - Total amount for the escrow
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Created escrow
 */
async function createEscrow(bookingId, customerId, technicianId, amount, options = {}) {
  // Validate inputs
  if (!bookingId || !customerId || !technicianId) {
    throw new Error('Booking ID, customer ID, and technician ID are required');
  }

  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  // Check if escrow already exists for this booking
  const existingEscrow = await Escrow.findOne({ booking: bookingId });
  if (existingEscrow) {
    throw new Error('Escrow already exists for this booking');
  }

  // Verify booking exists and has correct status
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  // Calculate fees
  const feeBreakdown = calculatePlatformFee(amount, { isMilestone: options.isMilestone });

  // Create escrow
  const escrow = new Escrow({
    booking: bookingId,
    customer: customerId,
    technician: technicianId,
    totalAmount: amount,
    platformFee: feeBreakdown.platformFee,
    tax: feeBreakdown.tax,
    technicianPayout: feeBreakdown.technicianPayout,
    currency: feeBreakdown.currency,
    status: 'pending',
    expiresAt: getAutoRefundDate(),
    milestones: options.milestones || [],
    autoReleaseEnabled: options.autoReleaseEnabled !== false,
    autoReleaseAfterDays: options.autoReleaseAfterDays || 3
  });

  // Add history entry
  escrow.addHistory({
    action: 'escrow_created',
    performedBy: customerId,
    fromStatus: null,
    toStatus: 'pending',
    notes: `Escrow created for booking ${booking.bookingNumber || bookingId}`
  });

  await escrow.save();

  return escrow;
}

/**
 * Fund escrow with M-Pesa payment
 *
 * @param {ObjectId} escrowId - Escrow ID
 * @param {string} mpesaReference - M-Pesa transaction reference
 * @param {Object} fundingDetails - Additional funding details
 * @returns {Promise<Object>} Updated escrow
 */
async function fundEscrow(escrowId, mpesaReference, fundingDetails = {}) {
  const escrow = await Escrow.findById(escrowId);
  if (!escrow) {
    throw new Error('Escrow not found');
  }

  // Check if escrow can be funded
  if (escrow.status !== 'pending') {
    throw new Error(`Cannot fund escrow with status: ${escrow.status}`);
  }

  // Update escrow
  escrow.status = 'funded';
  escrow.fundedAt = new Date();
  escrow.funding = {
    mpesaReference,
    checkoutRequestID: fundingDetails.checkoutRequestID,
    fundedAt: new Date(),
    amount: escrow.totalAmount,
    phoneNumber: fundingDetails.phoneNumber
  };

  // Set expiry date for auto-release
  escrow.expiresAt = getAutoReleaseDate();

  // Add history entry
  escrow.addHistory({
    action: 'escrow_funded',
    performedBy: escrow.customer,
    fromStatus: 'pending',
    toStatus: 'funded',
    notes: `Funded via M-Pesa: ${mpesaReference}`
  });

  await escrow.save();

  return escrow;
}

/**
 * Release escrow funds to technician
 *
 * @param {ObjectId} escrowId - Escrow ID
 * @param {ObjectId} releasedBy - User releasing the funds
 * @param {Object} options - Release options
 * @returns {Promise<Object>} Updated escrow
 */
async function releaseEscrow(escrowId, releasedBy, options = {}) {
  const escrow = await Escrow.findById(escrowId)
    .populate('booking')
    .populate('technician');

  if (!escrow) {
    throw new Error('Escrow not found');
  }

  // Check if escrow can be released
  if (!escrow.canRelease) {
    throw new Error(`Escrow cannot be released in status: ${escrow.status}`);
  }

  // Verify user is authorized (customer, admin, or support)
  const releaser = await User.findById(releasedBy);
  if (!releaser) {
    throw new Error('User not found');
  }

  const isAuthorized = ['admin', 'support'].includes(releaser.role) ||
                       releaser._id.toString() === escrow.customer.toString();

  if (!isAuthorized) {
    throw new Error('Not authorized to release escrow');
  }

  // Update escrow
  const previousStatus = escrow.status;
  escrow.status = 'released';
  escrow.releasedAt = new Date();
  escrow.payout = {
    amount: escrow.technicianPayout,
    paidOutAt: new Date(),
    status: 'pending',
    mpesaReference: options.mpesaReference
  };

  // Add history entry
  escrow.addHistory({
    action: 'escrow_released',
    performedBy: releasedBy,
    fromStatus: previousStatus,
    toStatus: 'released',
    notes: options.notes || 'Funds released to technician'
  });

  await escrow.save();

  // Update booking payment status
  if (escrow.booking) {
    await Booking.findByIdAndUpdate(escrow.booking._id, {
      'payment.status': 'completed',
      'payment.paidAt': new Date()
    });
  }

  return escrow;
}

/**
 * Release a milestone payment
 *
 * @param {ObjectId} escrowId - Escrow ID
 * @param {number} milestoneIndex - Index of milestone to release
 * @param {ObjectId} releasedBy - User releasing the milestone
 * @returns {Promise<Object>} Updated escrow
 */
async function releaseMilestone(escrowId, milestoneIndex, releasedBy) {
  const escrow = await Escrow.findById(escrowId);

  if (!escrow) {
    throw new Error('Escrow not found');
  }

  // Check if milestone exists
  const milestone = escrow.milestones[milestoneIndex];
  if (!milestone) {
    throw new Error('Milestone not found');
  }

  // Check if milestone can be released
  if (milestone.status !== 'pending') {
    throw new Error(`Milestone already ${milestone.status}`);
  }

  // Release milestone
  milestone.status = 'released';
  milestone.releasedAt = new Date();

  // Check if all milestones are released
  const allReleased = escrow.milestones.every(m => m.status === 'released');

  if (allReleased) {
    escrow.status = 'released';
    escrow.releasedAt = new Date();
  } else {
    escrow.status = 'partial_release';
  }

  // Add history entry
  escrow.addHistory({
    action: 'milestone_released',
    performedBy: releasedBy,
    fromStatus: escrow.status,
    toStatus: escrow.status,
    notes: `Milestone "${milestone.name}" released: KES ${milestone.amount}`
  });

  await escrow.save();

  return escrow;
}

/**
 * Refund escrow to customer
 *
 * @param {ObjectId} escrowId - Escrow ID
 * @param {string} reason - Refund reason
 * @param {number} amount - Refund amount (optional, defaults to remaining balance)
 * @param {ObjectId} initiatedBy - User initiating refund
 * @returns {Promise<Object>} Updated escrow
 */
async function refundEscrow(escrowId, reason, amount, initiatedBy) {
  const escrow = await Escrow.findById(escrowId);

  if (!escrow) {
    throw new Error('Escrow not found');
  }

  // Check if escrow can be refunded
  if (!escrow.canRefund) {
    throw new Error(`Escrow cannot be refunded in status: ${escrow.status}`);
  }

  // Calculate refund amount
  const refundAmount = amount || escrow.remainingBalance || escrow.totalAmount;

  if (refundAmount > escrow.totalAmount) {
    throw new Error('Refund amount exceeds escrow balance');
  }

  // Update escrow
  const previousStatus = escrow.status;
  escrow.status = 'refunded';
  escrow.refundedAt = new Date();
  escrow.refund = {
    reason,
    amount: refundAmount,
    refundedAt: new Date(),
    status: 'pending',
    initiatedBy
  };

  // Mark all pending milestones as refunded
  escrow.milestones.forEach(m => {
    if (m.status === 'pending') {
      m.status = 'refunded';
      m.refundedAt = new Date();
    }
  });

  // Add history entry
  escrow.addHistory({
    action: 'escrow_refunded',
    performedBy: initiatedBy,
    fromStatus: previousStatus,
    toStatus: 'refunded',
    notes: `Refund reason: ${reason}. Amount: KES ${refundAmount}`
  });

  await escrow.save();

  return escrow;
}

/**
 * Open a dispute on escrow
 *
 * @param {ObjectId} escrowId - Escrow ID
 * @param {string} reason - Dispute reason
 * @param {ObjectId} openedBy - User opening dispute
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Updated escrow
 */
async function openDispute(escrowId, reason, openedBy, options = {}) {
  const escrow = await Escrow.findById(escrowId);

  if (!escrow) {
    throw new Error('Escrow not found');
  }

  // Check if escrow can be disputed
  if (!escrow.canDispute) {
    throw new Error(`Escrow cannot be disputed in status: ${escrow.status}`);
  }

  // Check if already disputed
  if (escrow.dispute && escrow.dispute.openedAt) {
    throw new Error('Dispute already opened for this escrow');
  }

  // Update escrow
  const previousStatus = escrow.status;
  escrow.status = 'disputed';
  escrow.dispute = {
    reason,
    description: options.description,
    openedAt: new Date(),
    openedBy,
    evidence: options.evidence || []
  };

  // Extend expiry for dispute resolution
  escrow.expiresAt = getDisputeDeadline();

  // Add history entry
  escrow.addHistory({
    action: 'dispute_opened',
    performedBy: openedBy,
    fromStatus: previousStatus,
    toStatus: 'disputed',
    notes: `Dispute reason: ${reason}`
  });

  await escrow.save();

  // Update booking status if exists
  if (escrow.booking) {
    await Booking.findByIdAndUpdate(escrow.booking, {
      status: 'disputed',
      'dispute.raisedBy': openedBy,
      'dispute.raisedAt': new Date(),
      'dispute.reason': reason,
      'dispute.status': 'open'
    });
  }

  return escrow;
}

/**
 * Resolve a dispute
 *
 * @param {ObjectId} escrowId - Escrow ID
 * @param {string} resolution - Resolution type
 * @param {Object} splitRatio - Split ratio for partial resolution
 * @param {ObjectId} resolvedBy - Admin resolving dispute
 * @param {string} notes - Resolution notes
 * @returns {Promise<Object>} Updated escrow
 */
async function resolveDispute(escrowId, resolution, splitRatio, resolvedBy, notes = '') {
  const escrow = await Escrow.findById(escrowId);

  if (!escrow) {
    throw new Error('Escrow not found');
  }

  // Check if escrow is disputed
  if (escrow.status !== 'disputed') {
    throw new Error('Escrow is not in dispute status');
  }

  // Validate resolution
  const validResolutions = ['customer_favor', 'technician_favor', 'split', 'no_action'];
  if (!validResolutions.includes(resolution)) {
    throw new Error('Invalid resolution type');
  }

  // Calculate amounts based on resolution
  let customerAmount = 0;
  let technicianAmount = 0;

  switch (resolution) {
    case 'customer_favor':
      customerAmount = escrow.remainingBalance || escrow.totalAmount;
      break;
    case 'technician_favor':
      technicianAmount = escrow.technicianPayout;
      break;
    case 'split':
      customerAmount = (escrow.totalAmount * (splitRatio?.customer || 50)) / 100;
      technicianAmount = (escrow.technicianPayout * (splitRatio?.technician || 50)) / 100;
      break;
    case 'no_action':
      // Keep funds in escrow for manual resolution
      break;
  }

  // Update dispute details
  escrow.dispute.resolvedAt = new Date();
  escrow.dispute.resolvedBy = resolvedBy;
  escrow.dispute.resolution = resolution;
  escrow.dispute.resolutionNotes = notes;
  escrow.dispute.customerShare = splitRatio?.customer;
  escrow.dispute.technicianShare = splitRatio?.technician;

  // Update escrow status
  if (resolution === 'customer_favor') {
    escrow.status = 'refunded';
    escrow.refundedAt = new Date();
    escrow.refund = {
      reason: `Dispute resolved in customer favor: ${notes}`,
      amount: customerAmount,
      refundedAt: new Date(),
      status: 'pending',
      initiatedBy: resolvedBy
    };
  } else if (resolution === 'technician_favor' || resolution === 'split') {
    escrow.status = 'released';
    escrow.releasedAt = new Date();
    escrow.payout = {
      amount: technicianAmount,
      paidOutAt: new Date(),
      status: 'pending'
    };
    if (resolution === 'split' && customerAmount > 0) {
      escrow.refund = {
        reason: `Partial refund from dispute split: ${notes}`,
        amount: customerAmount,
        refundedAt: new Date(),
        status: 'pending',
        initiatedBy: resolvedBy
      };
    }
  }

  // Add history entry
  escrow.addHistory({
    action: 'dispute_resolved',
    performedBy: resolvedBy,
    fromStatus: 'disputed',
    toStatus: escrow.status,
    notes: `Resolution: ${resolution}. ${notes}`
  });

  await escrow.save();

  // Update booking dispute status
  if (escrow.booking) {
    await Booking.findByIdAndUpdate(escrow.booking, {
      'dispute.status': 'resolved',
      'dispute.resolvedBy': resolvedBy,
      'dispute.resolvedAt': new Date(),
      'dispute.resolution': resolution
    });
  }

  return escrow;
}

/**
 * Get escrow by booking ID
 *
 * @param {ObjectId} bookingId - Booking ID
 * @returns {Promise<Object>} Escrow document
 */
async function getEscrowByBooking(bookingId) {
  const escrow = await Escrow.findByBooking(bookingId);

  if (!escrow) {
    throw new Error('Escrow not found for this booking');
  }

  return escrow;
}

/**
 * Get escrow by ID
 *
 * @param {ObjectId} escrowId - Escrow ID
 * @returns {Promise<Object>} Escrow document
 */
async function getEscrowById(escrowId) {
  const escrow = await Escrow.findById(escrowId)
    .populate('booking')
    .populate('customer', 'firstName lastName phoneNumber email')
    .populate('technician', 'firstName lastName phoneNumber email');

  if (!escrow) {
    throw new Error('Escrow not found');
  }

  return escrow;
}

/**
 * Get escrows by customer ID
 *
 * @param {ObjectId} customerId - Customer ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of escrows
 */
async function getEscrowsByCustomer(customerId, filters = {}) {
  const query = { customer: customerId };

  if (filters.status) {
    query.status = filters.status;
  }

  const escrows = await Escrow.find(query)
    .populate('booking', 'bookingNumber serviceType status serviceCategory')
    .populate('technician', 'firstName lastName phoneNumber')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50)
    .skip(filters.skip || 0);

  const total = await Escrow.countDocuments(query);

  return { escrows, total };
}

/**
 * Get escrows by technician ID
 *
 * @param {ObjectId} technicianId - Technician ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of escrows
 */
async function getEscrowsByTechnician(technicianId, filters = {}) {
  const query = { technician: technicianId };

  if (filters.status) {
    query.status = filters.status;
  }

  const escrows = await Escrow.find(query)
    .populate('booking', 'bookingNumber serviceType status serviceCategory')
    .populate('customer', 'firstName lastName phoneNumber')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50)
    .skip(filters.skip || 0);

  const total = await Escrow.countDocuments(query);

  return { escrows, total };
}

/**
 * Get all escrows (admin/support)
 *
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Paginated escrows
 */
async function getAllEscrows(filters = {}) {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const escrows = await Escrow.find(query)
    .populate('booking', 'bookingNumber serviceType status')
    .populate('customer', 'firstName lastName phoneNumber')
    .populate('technician', 'firstName lastName phoneNumber')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Escrow.countDocuments(query);

  return {
    escrows,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get escrow statistics
 *
 * @param {Object} filters - Date filters
 * @returns {Promise<Object>} Statistics
 */
async function getEscrowStats(filters = {}) {
  return Escrow.getStats(filters.startDate, filters.endDate);
}

/**
 * Process auto-releases for expired escrows
 *
 * @returns {Promise<Object>} Processing results
 */
async function processAutoReleases() {
  const now = new Date();

  // Find escrows that should be auto-released
  const expiredEscrows = await Escrow.find({
    status: { $in: ['funded', 'partial_release'] },
    expiresAt: { $lte: now },
    autoReleaseEnabled: true
  }).populate('booking technician customer');

  const results = {
    processed: 0,
    released: [],
    errors: []
  };

  for (const escrow of expiredEscrows) {
    try {
      // Auto-release to technician
      escrow.status = 'released';
      escrow.releasedAt = new Date();
      escrow.payout = {
        amount: escrow.technicianPayout,
        paidOutAt: new Date(),
        status: 'pending'
      };

      escrow.addHistory({
        action: 'auto_released',
        performedBy: null,
        fromStatus: 'funded',
        toStatus: 'released',
        notes: 'Auto-released after expiry'
      });

      await escrow.save();
      results.released.push(escrow._id);
      results.processed++;
    } catch (error) {
      results.errors.push({
        escrowId: escrow._id,
        error: error.message
      });
    }
  }

  return results;
}

module.exports = {
  createEscrow,
  fundEscrow,
  releaseEscrow,
  releaseMilestone,
  refundEscrow,
  openDispute,
  resolveDispute,
  getEscrowById,
  getEscrowByBooking,
  getEscrowsByCustomer,
  getEscrowsByTechnician,
  getAllEscrows,
  getEscrowStats,
  processAutoReleases
};
