/**
 * Availability Service
 * Manages real-time technician availability and queue system
 *
 * Task #73: Real-Time Availability & Queue System
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { getIO } = require('../config/socket');

/**
 * Availability status enum
 */
const AVAILABILITY_STATUS = {
  ONLINE: 'online',
  BUSY: 'busy',
  AWAY: 'away',
  OFFLINE: 'offline'
};

/**
 * Update technician availability status
 * @param {string} technicianId - Technician's user ID
 * @param {string} status - New status (online, busy, away, offline)
 * @param {string} [currentBookingId] - Optional current booking ID
 * @returns {Promise<Object>} Updated availability data
 */
async function updateTechnicianStatus(technicianId, status, currentBookingId = null) {
  // Validate status
  if (!Object.values(AVAILABILITY_STATUS).includes(status)) {
    throw new Error(`Invalid availability status: ${status}`);
  }

  // Find technician
  const technician = await User.findOne({
    _id: technicianId,
    role: 'technician',
    status: 'active'
  });

  if (!technician) {
    throw new Error('Technician not found or inactive');
  }

  // Update availability
  if (!technician.availability) {
    technician.availability = {};
  }

  technician.availability.status = status;
  technician.availability.lastSeen = new Date();

  if (currentBookingId !== undefined) {
    technician.availability.currentBookingId = currentBookingId;
  }

  // If going offline, clear current booking
  if (status === AVAILABILITY_STATUS.OFFLINE) {
    technician.availability.currentBookingId = null;
    technician.availability.queuePosition = 0;
  }

  await technician.save();

  // Broadcast status change
  const io = getIO();
  io.emit('availability:changed', {
    technicianId,
    status,
    lastSeen: technician.availability.lastSeen,
    currentBookingId: technician.availability.currentBookingId
  });

  return {
    technicianId,
    status,
    lastSeen: technician.availability.lastSeen,
    currentBookingId: technician.availability.currentBookingId
  };
}

/**
 * Update status based on booking lifecycle
 * @param {string} technicianId - Technician's user ID
 * @param {string} bookingStatus - Booking status
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Updated availability data
 */
async function updateStatusBasedOnBooking(technicianId, bookingStatus, bookingId) {
  let newStatus;

  switch (bookingStatus) {
    case 'in_progress':
      // Auto-set to 'busy' when booking starts
      newStatus = AVAILABILITY_STATUS.BUSY;
      return updateTechnicianStatus(technicianId, newStatus, bookingId);

    case 'completed':
    case 'cancelled':
      // Auto-set to 'online' when booking completes or is cancelled
      newStatus = AVAILABILITY_STATUS.ONLINE;
      return updateTechnicianStatus(technicianId, newStatus, null);

    case 'accepted':
      // Technician accepted but not yet started
      newStatus = AVAILABILITY_STATUS.ONLINE;
      return updateTechnicianStatus(technicianId, newStatus, null);

    default:
      // No status change for other booking states
      return { technicianId, status: 'unchanged' };
  }
}

/**
 * Calculate queue position for a customer's booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Queue position and estimated wait time
 */
async function calculateQueuePosition(bookingId) {
  const booking = await Booking.findById(bookingId)
    .populate('technician', 'availability')
    .populate('customer', 'firstName lastName');

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (!booking.technician) {
    return {
      bookingId,
      position: 0,
      estimatedWait: 0,
      message: 'No technician assigned yet'
    };
  }

  // Find all pending/in-progress bookings for this technician
  const technicianBookings = await Booking.find({
    technician: booking.technician._id,
    status: { $in: ['pending', 'accepted', 'in_progress'] },
    _id: { $ne: bookingId }
  }).sort({ createdAt: 1 });

  // Calculate position
  const position = technicianBookings.length + 1;

  // Estimate wait time (assume 1 hour per booking on average)
  const estimatedWaitMinutes = position * 60;

  // Update booking's queue position
  booking.queuePosition = position;
  await booking.save();

  // Notify customer of queue position
  const io = getIO();
  io.to(booking.customer._id.toString()).emit('queue:position_update', {
    bookingId,
    position,
    estimatedWait: estimatedWaitMinutes,
    technicianName: `${booking.technician.firstName} ${booking.technician.lastName}`
  });

  return {
    bookingId,
    position,
    estimatedWait: estimatedWaitMinutes,
    technicianId: booking.technician._id
  };
}

/**
 * Get online technician count per category
 * @param {string} [category] - Optional category filter
 * @returns {Promise<Object>} Online count by category or for specific category
 */
async function getOnlineTechnicianCount(category = null) {
  const matchStage = {
    role: 'technician',
    status: 'active',
    'availability.status': AVAILABILITY_STATUS.ONLINE
  };

  if (category) {
    matchStage['skills.category'] = category;
  }

  const result = await User.aggregate([
    { $match: matchStage },
    {
      $unwind: {
        path: '$skills',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: category ? null : '$skills.category',
        count: { $sum: 1 }
      }
    }
  ]);

  if (category) {
    // Return count for specific category
    const count = result.length > 0 ? result[0].count : 0;

    // Broadcast to all users
    const io = getIO();
    io.emit('category:online_count', { category, count });

    return { category, count };
  } else {
    // Return counts by category
    const countsByCategory = {};
    result.forEach(item => {
      if (item._id) {
        countsByCategory[item._id] = item.count;
      }
    });

    // Broadcast each category count
    const io = getIO();
    Object.entries(countsByCategory).forEach(([cat, count]) => {
      io.emit('category:online_count', { category: cat, count });
    });

    return countsByCategory;
  }
}

/**
 * Set technician to away after inactivity
 * @param {number} inactivityMinutes - Minutes of inactivity before setting away
 * @returns {Promise<number>} Number of technicians set to away
 */
async function setInactiveTechniciansAway(inactivityMinutes = 5) {
  const threshold = new Date(Date.now() - inactivityMinutes * 60 * 1000);

  const result = await User.updateMany(
    {
      role: 'technician',
      status: 'active',
      'availability.status': AVAILABILITY_STATUS.ONLINE,
      'availability.lastSeen': { $lt: threshold }
    },
    {
      $set: {
        'availability.status': AVAILABILITY_STATUS.AWAY
      }
    }
  );

  // Notify affected technicians
  if (result.modifiedCount > 0) {
    const io = getIO();

    const affectedTechnicians = await User.find({
      role: 'technician',
      'availability.status': AVAILABILITY_STATUS.AWAY,
      'availability.lastSeen': { $lt: threshold }
    }).select('_id');

    affectedTechnicians.forEach(tech => {
      io.to(tech._id.toString()).emit('availability:auto_away', {
        message: `Status set to away after ${inactivityMinutes} minutes of inactivity`
      });
    });
  }

  return result.modifiedCount;
}

/**
 * Get technician's current availability status
 * @param {string} technicianId - Technician's user ID
 * @returns {Promise<Object>} Availability status data
 */
async function getTechnicianStatus(technicianId) {
  const technician = await User.findOne({
    _id: technicianId,
    role: 'technician'
  }).select('availability.firstName lastName');

  if (!technician) {
    throw new Error('Technician not found');
  }

  return {
    technicianId,
    status: technician.availability?.status || AVAILABILITY_STATUS.OFFLINE,
    lastSeen: technician.availability?.lastSeen || null,
    currentBookingId: technician.availability?.currentBookingId || null,
    queuePosition: technician.availability?.queuePosition || 0
  };
}

/**
 * Get all online technicians with their details
 * @param {string} [category] - Optional category filter
 * @returns {Promise<Array>} List of online technicians
 */
async function getOnlineTechnicians(category = null) {
  const query = {
    role: 'technician',
    status: 'active',
    'availability.status': { $in: [AVAILABILITY_STATUS.ONLINE, AVAILABILITY_STATUS.BUSY] }
  };

  if (category) {
    query['skills.category'] = category;
  }

  const technicians = await User.find(query)
    .select('firstName lastName profilePicture rating availability skills')
    .sort({ 'rating.average': -1 });

  return technicians.map(tech => ({
    technicianId: tech._id,
    name: `${tech.firstName} ${tech.lastName}`,
    profilePicture: tech.profilePicture,
    rating: tech.rating,
    status: tech.availability.status,
    skills: tech.skills
  }));
}

module.exports = {
  AVAILABILITY_STATUS,
  updateTechnicianStatus,
  updateStatusBasedOnBooking,
  calculateQueuePosition,
  getOnlineTechnicianCount,
  setInactiveTechniciansAway,
  getTechnicianStatus,
  getOnlineTechnicians
};
