/**
 * Booking Controller Tests
 *
 * Tests for booking management including:
 * - Booking creation
 * - Status transitions (FSM)
 * - Pricing calculations
 * - Cancellation logic
 * - Matching workflow
 *
 * CRITICAL: This is a business-critical domain requiring high coverage
 */

const mongoose = require('mongoose');
const Booking = require('../src/models/Booking');
const User = require('../src/models/User');
const dbHandler = require('./utils/dbHandler');

describe('Booking Controller', () => {
  let customer;
  let technician;
  let testBooking;

  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  beforeEach(async () => {
    await dbHandler.clearDatabase();

    // Create test users
    customer = await dbHandler.createTestUser({
      email: 'customer@example.com',
      role: 'customer'
    });

    technician = await dbHandler.createTestTechnician({
      email: 'technician@example.com'
    });

    // Create a test booking
    testBooking = await dbHandler.createTestBooking(customer._id, technician._id);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  // ============================================
  // BOOKING CREATION TESTS
  // ============================================
  describe('Booking Creation', () => {
    it('should create a booking with valid data', async () => {
      expect(testBooking).toBeDefined();
      expect(testBooking.customer.toString()).toBe(customer._id.toString());
      expect(testBooking.technician.toString()).toBe(technician._id.toString());
      expect(testBooking.serviceCategory).toBe('plumbing');
      expect(testBooking.status).toBe('pending');
    });

    it('should generate a unique booking number', async () => {
      expect(testBooking.bookingNumber).toBeDefined();
      expect(testBooking.bookingNumber).toMatch(/^BK\d{10}$/);
    });

    it('should set default urgency to medium', async () => {
      const booking = await dbHandler.createTestBooking(customer._id, technician._id, {
        urgency: undefined
      });
      expect(booking.urgency).toBe('medium');
    });

    it('should set default currency to KES', async () => {
      expect(testBooking.pricing.currency).toBe('KES');
    });

    it('should require service location', async () => {
      await expect(Booking.create({
        customer: customer._id,
        serviceCategory: 'plumbing',
        serviceType: 'Test',
        description: 'Test',
        timeSlot: {
          date: new Date(),
          startTime: '09:00',
          endTime: '11:00'
        },
        pricing: { totalAmount: 1000 }
      })).rejects.toThrow();
    });

    it('should require time slot', async () => {
      await expect(Booking.create({
        customer: customer._id,
        serviceCategory: 'plumbing',
        serviceType: 'Test',
        description: 'Test',
        serviceLocation: {
          type: 'Point',
          coordinates: [36.8219, -1.2921],
          address: 'Test Address'
        },
        pricing: { totalAmount: 1000 }
      })).rejects.toThrow();
    });

    it('should accept all valid service categories', async () => {
      const categories = ['plumbing', 'electrical', 'carpentry', 'masonry', 'painting', 'hvac', 'welding', 'other'];

      for (const category of categories) {
        const booking = await dbHandler.createTestBooking(customer._id, technician._id, {
          serviceCategory: category
        });
        expect(booking.serviceCategory).toBe(category);
      }
    });

    it('should reject invalid service category', async () => {
      await expect(dbHandler.createTestBooking(customer._id, technician._id, {
        serviceCategory: 'invalid_category'
      })).rejects.toThrow();
    });

    it('should store images array', async () => {
      const bookingWithImages = await dbHandler.createTestBooking(customer._id, technician._id, {
        images: [
          { url: 'https://example.com/image1.jpg', caption: 'Problem area' }
        ]
      });

      expect(bookingWithImages.images).toHaveLength(1);
      expect(bookingWithImages.images[0].url).toBe('https://example.com/image1.jpg');
    });
  });

  // ============================================
  // STATUS TRANSITION TESTS (FSM)
  // ============================================
  describe('Booking Status Transitions', () => {
    describe('Valid Status Transitions', () => {
      it('should allow pending to matching transition', async () => {
        await testBooking.transitionTo('matching', customer._id);
        expect(testBooking.status).toBe('matching');
      });

      it('should allow pending to cancelled transition', async () => {
        await testBooking.transitionTo('cancelled', customer._id);
        expect(testBooking.status).toBe('cancelled');
      });

      it('should allow matching to assigned transition', async () => {
        await testBooking.transitionTo('matching', customer._id);
        await testBooking.transitionTo('assigned', customer._id);
        expect(testBooking.status).toBe('assigned');
      });

      it('should allow assigned to accepted transition', async () => {
        await testBooking.transitionTo('matching', customer._id);
        await testBooking.transitionTo('assigned', customer._id);
        await testBooking.transitionTo('accepted', technician._id);
        expect(testBooking.status).toBe('accepted');
      });

      it('should allow assigned to rejected transition', async () => {
        await testBooking.transitionTo('matching', customer._id);
        await testBooking.transitionTo('assigned', customer._id);
        await testBooking.transitionTo('rejected', technician._id);
        expect(testBooking.status).toBe('rejected');
      });

      it('should allow accepted to en_route transition', async () => {
        await testBooking.transitionTo('matching', customer._id);
        await testBooking.transitionTo('assigned', customer._id);
        await testBooking.transitionTo('accepted', technician._id);
        await testBooking.transitionTo('en_route', technician._id);
        expect(testBooking.status).toBe('en_route');
      });

      it('should allow en_route to arrived transition', async () => {
        await testBooking.transitionTo('matching', customer._id);
        await testBooking.transitionTo('assigned', customer._id);
        await testBooking.transitionTo('accepted', technician._id);
        await testBooking.transitionTo('en_route', technician._id);
        await testBooking.transitionTo('arrived', technician._id);
        expect(testBooking.status).toBe('arrived');
      });

      it('should allow arrived to in_progress transition', async () => {
        await testBooking.transitionTo('matching', customer._id);
        await testBooking.transitionTo('assigned', customer._id);
        await testBooking.transitionTo('accepted', technician._id);
        await testBooking.transitionTo('en_route', technician._id);
        await testBooking.transitionTo('arrived', technician._id);
        await testBooking.transitionTo('in_progress', technician._id);
        expect(testBooking.status).toBe('in_progress');
      });

      it('should allow in_progress to completed transition', async () => {
        await testBooking.transitionTo('matching', customer._id);
        await testBooking.transitionTo('assigned', customer._id);
        await testBooking.transitionTo('accepted', technician._id);
        await testBooking.transitionTo('en_route', technician._id);
        await testBooking.transitionTo('arrived', technician._id);
        await testBooking.transitionTo('in_progress', technician._id);
        await testBooking.transitionTo('completed', technician._id);
        expect(testBooking.status).toBe('completed');
      });
    });

    describe('Invalid Status Transitions', () => {
      it('should reject pending to completed transition', async () => {
        await expect(testBooking.transitionTo('completed', customer._id))
          .rejects.toThrow('Invalid status transition');
      });

      it('should reject pending to in_progress transition', async () => {
        await expect(testBooking.transitionTo('in_progress', customer._id))
          .rejects.toThrow('Invalid status transition');
      });

      it('should reject completed to pending transition', async () => {
        await testBooking.transitionTo('matching', customer._id);
        await testBooking.transitionTo('assigned', customer._id);
        await testBooking.transitionTo('accepted', technician._id);
        await testBooking.transitionTo('en_route', technician._id);
        await testBooking.transitionTo('arrived', technician._id);
        await testBooking.transitionTo('in_progress', technician._id);
        await testBooking.transitionTo('completed', technician._id);

        await expect(testBooking.transitionTo('pending', customer._id))
          .rejects.toThrow('Invalid status transition');
      });

      it('should reject cancelled to any status transition', async () => {
        await testBooking.transitionTo('cancelled', customer._id);

        await expect(testBooking.transitionTo('pending', customer._id))
          .rejects.toThrow('Invalid status transition');
      });
    });

    describe('Status History', () => {
      it('should record status change in history', async () => {
        await testBooking.transitionTo('matching', customer._id, 'Starting matching');

        expect(testBooking.statusHistory).toHaveLength(1);
        expect(testBooking.statusHistory[0].status).toBe('matching');
        expect(testBooking.statusHistory[0].changedBy.toString()).toBe(customer._id.toString());
      });

      it('should record multiple status changes', async () => {
        await testBooking.transitionTo('matching', customer._id);
        await testBooking.transitionTo('assigned', customer._id);
        await testBooking.transitionTo('accepted', technician._id);

        expect(testBooking.statusHistory).toHaveLength(3);
      });
    });

    describe('Timestamp Updates', () => {
      it('should set actualStartTime when en_route', async () => {
        await testBooking.transitionTo('matching', customer._id);
        await testBooking.transitionTo('assigned', customer._id);
        await testBooking.transitionTo('accepted', technician._id);
        await testBooking.transitionTo('en_route', technician._id);

        expect(testBooking.actualStartTime).toBeDefined();
      });

      it('should set actualEndTime when completed', async () => {
        await testBooking.transitionTo('matching', customer._id);
        await testBooking.transitionTo('assigned', customer._id);
        await testBooking.transitionTo('accepted', technician._id);
        await testBooking.transitionTo('en_route', technician._id);
        await testBooking.transitionTo('arrived', technician._id);
        await testBooking.transitionTo('in_progress', technician._id);
        await testBooking.transitionTo('completed', technician._id);

        expect(testBooking.actualEndTime).toBeDefined();
      });

      it('should calculate actualDuration when both timestamps set', async () => {
        await testBooking.transitionTo('matching', customer._id);
        await testBooking.transitionTo('assigned', customer._id);
        await testBooking.transitionTo('accepted', technician._id);
        await testBooking.transitionTo('en_route', technician._id);
        await testBooking.transitionTo('arrived', technician._id);
        await testBooking.transitionTo('in_progress', technician._id);
        await testBooking.transitionTo('completed', technician._id);

        expect(testBooking.actualDuration).toBeDefined();
        expect(testBooking.actualDuration).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // ============================================
  // CANCELLATION TESTS
  // ============================================
  describe('Booking Cancellation', () => {
    it('should be cancellable when pending', () => {
      expect(testBooking.canBeCancelled()).toBe(true);
    });

    it('should be cancellable when matching', async () => {
      await testBooking.transitionTo('matching', customer._id);
      expect(testBooking.canBeCancelled()).toBe(true);
    });

    it('should be cancellable when assigned', async () => {
      await testBooking.transitionTo('matching', customer._id);
      await testBooking.transitionTo('assigned', customer._id);
      expect(testBooking.canBeCancelled()).toBe(true);
    });

    it('should be cancellable when accepted', async () => {
      await testBooking.transitionTo('matching', customer._id);
      await testBooking.transitionTo('assigned', customer._id);
      await testBooking.transitionTo('accepted', technician._id);
      expect(testBooking.canBeCancelled()).toBe(true);
    });

    it('should NOT be cancellable when in_progress', async () => {
      await testBooking.transitionTo('matching', customer._id);
      await testBooking.transitionTo('assigned', customer._id);
      await testBooking.transitionTo('accepted', technician._id);
      await testBooking.transitionTo('en_route', technician._id);
      await testBooking.transitionTo('arrived', technician._id);
      await testBooking.transitionTo('in_progress', technician._id);
      expect(testBooking.canBeCancelled()).toBe(false);
    });

    it('should NOT be cancellable when completed', async () => {
      await testBooking.transitionTo('matching', customer._id);
      await testBooking.transitionTo('assigned', customer._id);
      await testBooking.transitionTo('accepted', technician._id);
      await testBooking.transitionTo('en_route', technician._id);
      await testBooking.transitionTo('arrived', technician._id);
      await testBooking.transitionTo('in_progress', technician._id);
      await testBooking.transitionTo('completed', technician._id);
      expect(testBooking.canBeCancelled()).toBe(false);
    });

    it('should record cancellation details', async () => {
      await testBooking.transitionTo('cancelled', customer._id, 'Customer requested cancellation');

      expect(testBooking.cancellation.cancelledBy.toString()).toBe(customer._id.toString());
      expect(testBooking.cancellation.reason).toBe('Customer requested cancellation');
      expect(testBooking.cancellation.cancelledAt).toBeDefined();
    });
  });

  // ============================================
  // CANCELLATION FEE TESTS
  // ============================================
  describe('Cancellation Fee Calculation', () => {
    it('should charge 0% fee when cancelled more than 24 hours before', async () => {
      const futureBooking = await dbHandler.createTestBooking(customer._id, technician._id, {
        timeSlot: {
          date: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
          startTime: '09:00',
          endTime: '11:00'
        },
        pricing: { totalAmount: 5000 }
      });

      const fee = futureBooking.calculateCancellationFee();
      expect(fee).toBe(0);
    });

    it('should charge 25% fee when cancelled between 6-24 hours before', async () => {
      const nearBooking = await dbHandler.createTestBooking(customer._id, technician._id, {
        timeSlot: {
          date: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
          startTime: '09:00',
          endTime: '11:00'
        },
        pricing: { totalAmount: 5000 }
      });

      const fee = nearBooking.calculateCancellationFee();
      expect(fee).toBe(1250); // 25% of 5000
    });

    it('should charge 50% fee when cancelled between 2-6 hours before', async () => {
      const nearBooking = await dbHandler.createTestBooking(customer._id, technician._id, {
        timeSlot: {
          date: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
          startTime: '09:00',
          endTime: '11:00'
        },
        pricing: { totalAmount: 5000 }
      });

      const fee = nearBooking.calculateCancellationFee();
      expect(fee).toBe(2500); // 50% of 5000
    });

    it('should charge 75% fee when cancelled less than 2 hours before', async () => {
      const urgentBooking = await dbHandler.createTestBooking(customer._id, technician._id, {
        timeSlot: {
          date: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
          startTime: '09:00',
          endTime: '11:00'
        },
        pricing: { totalAmount: 5000 }
      });

      const fee = urgentBooking.calculateCancellationFee();
      expect(fee).toBe(3750); // 75% of 5000
    });
  });

  // ============================================
  // DISPUTE TESTS
  // ============================================
  describe('Booking Disputes', () => {
    it('should be disputable when completed', async () => {
      await testBooking.transitionTo('matching', customer._id);
      await testBooking.transitionTo('assigned', customer._id);
      await testBooking.transitionTo('accepted', technician._id);
      await testBooking.transitionTo('en_route', technician._id);
      await testBooking.transitionTo('arrived', technician._id);
      await testBooking.transitionTo('in_progress', technician._id);
      await testBooking.transitionTo('completed', technician._id);

      expect(testBooking.canBeDisputed()).toBe(true);
    });

    it('should be disputable when verified', async () => {
      await testBooking.transitionTo('matching', customer._id);
      await testBooking.transitionTo('assigned', customer._id);
      await testBooking.transitionTo('accepted', technician._id);
      await testBooking.transitionTo('en_route', technician._id);
      await testBooking.transitionTo('arrived', technician._id);
      await testBooking.transitionTo('in_progress', technician._id);
      await testBooking.transitionTo('completed', technician._id);
      await testBooking.transitionTo('verified', customer._id);

      expect(testBooking.canBeDisputed()).toBe(true);
    });

    it('should be disputable when paid', async () => {
      await testBooking.transitionTo('matching', customer._id);
      await testBooking.transitionTo('assigned', customer._id);
      await testBooking.transitionTo('accepted', technician._id);
      await testBooking.transitionTo('en_route', technician._id);
      await testBooking.transitionTo('arrived', technician._id);
      await testBooking.transitionTo('in_progress', technician._id);
      await testBooking.transitionTo('completed', technician._id);
      await testBooking.transitionTo('verified', customer._id);
      await testBooking.transitionTo('payment_pending', customer._id);
      await testBooking.transitionTo('paid', customer._id);

      expect(testBooking.canBeDisputed()).toBe(true);
    });

    it('should NOT be disputable when pending', () => {
      expect(testBooking.canBeDisputed()).toBe(false);
    });
  });

  // ============================================
  // PAYMENT STATUS TESTS
  // ============================================
  describe('Payment Status', () => {
    it('should identify payment due when status is payment_pending', async () => {
      await testBooking.transitionTo('matching', customer._id);
      await testBooking.transitionTo('assigned', customer._id);
      await testBooking.transitionTo('accepted', technician._id);
      await testBooking.transitionTo('en_route', technician._id);
      await testBooking.transitionTo('arrived', technician._id);
      await testBooking.transitionTo('in_progress', technician._id);
      await testBooking.transitionTo('completed', technician._id);
      await testBooking.transitionTo('verified', customer._id);
      await testBooking.transitionTo('payment_pending', customer._id);

      expect(testBooking.isPaymentDue()).toBe(true);
    });

    it('should NOT identify payment due when already paid', async () => {
      testBooking.payment.status = 'completed';
      await testBooking.save();

      expect(testBooking.isPaymentDue()).toBe(false);
    });
  });

  // ============================================
  // VIRTUAL PROPERTY TESTS
  // ============================================
  describe('Virtual Properties', () => {
    it('should correctly identify upcoming bookings', async () => {
      expect(testBooking.isUpcoming).toBe(true);
    });

    it('should correctly identify NOT upcoming for completed booking', async () => {
      await testBooking.transitionTo('matching', customer._id);
      await testBooking.transitionTo('assigned', customer._id);
      await testBooking.transitionTo('accepted', technician._id);
      await testBooking.transitionTo('en_route', technician._id);
      await testBooking.transitionTo('arrived', technician._id);
      await testBooking.transitionTo('in_progress', technician._id);
      await testBooking.transitionTo('completed', technician._id);

      expect(testBooking.isUpcoming).toBe(false);
    });

    it('should correctly identify active bookings', async () => {
      await testBooking.transitionTo('matching', customer._id);
      await testBooking.transitionTo('assigned', customer._id);
      await testBooking.transitionTo('accepted', technician._id);
      await testBooking.transitionTo('en_route', technician._id);
      await testBooking.transitionTo('arrived', technician._id);
      await testBooking.transitionTo('in_progress', technician._id);

      expect(testBooking.isActive).toBe(true);
    });

    it('should correctly identify NOT active for pending booking', () => {
      expect(testBooking.isActive).toBe(false);
    });
  });

  // ============================================
  // STATIC METHOD TESTS
  // ============================================
  describe('Static Methods', () => {
    it('should find bookings by status', async () => {
      const pendingBookings = await Booking.findByStatus('pending');
      expect(pendingBookings).toHaveLength(1);
      expect(pendingBookings[0]._id.toString()).toBe(testBooking._id.toString());
    });

    it('should find upcoming bookings for customer', async () => {
      const upcomingBookings = await Booking.findUpcomingBookings(customer._id, 'customer');
      expect(upcomingBookings).toHaveLength(1);
    });

    it('should find upcoming bookings for technician', async () => {
      const upcomingBookings = await Booking.findUpcomingBookings(technician._id, 'technician');
      expect(upcomingBookings).toHaveLength(1);
    });

    it('should find bookings near location', async () => {
      const nearbyBookings = await Booking.findNearLocation(36.8219, -1.2921, 10000);
      expect(nearbyBookings.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================
  // BOOKING FEE TESTS
  // ============================================
  describe('Booking Fee', () => {
    it('should have default booking fee configuration', () => {
      expect(testBooking.bookingFee.required).toBe(true);
      expect(testBooking.bookingFee.percentage).toBe(20);
    });

    it('should default to pending status', () => {
      expect(testBooking.bookingFee.status).toBe('pending');
    });

    it('should default escrowReleaseCondition to job_verified', () => {
      expect(testBooking.bookingFee.escrowReleaseCondition).toBe('job_verified');
    });
  });

  // ============================================
  // COUNTER OFFER TESTS
  // ============================================
  describe('Counter Offers', () => {
    it('should allow technician to propose counter offer', async () => {
      testBooking.counterOffer = {
        proposedBy: technician._id,
        proposedAt: new Date(),
        status: 'pending',
        proposedPricing: {
          basePrice: 2500,
          serviceCharge: 600,
          totalAmount: 3500
        },
        reason: 'Additional materials required',
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      await testBooking.save();
      expect(testBooking.counterOffer.status).toBe('pending');
    });
  });

  // ============================================
  // WARRANTY TESTS
  // ============================================
  describe('Warranty', () => {
    it('should default to no warranty', () => {
      expect(testBooking.warranty.offered).toBe(false);
    });

    it('should allow setting warranty', async () => {
      testBooking.warranty = {
        offered: true,
        duration: 30,
        terms: '30-day warranty on parts and labor',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      await testBooking.save();
      expect(testBooking.warranty.offered).toBe(true);
      expect(testBooking.warranty.duration).toBe(30);
    });
  });
});
