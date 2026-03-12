/**
 * Escrow System Tests
 *
 * Tests for the platform escrow system including:
 * - Escrow creation
 * - Fee calculations
 * - Status transitions
 * - Funding workflow
 * - Release workflow
 * - Refund workflow
 * - Dispute handling
 *
 * CRITICAL: This is a business-critical domain requiring high coverage
 */

const mongoose = require('mongoose');
const Escrow = require('../src/models/Escrow');
const Booking = require('../src/models/Booking');
const User = require('../src/models/User');
const dbHandler = require('./utils/dbHandler');
const {
  calculatePlatformFee,
  calculateCancellationFee,
  getAutoReleaseDate,
  getAutoRefundDate,
  PLATFORM_FEE_PERCENTAGE,
  MINIMUM_FEE,
  MAXIMUM_FEE
} = require('../src/config/fees');

describe('Escrow System', () => {
  let customer;
  let technician;
  let admin;
  let testBooking;

  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  beforeEach(async () => {
    await dbHandler.clearDatabase();

    // Create test users (use random emails to avoid collisions with parallel test suites)
    customer = await dbHandler.createTestUser({
      role: 'customer'
    });

    technician = await dbHandler.createTestTechnician();

    admin = await dbHandler.createTestAdmin();

    // Create a test booking
    testBooking = await dbHandler.createTestBooking(customer._id, technician._id);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  // ============================================
  // FEE CALCULATION TESTS
  // ============================================
  describe('Fee Calculations', () => {
    test('should calculate platform fee correctly for standard amount', () => {
      const amount = 10000; // KES 10,000
      const result = calculatePlatformFee(amount);

      expect(result.originalAmount).toBe(10000);
      expect(result.feePercentage).toBe(PLATFORM_FEE_PERCENTAGE);
      expect(result.platformFee).toBe(750); // 7.5% of 10000
      expect(result.technicianPayout).toBeLessThan(amount);
    });

    test('should apply minimum fee for small amounts', () => {
      const amount = 100; // KES 100
      const result = calculatePlatformFee(amount);

      expect(result.platformFee).toBe(MINIMUM_FEE); // Minimum KES 50
    });

    test('should apply maximum fee cap for large amounts', () => {
      const amount = 1000000; // KES 1,000,000
      const result = calculatePlatformFee(amount);

      expect(result.platformFee).toBe(MAXIMUM_FEE); // Maximum KES 5,000
    });

    test('should calculate milestone fee with surcharge', () => {
      const amount = 10000;
      const result = calculatePlatformFee(amount, { isMilestone: true });

      expect(result.feePercentage).toBe(PLATFORM_FEE_PERCENTAGE + 1); // 8.5%
    });

    test('should throw error for invalid amount', () => {
      expect(() => calculatePlatformFee(-100)).toThrow('Invalid amount');
      expect(() => calculatePlatformFee('invalid')).toThrow('Invalid amount');
    });
  });

  // ============================================
  // CANCELLATION FEE TESTS
  // ============================================
  describe('Cancellation Fee Calculation', () => {
    test('should charge 0% fee when cancelled more than 24 hours before', () => {
      const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now
      const result = calculateCancellationFee(5000, futureDate);

      expect(result.feePercentage).toBe(0);
      expect(result.fee).toBe(0);
      expect(result.refundAmount).toBe(5000);
    });

    test('should charge 25% fee when cancelled between 6-24 hours before', () => {
      const nearDate = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now
      const result = calculateCancellationFee(5000, nearDate);

      expect(result.feePercentage).toBe(25);
      expect(result.fee).toBe(1250);
      expect(result.refundAmount).toBe(3750);
    });

    test('should charge 50% fee when cancelled between 2-6 hours before', () => {
      const nearDate = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours from now
      const result = calculateCancellationFee(5000, nearDate);

      expect(result.feePercentage).toBe(50);
      expect(result.fee).toBe(2500);
    });

    test('should charge 75% fee when cancelled less than 2 hours before', () => {
      const urgentDate = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour from now
      const result = calculateCancellationFee(5000, urgentDate);

      expect(result.feePercentage).toBe(75);
      expect(result.fee).toBe(3750);
    });
  });

  // ============================================
  // ESCROW CREATION TESTS
  // ============================================
  describe('Escrow Creation', () => {
    test('should create escrow with valid data', async () => {
      const escrow = await Escrow.create({
        booking: testBooking._id,
        customer: customer._id,
        technician: technician._id,
        totalAmount: 5000,
        platformFee: 375,
        tax: 60,
        technicianPayout: 4565
      });

      expect(escrow).toBeDefined();
      expect(escrow.status).toBe('pending');
      expect(escrow.totalAmount).toBe(5000);
      expect(escrow.currency).toBe('KES');
    });

    test('should set auto-release expiry date on creation', async () => {
      const escrow = await Escrow.create({
        booking: testBooking._id,
        customer: customer._id,
        technician: technician._id,
        totalAmount: 5000,
        platformFee: 375,
        tax: 60,
        technicianPayout: 4565
      });

      expect(escrow.expiresAt).toBeDefined();
      expect(new Date(escrow.expiresAt) > new Date()).toBe(true);
    });

    test('should not allow duplicate escrow for same booking', async () => {
      await Escrow.create({
        booking: testBooking._id,
        customer: customer._id,
        technician: technician._id,
        totalAmount: 5000,
        platformFee: 375,
        tax: 60,
        technicianPayout: 4565
      });

      await expect(Escrow.create({
        booking: testBooking._id,
        customer: customer._id,
        technician: technician._id,
        totalAmount: 6000,
        platformFee: 450,
        tax: 72,
        technicianPayout: 5478
      })).rejects.toThrow();
    });

    test('should require booking, customer, and technician', async () => {
      await expect(Escrow.create({
        totalAmount: 5000,
        platformFee: 375,
        technicianPayout: 4565
      })).rejects.toThrow();
    });
  });

  // ============================================
  // STATUS TRANSITION TESTS
  // ============================================
  describe('Escrow Status Transitions', () => {
    let testEscrow;

    beforeEach(async () => {
      testEscrow = await Escrow.create({
        booking: testBooking._id,
        customer: customer._id,
        technician: technician._id,
        totalAmount: 5000,
        platformFee: 375,
        tax: 60,
        technicianPayout: 4565
      });
    });

    test('should allow pending to funded transition', () => {
      expect(testEscrow.canTransitionTo('funded')).toBe(true);
    });

    test('should allow pending to cancelled transition', () => {
      expect(testEscrow.canTransitionTo('cancelled')).toBe(true);
    });

    test('should NOT allow pending to released transition', () => {
      expect(testEscrow.canTransitionTo('released')).toBe(false);
    });

    test('should allow funded to released transition', async () => {
      testEscrow.status = 'funded';
      await testEscrow.save();

      expect(testEscrow.canTransitionTo('released')).toBe(true);
    });

    test('should allow funded to refunded transition', async () => {
      testEscrow.status = 'funded';
      await testEscrow.save();

      expect(testEscrow.canTransitionTo('refunded')).toBe(true);
    });

    test('should allow funded to disputed transition', async () => {
      testEscrow.status = 'funded';
      await testEscrow.save();

      expect(testEscrow.canTransitionTo('disputed')).toBe(true);
    });

    test('should allow disputed to released transition', async () => {
      testEscrow.status = 'disputed';
      await testEscrow.save();

      expect(testEscrow.canTransitionTo('released')).toBe(true);
    });

    test('should allow disputed to refunded transition', async () => {
      testEscrow.status = 'disputed';
      await testEscrow.save();

      expect(testEscrow.canTransitionTo('refunded')).toBe(true);
    });

    test('should NOT allow released to any other status except disputed', async () => {
      testEscrow.status = 'released';
      await testEscrow.save();

      expect(testEscrow.canTransitionTo('pending')).toBe(false);
      expect(testEscrow.canTransitionTo('funded')).toBe(false);
      expect(testEscrow.canTransitionTo('refunded')).toBe(false);
      expect(testEscrow.canTransitionTo('disputed')).toBe(true);
    });
  });

  // ============================================
  // ESCROW VIRTUAL PROPERTIES TESTS
  // ============================================
  describe('Escrow Virtual Properties', () => {
    let testEscrow;

    beforeEach(async () => {
      testEscrow = await Escrow.create({
        booking: testBooking._id,
        customer: customer._id,
        technician: technician._id,
        totalAmount: 5000,
        platformFee: 375,
        tax: 60,
        technicianPayout: 4565
      });
    });

    test('should identify active escrow when funded', async () => {
      testEscrow.status = 'funded';
      await testEscrow.save();

      expect(testEscrow.isActive).toBe(true);
    });

    test('should identify active escrow when partial_release', async () => {
      testEscrow.status = 'partial_release';
      await testEscrow.save();

      expect(testEscrow.isActive).toBe(true);
    });

    test('should NOT identify pending escrow as active', () => {
      expect(testEscrow.isActive).toBe(false);
    });

    test('should identify completed escrow when released', async () => {
      testEscrow.status = 'released';
      await testEscrow.save();

      expect(testEscrow.isCompleted).toBe(true);
    });

    test('should identify completed escrow when refunded', async () => {
      testEscrow.status = 'refunded';
      await testEscrow.save();

      expect(testEscrow.isCompleted).toBe(true);
    });

    test('canRelease should be true for funded status', async () => {
      testEscrow.status = 'funded';
      await testEscrow.save();

      expect(testEscrow.canRelease).toBe(true);
    });

    test('canRefund should be true for pending status', () => {
      expect(testEscrow.canRefund).toBe(true);
    });

    test('canDispute should be true for released status', async () => {
      testEscrow.status = 'released';
      await testEscrow.save();

      expect(testEscrow.canDispute).toBe(true);
    });
  });

  // ============================================
  // MILESTONE TESTS
  // ============================================
  describe('Escrow Milestones', () => {
    let testEscrow;

    beforeEach(async () => {
      testEscrow = await Escrow.create({
        booking: testBooking._id,
        customer: customer._id,
        technician: technician._id,
        totalAmount: 10000,
        platformFee: 750,
        tax: 120,
        technicianPayout: 9130,
        milestones: [
          { name: 'Initial Assessment', amount: 2000, status: 'pending' },
          { name: 'Repair Work', amount: 5000, status: 'pending' },
          { name: 'Final Inspection', amount: 3000, status: 'pending' }
        ]
      });
    });

    test('should create escrow with milestones', () => {
      expect(testEscrow.milestones).toHaveLength(3);
      expect(testEscrow.milestones[0].name).toBe('Initial Assessment');
    });

    test('should get milestone by index', () => {
      const milestone = testEscrow.getMilestone(0);
      expect(milestone.name).toBe('Initial Assessment');
      expect(milestone.amount).toBe(2000);
    });

    test('should return null for invalid milestone index', () => {
      const milestone = testEscrow.getMilestone(10);
      expect(milestone).toBeNull();
    });

    test('should calculate pending milestone total', () => {
      const pendingTotal = testEscrow.getPendingMilestoneTotal();
      expect(pendingTotal).toBe(10000);
    });

    test('should calculate released milestone total', async () => {
      testEscrow.milestones[0].status = 'released';
      await testEscrow.save();

      const releasedTotal = testEscrow.getReleasedMilestoneTotal();
      expect(releasedTotal).toBe(2000);
    });
  });

  // ============================================
  // HISTORY TRACKING TESTS
  // ============================================
  describe('Escrow History', () => {
    let testEscrow;

    beforeEach(async () => {
      testEscrow = await Escrow.create({
        booking: testBooking._id,
        customer: customer._id,
        technician: technician._id,
        totalAmount: 5000,
        platformFee: 375,
        tax: 60,
        technicianPayout: 4565
      });
    });

    test('should add history entry', () => {
      testEscrow.addHistory({
        action: 'test_action',
        performedBy: customer._id,
        fromStatus: 'pending',
        toStatus: 'funded',
        notes: 'Test note'
      });

      expect(testEscrow.history).toHaveLength(1);
      expect(testEscrow.history[0].action).toBe('test_action');
    });

    test('should track multiple history entries', () => {
      testEscrow.addHistory({
        action: 'action_1',
        performedBy: customer._id,
        toStatus: 'funded'
      });

      testEscrow.addHistory({
        action: 'action_2',
        performedBy: admin._id,
        toStatus: 'released'
      });

      expect(testEscrow.history).toHaveLength(2);
    });
  });

  // ============================================
  // EXPIRY TESTS
  // ============================================
  describe('Escrow Expiry', () => {
    test('should detect expired escrow', async () => {
      const expiredEscrow = await Escrow.create({
        booking: testBooking._id,
        customer: customer._id,
        technician: technician._id,
        totalAmount: 5000,
        platformFee: 375,
        tax: 60,
        technicianPayout: 4565,
        expiresAt: new Date(Date.now() - 1000) // 1 second ago
      });

      expect(expiredEscrow.isExpired()).toBe(true);
    });

    test('should detect non-expired escrow', async () => {
      const activeEscrow = await Escrow.create({
        booking: testBooking._id,
        customer: customer._id,
        technician: technician._id,
        totalAmount: 5000,
        platformFee: 375,
        tax: 60,
        technicianPayout: 4565,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      });

      expect(activeEscrow.isExpired()).toBe(false);
    });

    test('should calculate time until expiry', async () => {
      const escrow = await Escrow.create({
        booking: testBooking._id,
        customer: customer._id,
        technician: technician._id,
        totalAmount: 5000,
        platformFee: 375,
        tax: 60,
        technicianPayout: 4565,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      const timeRemaining = escrow.timeUntilExpiry();
      expect(timeRemaining).toBeGreaterThan(0);
      expect(timeRemaining).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
    });
  });

  // ============================================
  // STATIC METHOD TESTS
  // ============================================
  describe('Escrow Static Methods', () => {
    beforeEach(async () => {
      // Create multiple escrows
      await Escrow.create({
        booking: testBooking._id,
        customer: customer._id,
        technician: technician._id,
        totalAmount: 5000,
        platformFee: 375,
        tax: 60,
        technicianPayout: 4565,
        status: 'funded'
      });

      const booking2 = await dbHandler.createTestBooking(customer._id, technician._id);
      await Escrow.create({
        booking: booking2._id,
        customer: customer._id,
        technician: technician._id,
        totalAmount: 10000,
        platformFee: 750,
        tax: 120,
        technicianPayout: 9130,
        status: 'released'
      });
    });

    test('should find escrow by booking ID', async () => {
      const escrow = await Escrow.findByBooking(testBooking._id);
      expect(escrow).toBeDefined();
      expect(escrow.totalAmount).toBe(5000);
    });

    test('should find active escrows by technician', async () => {
      const escrows = await Escrow.findActiveByTechnician(technician._id);
      expect(escrows).toHaveLength(1);
      expect(escrows[0].status).toBe('funded');
    });

    test('should get escrow statistics', async () => {
      const stats = await Escrow.getStats();
      expect(stats.totals.totalCount).toBe(2);
      expect(stats.byStatus).toHaveLength(2); // funded and released
    });
  });
});
