/**
 * Database Handler for Testing
 *
 * Provides utilities for:
 * - Connecting to test database
 * - Disconnecting from test database
 * - Clearing database collections
 * - Creating test data fixtures
 */

const mongoose = require('mongoose');

// Test database URI
const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/dumuwaks_test';

/**
 * Connect to test database
 */
const connect = async () => {
  try {
    // Close any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Connect to test database
    await mongoose.connect(TEST_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('[DB] Connected to test database');
  } catch (error) {
    console.error('[DB] Connection error:', error.message);
    throw error;
  }
};

/**
 * Disconnect from test database
 */
const disconnect = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('[DB] Disconnected from test database');
    }
  } catch (error) {
    console.error('[DB] Disconnection error:', error.message);
    throw error;
  }
};

/**
 * Clear all collections in the database
 */
const clearDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connect();
    }

    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }

    console.log('[DB] All collections cleared');
  } catch (error) {
    console.error('[DB] Clear database error:', error.message);
    throw error;
  }
};

/**
 * Clear specific collections
 */
const clearCollections = async (collectionNames) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connect();
    }

    for (const name of collectionNames) {
      if (mongoose.connection.collections[name]) {
        await mongoose.connection.collections[name].deleteMany({});
      }
    }
  } catch (error) {
    console.error('[DB] Clear collections error:', error.message);
    throw error;
  }
};

/**
 * Close database connection and cleanup
 */
const closeDatabase = async () => {
  try {
    await clearDatabase();
    await disconnect();
  } catch (error) {
    console.error('[DB] Close database error:', error.message);
    throw error;
  }
};

/**
 * Create a test user
 */
const createTestUser = async (overrides = {}) => {
  const User = require('../../src/models/User');

  const defaultUser = {
    firstName: 'Test',
    lastName: 'User',
    email: global.randomEmail(),
    phoneNumber: global.randomPhone(),
    password: 'TestPassword123!',
    role: 'customer',
    status: 'active',
    isEmailVerified: true,
    ...overrides
  };

  const user = await User.create(defaultUser);
  return user;
};

/**
 * Create a test technician
 */
const createTestTechnician = async (overrides = {}) => {
  const User = require('../../src/models/User');

  const defaultTechnician = {
    firstName: 'Tech',
    lastName: 'Nician',
    email: global.randomEmail(),
    phoneNumber: global.randomPhone(),
    password: 'TechPassword123!',
    role: 'technician',
    status: 'active',
    isEmailVerified: true,
    skills: [{
      name: 'Plumbing',
      category: 'plumbing',
      yearsOfExperience: 5,
      verified: true
    }],
    hourlyRate: 1500,
    location: {
      type: 'Point',
      coordinates: [36.8219, -1.2921], // Nairobi
      address: 'Nairobi, Kenya'
    },
    availability: {
      isAvailable: true,
      schedule: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', isAvailable: true }
      ]
    },
    ...overrides
  };

  const technician = await User.create(defaultTechnician);
  return technician;
};

/**
 * Create a test admin
 */
const createTestAdmin = async (overrides = {}) => {
  const User = require('../../src/models/User');

  const defaultAdmin = {
    firstName: 'Admin',
    lastName: 'User',
    email: global.randomEmail(),
    phoneNumber: global.randomPhone(),
    password: 'AdminPassword123!',
    role: 'admin',
    status: 'active',
    isEmailVerified: true,
    ...overrides
  };

  const admin = await User.create(defaultAdmin);
  return admin;
};

/**
 * Create a test booking
 */
const createTestBooking = async (customerId, technicianId, overrides = {}) => {
  const Booking = require('../../src/models/Booking');

  const defaultBooking = {
    customer: customerId,
    technician: technicianId,
    serviceCategory: 'plumbing',
    serviceType: 'Pipe Repair',
    description: 'Test booking for pipe repair service',
    urgency: 'medium',
    serviceLocation: {
      type: 'Point',
      coordinates: [36.8219, -1.2921],
      address: '123 Test Street, Nairobi, Kenya'
    },
    timeSlot: {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      startTime: '09:00',
      endTime: '11:00',
      estimatedDuration: 120
    },
    pricing: {
      basePrice: 2000,
      serviceCharge: 500,
      platformFee: 250,
      tax: 330,
      totalAmount: 3080,
      currency: 'KES'
    },
    status: 'pending',
    ...overrides
  };

  const booking = await Booking.create(defaultBooking);
  return booking;
};

/**
 * Generate auth token for testing
 */
const generateTestToken = (userId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1h'
  });
};

module.exports = {
  connect,
  disconnect,
  clearDatabase,
  clearCollections,
  closeDatabase,
  createTestUser,
  createTestTechnician,
  createTestAdmin,
  createTestBooking,
  generateTestToken
};
