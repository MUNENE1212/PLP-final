/**
 * Escrow Service Tests (Issue #32)
 *
 * Tests the escrow service layer (backend/src/services/escrow.service.js):
 * - Lifecycle: create → fund → release/refund
 * - Auto-release: processAutoReleases() with dispute/disabled guards
 * - Disputes: open + resolve with split/customer/technician resolutions
 * - Milestones: partial release + all-released transition
 * - Authorization: who can release, refund, etc.
 * - Edge cases: double-release, release after refund, etc.
 *
 * All tests mock MongoDB models (no database connection needed).
 */

process.env.NODE_ENV = 'test';

jest.mock('../src/models/Escrow');
jest.mock('../src/models/Booking');
jest.mock('../src/models/User');

const Escrow = require('../src/models/Escrow');
const Booking = require('../src/models/Booking');
const User = require('../src/models/User');
const escrowService = require('../src/services/escrow.service');
const { PLATFORM_FEE_PERCENTAGE, AUTO_RELEASE_DAYS, DISPUTE_HOLD_DAYS } = require('../src/config/fees');

// Helper: create a mock escrow document
const createMockEscrow = (overrides = {}) => {
  const escrow = {
    _id: 'escrow-id-123',
    booking: 'booking-id-123',
    customer: 'customer-id-123',
    technician: 'tech-id-123',
    totalAmount: 5000,
    platformFee: 375,
    tax: 60,
    technicianPayout: 4565,
    currency: 'KES',
    status: 'pending',
    milestones: [],
    history: [],
    autoReleaseEnabled: true,
    autoReleaseAfterDays: 3,
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    fundedAt: null,
    releasedAt: null,
    refundedAt: null,
    dispute: null,
    funding: null,
    payout: null,
    refund: null,
    remainingBalance: 5000,
    // Virtual properties
    get isActive() { return ['funded', 'partial_release'].includes(this.status); },
    get canRelease() { return this.status === 'funded' || this.status === 'partial_release'; },
    get canRefund() { return ['pending', 'funded', 'partial_release'].includes(this.status); },
    get canDispute() { return ['funded', 'partial_release', 'released'].includes(this.status); },
    addHistory: jest.fn(function(entry) {
      this.history.push({ ...entry, timestamp: new Date() });
    }),
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
  return escrow;
};

// Helper: create a mock booking
const createMockBooking = (overrides = {}) => ({
  _id: 'booking-id-123',
  bookingNumber: 'BK-2026-001',
  status: 'accepted',
  ...overrides,
});

// Helper: create a mock user
const createMockUser = (overrides = {}) => ({
  _id: 'user-id-123',
  role: 'customer',
  ...overrides,
});

describe('Escrow Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // CREATE ESCROW
  // ============================================
  describe('createEscrow', () => {
    it('should create escrow with correct fee breakdown', async () => {
      Escrow.findOne = jest.fn().mockResolvedValue(null); // No duplicate
      Booking.findById = jest.fn().mockResolvedValue(createMockBooking());

      const mockEscrow = createMockEscrow();
      Escrow.mockImplementation(() => mockEscrow);

      const result = await escrowService.createEscrow(
        'booking-id-123', 'customer-id-123', 'tech-id-123', 5000
      );

      expect(result).toBeDefined();
      expect(mockEscrow.save).toHaveBeenCalled();
      expect(mockEscrow.addHistory).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'escrow_created', toStatus: 'pending' })
      );
    });

    it('should reject duplicate escrow for same booking', async () => {
      Escrow.findOne = jest.fn().mockResolvedValue(createMockEscrow());

      await expect(
        escrowService.createEscrow('booking-id-123', 'cust-1', 'tech-1', 5000)
      ).rejects.toThrow('Escrow already exists for this booking');
    });

    it('should reject missing required IDs', async () => {
      await expect(
        escrowService.createEscrow(null, 'cust-1', 'tech-1', 5000)
      ).rejects.toThrow('required');
    });

    it('should reject invalid amount', async () => {
      await expect(
        escrowService.createEscrow('booking-1', 'cust-1', 'tech-1', -100)
      ).rejects.toThrow('positive number');
    });

    it('should reject zero amount', async () => {
      await expect(
        escrowService.createEscrow('booking-1', 'cust-1', 'tech-1', 0)
      ).rejects.toThrow('positive number');
    });

    it('should reject when booking not found', async () => {
      Escrow.findOne = jest.fn().mockResolvedValue(null);
      Booking.findById = jest.fn().mockResolvedValue(null);

      await expect(
        escrowService.createEscrow('booking-1', 'cust-1', 'tech-1', 5000)
      ).rejects.toThrow('Booking not found');
    });
  });

  // ============================================
  // FUND ESCROW
  // ============================================
  describe('fundEscrow', () => {
    it('should fund pending escrow and set status to funded', async () => {
      const mockEscrow = createMockEscrow({ status: 'pending' });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      const result = await escrowService.fundEscrow('escrow-id-123', 'MPESA-REF-001', {
        checkoutRequestID: 'checkout-123',
        phoneNumber: '254712345678',
      });

      expect(result.status).toBe('funded');
      expect(result.fundedAt).toBeInstanceOf(Date);
      expect(result.funding.mpesaReference).toBe('MPESA-REF-001');
      expect(result.funding.phoneNumber).toBe('254712345678');
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(mockEscrow.addHistory).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'escrow_funded', toStatus: 'funded' })
      );
      expect(mockEscrow.save).toHaveBeenCalled();
    });

    it('should reject funding non-pending escrow', async () => {
      const mockEscrow = createMockEscrow({ status: 'funded' });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      await expect(
        escrowService.fundEscrow('escrow-id-123', 'MPESA-REF-001')
      ).rejects.toThrow('Cannot fund escrow with status: funded');
    });

    it('should reject when escrow not found', async () => {
      Escrow.findById = jest.fn().mockResolvedValue(null);

      await expect(
        escrowService.fundEscrow('nonexistent', 'MPESA-REF-001')
      ).rejects.toThrow('Escrow not found');
    });
  });

  // ============================================
  // RELEASE ESCROW
  // ============================================
  describe('releaseEscrow', () => {
    it('should release funded escrow by authorized customer', async () => {
      const mockEscrow = createMockEscrow({
        status: 'funded',
        get canRelease() { return true; },
        booking: createMockBooking(),
      });
      Escrow.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockEscrow),
        }),
      });
      User.findById = jest.fn().mockResolvedValue(
        createMockUser({ _id: 'customer-id-123', role: 'customer' })
      );
      Booking.findByIdAndUpdate = jest.fn().mockResolvedValue(true);

      const result = await escrowService.releaseEscrow('escrow-id-123', 'customer-id-123');

      expect(result.status).toBe('released');
      expect(result.releasedAt).toBeInstanceOf(Date);
      expect(result.payout.amount).toBe(4565);
      expect(mockEscrow.save).toHaveBeenCalled();
    });

    it('should release escrow by admin', async () => {
      const mockEscrow = createMockEscrow({
        status: 'funded',
        get canRelease() { return true; },
        booking: createMockBooking(),
      });
      Escrow.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockEscrow),
        }),
      });
      User.findById = jest.fn().mockResolvedValue(
        createMockUser({ _id: 'admin-id-1', role: 'admin' })
      );
      Booking.findByIdAndUpdate = jest.fn().mockResolvedValue(true);

      const result = await escrowService.releaseEscrow('escrow-id-123', 'admin-id-1');
      expect(result.status).toBe('released');
    });

    it('should reject release by non-authorized user (technician)', async () => {
      const mockEscrow = createMockEscrow({
        status: 'funded',
        get canRelease() { return true; },
      });
      Escrow.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockEscrow),
        }),
      });
      User.findById = jest.fn().mockResolvedValue(
        createMockUser({ _id: 'tech-id-999', role: 'technician' })
      );

      await expect(
        escrowService.releaseEscrow('escrow-id-123', 'tech-id-999')
      ).rejects.toThrow('Not authorized to release escrow');
    });

    it('should reject release of non-funded escrow', async () => {
      const mockEscrow = createMockEscrow({
        status: 'pending',
        get canRelease() { return false; },
      });
      Escrow.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockEscrow),
        }),
      });

      await expect(
        escrowService.releaseEscrow('escrow-id-123', 'customer-id-123')
      ).rejects.toThrow('Escrow cannot be released');
    });
  });

  // ============================================
  // REFUND ESCROW
  // ============================================
  describe('refundEscrow', () => {
    it('should refund funded escrow with reason', async () => {
      const mockEscrow = createMockEscrow({
        status: 'funded',
        get canRefund() { return true; },
        milestones: [],
      });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      const result = await escrowService.refundEscrow(
        'escrow-id-123', 'Customer requested cancellation', null, 'admin-id-1'
      );

      expect(result.status).toBe('refunded');
      expect(result.refundedAt).toBeInstanceOf(Date);
      expect(result.refund.reason).toBe('Customer requested cancellation');
      expect(result.refund.amount).toBe(5000);
      expect(mockEscrow.save).toHaveBeenCalled();
    });

    it('should refund partial amount', async () => {
      const mockEscrow = createMockEscrow({
        status: 'funded',
        get canRefund() { return true; },
        milestones: [],
      });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      const result = await escrowService.refundEscrow(
        'escrow-id-123', 'Partial refund', 2000, 'admin-id-1'
      );

      expect(result.refund.amount).toBe(2000);
    });

    it('should reject refund exceeding total amount', async () => {
      const mockEscrow = createMockEscrow({
        status: 'funded',
        get canRefund() { return true; },
        milestones: [],
      });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      await expect(
        escrowService.refundEscrow('escrow-id-123', 'Too much', 10000, 'admin-1')
      ).rejects.toThrow('Refund amount exceeds escrow balance');
    });

    it('should reject refund of released escrow', async () => {
      const mockEscrow = createMockEscrow({
        status: 'released',
        get canRefund() { return false; },
      });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      await expect(
        escrowService.refundEscrow('escrow-id-123', 'Reason', null, 'admin-1')
      ).rejects.toThrow('Escrow cannot be refunded');
    });

    it('should mark pending milestones as refunded', async () => {
      const milestones = [
        { name: 'M1', amount: 2000, status: 'released' },
        { name: 'M2', amount: 3000, status: 'pending' },
      ];
      const mockEscrow = createMockEscrow({
        status: 'funded',
        get canRefund() { return true; },
        milestones,
      });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      await escrowService.refundEscrow('escrow-id-123', 'Reason', null, 'admin-1');

      expect(milestones[0].status).toBe('released'); // unchanged
      expect(milestones[1].status).toBe('refunded');
    });
  });

  // ============================================
  // OPEN DISPUTE
  // ============================================
  describe('openDispute', () => {
    it('should open dispute on funded escrow', async () => {
      const mockEscrow = createMockEscrow({
        status: 'funded',
        get canDispute() { return true; },
        dispute: null,
      });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);
      Booking.findByIdAndUpdate = jest.fn().mockResolvedValue(true);

      const result = await escrowService.openDispute(
        'escrow-id-123', 'Work not satisfactory', 'customer-id-123'
      );

      expect(result.status).toBe('disputed');
      expect(result.dispute.reason).toBe('Work not satisfactory');
      expect(result.dispute.openedBy).toBe('customer-id-123');
      expect(result.expiresAt).toBeInstanceOf(Date);
      // Expiry should be extended to ~7 days from now
      const daysUntilExpiry = (result.expiresAt - new Date()) / (1000 * 60 * 60 * 24);
      expect(daysUntilExpiry).toBeCloseTo(DISPUTE_HOLD_DAYS, 0);
    });

    it('should reject dispute on pending escrow', async () => {
      const mockEscrow = createMockEscrow({
        status: 'pending',
        get canDispute() { return false; },
      });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      await expect(
        escrowService.openDispute('escrow-id-123', 'Reason', 'cust-1')
      ).rejects.toThrow('cannot be disputed');
    });

    it('should reject duplicate dispute', async () => {
      const mockEscrow = createMockEscrow({
        status: 'funded',
        get canDispute() { return true; },
        dispute: { openedAt: new Date(), reason: 'Existing' },
      });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      await expect(
        escrowService.openDispute('escrow-id-123', 'New reason', 'cust-1')
      ).rejects.toThrow('Dispute already opened');
    });
  });

  // ============================================
  // RESOLVE DISPUTE
  // ============================================
  describe('resolveDispute', () => {
    it('should resolve dispute in customer favor (refund)', async () => {
      const mockEscrow = createMockEscrow({
        status: 'disputed',
        dispute: { openedAt: new Date(), reason: 'Bad work' },
      });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);
      Booking.findByIdAndUpdate = jest.fn().mockResolvedValue(true);

      const result = await escrowService.resolveDispute(
        'escrow-id-123', 'customer_favor', null, 'admin-id-1', 'Full refund'
      );

      expect(result.status).toBe('refunded');
      expect(result.dispute.resolution).toBe('customer_favor');
      expect(result.refund).toBeDefined();
    });

    it('should resolve dispute in technician favor (release)', async () => {
      const mockEscrow = createMockEscrow({
        status: 'disputed',
        dispute: { openedAt: new Date(), reason: 'Dispute' },
      });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);
      Booking.findByIdAndUpdate = jest.fn().mockResolvedValue(true);

      const result = await escrowService.resolveDispute(
        'escrow-id-123', 'technician_favor', null, 'admin-id-1', 'Work was fine'
      );

      expect(result.status).toBe('released');
      expect(result.payout).toBeDefined();
      expect(result.payout.amount).toBe(4565);
    });

    it('should resolve dispute with split', async () => {
      const mockEscrow = createMockEscrow({
        status: 'disputed',
        dispute: { openedAt: new Date(), reason: 'Partial fault' },
      });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);
      Booking.findByIdAndUpdate = jest.fn().mockResolvedValue(true);

      const result = await escrowService.resolveDispute(
        'escrow-id-123', 'split', { customer: 40, technician: 60 }, 'admin-id-1', 'Split resolution'
      );

      expect(result.status).toBe('released');
      expect(result.dispute.customerShare).toBe(40);
      expect(result.dispute.technicianShare).toBe(60);
      // Customer gets partial refund
      expect(result.refund).toBeDefined();
      expect(result.refund.amount).toBe(2000); // 40% of 5000
    });

    it('should reject resolution on non-disputed escrow', async () => {
      const mockEscrow = createMockEscrow({ status: 'funded' });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      await expect(
        escrowService.resolveDispute('escrow-id-123', 'customer_favor', null, 'admin-1')
      ).rejects.toThrow('not in dispute status');
    });

    it('should reject invalid resolution type', async () => {
      const mockEscrow = createMockEscrow({
        status: 'disputed',
        dispute: { openedAt: new Date() },
      });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      await expect(
        escrowService.resolveDispute('escrow-id-123', 'invalid_type', null, 'admin-1')
      ).rejects.toThrow('Invalid resolution type');
    });
  });

  // ============================================
  // MILESTONE RELEASE
  // ============================================
  describe('releaseMilestone', () => {
    it('should release individual milestone and set partial_release', async () => {
      const milestones = [
        { name: 'Phase 1', amount: 2000, status: 'pending' },
        { name: 'Phase 2', amount: 3000, status: 'pending' },
      ];
      const mockEscrow = createMockEscrow({ milestones });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      const result = await escrowService.releaseMilestone('escrow-id-123', 0, 'cust-1');

      expect(milestones[0].status).toBe('released');
      expect(milestones[0].releasedAt).toBeInstanceOf(Date);
      expect(result.status).toBe('partial_release');
    });

    it('should set status to released when all milestones released', async () => {
      const milestones = [
        { name: 'Phase 1', amount: 2000, status: 'released' },
        { name: 'Phase 2', amount: 3000, status: 'pending' },
      ];
      const mockEscrow = createMockEscrow({ milestones });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      const result = await escrowService.releaseMilestone('escrow-id-123', 1, 'cust-1');

      expect(milestones[1].status).toBe('released');
      expect(result.status).toBe('released');
      expect(result.releasedAt).toBeInstanceOf(Date);
    });

    it('should reject invalid milestone index', async () => {
      const mockEscrow = createMockEscrow({ milestones: [{ name: 'M1', status: 'pending' }] });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      await expect(
        escrowService.releaseMilestone('escrow-id-123', 5, 'cust-1')
      ).rejects.toThrow('Milestone not found');
    });

    it('should reject already-released milestone', async () => {
      const milestones = [
        { name: 'Phase 1', amount: 2000, status: 'released', releasedAt: new Date() },
      ];
      const mockEscrow = createMockEscrow({ milestones });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      await expect(
        escrowService.releaseMilestone('escrow-id-123', 0, 'cust-1')
      ).rejects.toThrow('Milestone already released');
    });
  });

  // ============================================
  // AUTO-RELEASE
  // ============================================
  describe('processAutoReleases', () => {
    it('should auto-release expired funded escrows', async () => {
      const mockEscrow1 = createMockEscrow({
        _id: 'esc-1',
        status: 'funded',
        expiresAt: new Date(Date.now() - 1000),
        autoReleaseEnabled: true,
      });
      const mockEscrow2 = createMockEscrow({
        _id: 'esc-2',
        status: 'funded',
        expiresAt: new Date(Date.now() - 1000),
        autoReleaseEnabled: true,
      });

      Escrow.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([mockEscrow1, mockEscrow2]),
      });

      const result = await escrowService.processAutoReleases();

      expect(result.processed).toBe(2);
      expect(result.released).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(mockEscrow1.status).toBe('released');
      expect(mockEscrow2.status).toBe('released');
    });

    it('should NOT auto-release disputed escrows (query excludes them)', async () => {
      // The query filters for status: { $in: ['funded', 'partial_release'] }
      // Disputed escrows won't be returned
      Escrow.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      const result = await escrowService.processAutoReleases();

      expect(result.processed).toBe(0);
      expect(result.released).toHaveLength(0);
      // Verify the query used correct status filter
      expect(Escrow.find).toHaveBeenCalledWith(
        expect.objectContaining({
          status: { $in: ['funded', 'partial_release'] },
          autoReleaseEnabled: true,
        })
      );
    });

    it('should NOT auto-release escrows with autoReleaseEnabled=false', async () => {
      // The query filters for autoReleaseEnabled: true
      Escrow.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      const result = await escrowService.processAutoReleases();

      expect(Escrow.find).toHaveBeenCalledWith(
        expect.objectContaining({ autoReleaseEnabled: true })
      );
    });

    it('should handle individual escrow save errors gracefully', async () => {
      const failingEscrow = createMockEscrow({
        _id: 'esc-fail',
        status: 'funded',
      });
      failingEscrow.save = jest.fn().mockRejectedValue(new Error('DB error'));

      Escrow.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([failingEscrow]),
      });

      const result = await escrowService.processAutoReleases();

      expect(result.processed).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe('DB error');
    });

    it('should add auto_released history entry', async () => {
      const mockEscrow = createMockEscrow({
        _id: 'esc-1',
        status: 'funded',
      });
      Escrow.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([mockEscrow]),
      });

      await escrowService.processAutoReleases();

      expect(mockEscrow.addHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'auto_released',
          toStatus: 'released',
        })
      );
    });
  });

  // ============================================
  // FEE CONFIGURATION INTEGRATION
  // ============================================
  describe('Fee configuration constants', () => {
    it('should use correct platform fee percentage', () => {
      expect(PLATFORM_FEE_PERCENTAGE).toBe(7.5);
    });

    it('should auto-release after correct number of days', () => {
      expect(AUTO_RELEASE_DAYS).toBe(3);
    });

    it('should hold disputes for correct number of days', () => {
      expect(DISPUTE_HOLD_DAYS).toBe(7);
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================
  describe('Edge cases', () => {
    it('should reject releasing already-released escrow', async () => {
      const mockEscrow = createMockEscrow({
        status: 'released',
        get canRelease() { return false; },
      });
      Escrow.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockEscrow),
        }),
      });

      await expect(
        escrowService.releaseEscrow('escrow-id-123', 'cust-1')
      ).rejects.toThrow('Escrow cannot be released');
    });

    it('should reject refunding already-refunded escrow', async () => {
      const mockEscrow = createMockEscrow({
        status: 'refunded',
        get canRefund() { return false; },
      });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      await expect(
        escrowService.refundEscrow('escrow-id-123', 'Reason', null, 'admin-1')
      ).rejects.toThrow('Escrow cannot be refunded');
    });

    it('should reject disputing cancelled escrow', async () => {
      const mockEscrow = createMockEscrow({
        status: 'cancelled',
        get canDispute() { return false; },
      });
      Escrow.findById = jest.fn().mockResolvedValue(mockEscrow);

      await expect(
        escrowService.openDispute('escrow-id-123', 'Reason', 'cust-1')
      ).rejects.toThrow('cannot be disputed');
    });

    it('should handle getEscrowByBooking when not found', async () => {
      Escrow.findByBooking = jest.fn().mockResolvedValue(null);

      await expect(
        escrowService.getEscrowByBooking('nonexistent')
      ).rejects.toThrow('Escrow not found for this booking');
    });

    it('should handle getEscrowById when not found', async () => {
      Escrow.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      await expect(
        escrowService.getEscrowById('nonexistent')
      ).rejects.toThrow('Escrow not found');
    });
  });
});
