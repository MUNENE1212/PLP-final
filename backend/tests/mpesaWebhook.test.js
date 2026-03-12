/**
 * M-Pesa Webhook Controller Tests (Issue #30)
 *
 * Tests:
 * - STK Push callback: success, failure, unknown checkoutRequestId, idempotency
 * - B2C callback: success, failure, unknown conversationId, idempotency
 * - C2B validation: accepts/rejects based on booking reference and amount
 * - C2B confirmation: creates/updates transaction
 * - Error handling returns proper ResultCodes
 *
 * All tests mock MongoDB models (no database connection needed).
 */

process.env.NODE_ENV = 'test';
process.env.MPESA_CONSUMER_KEY = 'test-key';
process.env.MPESA_CONSUMER_SECRET = 'test-secret';
process.env.MPESA_PASSKEY = 'test-passkey';
process.env.MPESA_SHORTCODE = '174379';
process.env.MPESA_CALLBACK_URL = 'https://example.com/callback';

// Mock models before requiring controller
jest.mock('../src/models/Transaction');
jest.mock('../src/models/Booking');
jest.mock('../src/models/User');

const Transaction = require('../src/models/Transaction');
const Booking = require('../src/models/Booking');
const controller = require('../src/controllers/mpesaWebhook.controller');

// Helper: mock Express response
const mockResponse = () => {
  const res = {
    statusCode: 200,
    _jsonData: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(data) {
      res._jsonData = data;
      return res;
    },
  };
  return res;
};

// Helper: create a valid STK Push callback body (success)
const validStkSuccess = () => ({
  Body: {
    stkCallback: {
      MerchantRequestID: 'merchant-123',
      CheckoutRequestID: 'checkout-456',
      ResultCode: 0,
      ResultDesc: 'The service request is processed successfully.',
      CallbackMetadata: {
        Item: [
          { Name: 'Amount', Value: 100 },
          { Name: 'MpesaReceiptNumber', Value: 'QKJ1234ABC' },
          { Name: 'PhoneNumber', Value: 254712345678 },
          { Name: 'TransactionDate', Value: 20261201143052 },
        ],
      },
    },
  },
});

// Helper: create a failed STK Push callback body
const validStkFailure = () => ({
  Body: {
    stkCallback: {
      MerchantRequestID: 'merchant-123',
      CheckoutRequestID: 'checkout-456',
      ResultCode: 1032,
      ResultDesc: 'Request cancelled by user',
    },
  },
});

// Helper: create a valid B2C callback body (success)
const validB2CSuccess = () => ({
  Result: {
    ConversationID: 'conv-123',
    OriginatorConversationID: 'orig-456',
    TransactionID: 'txn-789',
    ResultCode: 0,
    ResultDesc: 'The service request is processed successfully.',
    ResultParameters: {
      ResultParameter: [
        { Key: 'TransactionAmount', Value: 500 },
        { Key: 'TransactionReceipt', Value: 'QKJ5678DEF' },
        { Key: 'B2CRecipientIsRegisteredCustomer', Value: 'Y' },
        { Key: 'ReceiverPartyPublicName', Value: '254712345678 - John Doe' },
      ],
    },
  },
});

// Helper: create a failed B2C callback body
const validB2CFailure = () => ({
  Result: {
    ConversationID: 'conv-123',
    OriginatorConversationID: 'orig-456',
    TransactionID: 'txn-789',
    ResultCode: 2001,
    ResultDesc: 'The initiator information is invalid.',
  },
});

// Helper: mock transaction object
const createMockTransaction = (overrides = {}) => {
  const txn = {
    _id: 'txn-id-123',
    status: 'pending',
    type: 'booking_fee',
    booking: 'booking-id-123',
    payer: 'user-id-123',
    mpesaDetails: {},
    escrow: { held: true },
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
  return txn;
};

// Helper: mock booking object
const createMockBooking = (overrides = {}) => {
  const booking = {
    _id: 'booking-id-123',
    bookingNumber: 'BK-2026-001',
    status: 'pending',
    bookingFee: { amount: 100, status: 'pending' },
    statusHistory: [],
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
  return booking;
};

describe('M-Pesa Webhook Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('stkPushCallback', () => {
    it('should process successful STK payment and update transaction', async () => {
      const mockTxn = createMockTransaction();
      Transaction.findOne = jest.fn().mockResolvedValue(mockTxn);
      Booking.findById = jest.fn().mockResolvedValue(createMockBooking());

      const req = { body: validStkSuccess(), ip: '127.0.0.1', connection: {} };
      const res = mockResponse();

      await controller.stkPushCallback(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._jsonData.ResultCode).toBe(0);
      expect(mockTxn.status).toBe('completed');
      expect(mockTxn.mpesaDetails.mpesaReceiptNumber).toBe('QKJ1234ABC');
      expect(mockTxn.save).toHaveBeenCalled();
    });

    it('should process failed STK payment and mark transaction as failed', async () => {
      const mockTxn = createMockTransaction();
      Transaction.findOne = jest.fn().mockResolvedValue(mockTxn);

      const req = { body: validStkFailure(), ip: '127.0.0.1', connection: {} };
      const res = mockResponse();

      await controller.stkPushCallback(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._jsonData.ResultCode).toBe(0);
      expect(mockTxn.status).toBe('failed');
      expect(mockTxn.failureReason).toBe('Request cancelled by user');
      expect(mockTxn.save).toHaveBeenCalled();
    });

    it('should return 200 for unknown checkoutRequestId (no retry)', async () => {
      Transaction.findOne = jest.fn().mockResolvedValue(null);

      const req = { body: validStkSuccess(), ip: '127.0.0.1', connection: {} };
      const res = mockResponse();

      await controller.stkPushCallback(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._jsonData.ResultCode).toBe(0);
      expect(res._jsonData.ResultDesc).toBe('Accepted');
    });

    it('should skip already-completed transactions (idempotency)', async () => {
      const mockTxn = createMockTransaction({ status: 'completed' });
      Transaction.findOne = jest.fn().mockResolvedValue(mockTxn);

      const req = { body: validStkSuccess(), ip: '127.0.0.1', connection: {} };
      const res = mockResponse();

      await controller.stkPushCallback(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._jsonData.ResultCode).toBe(0);
      // save should not be called for duplicate
      expect(mockTxn.save).not.toHaveBeenCalled();
    });

    it('should reject invalid callback structure', async () => {
      const req = { body: { invalid: 'data' }, ip: '127.0.0.1', connection: {} };
      const res = mockResponse();

      await controller.stkPushCallback(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._jsonData.ResultCode).toBe(1);
    });

    it('should return 200 even on processing errors', async () => {
      Transaction.findOne = jest.fn().mockRejectedValue(new Error('DB error'));

      const req = { body: validStkSuccess(), ip: '127.0.0.1', connection: {} };
      const res = mockResponse();

      await controller.stkPushCallback(req, res);

      // Always return 200 to prevent M-Pesa retries
      expect(res.statusCode).toBe(200);
      expect(res._jsonData.ResultCode).toBe(0);
    });
  });

  describe('b2cCallback', () => {
    it('should process successful B2C payout and update transaction', async () => {
      const mockTxn = createMockTransaction({ escrow: {} });
      mockTxn.populate = undefined; // findOne returns query chain
      Transaction.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTxn),
      });
      Booking.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(createMockBooking()),
      });

      const req = { body: validB2CSuccess(), ip: '127.0.0.1', connection: {} };
      const res = mockResponse();

      await controller.b2cCallback(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._jsonData.ResultCode).toBe(0);
      expect(mockTxn.status).toBe('completed');
      expect(mockTxn.save).toHaveBeenCalled();
    });

    it('should process failed B2C payout and mark transaction as failed', async () => {
      const mockTxn = createMockTransaction();
      Transaction.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTxn),
      });

      const req = { body: validB2CFailure(), ip: '127.0.0.1', connection: {} };
      const res = mockResponse();

      await controller.b2cCallback(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockTxn.status).toBe('failed');
      expect(mockTxn.failureReason).toBe('The initiator information is invalid.');
    });

    it('should return 200 for unknown conversationId', async () => {
      Transaction.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const req = { body: validB2CSuccess(), ip: '127.0.0.1', connection: {} };
      const res = mockResponse();

      await controller.b2cCallback(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._jsonData.ResultCode).toBe(0);
    });

    it('should skip already-completed B2C transactions (idempotency)', async () => {
      const mockTxn = createMockTransaction({ status: 'completed' });
      Transaction.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTxn),
      });

      const req = { body: validB2CSuccess(), ip: '127.0.0.1', connection: {} };
      const res = mockResponse();

      await controller.b2cCallback(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockTxn.save).not.toHaveBeenCalled();
    });

    it('should reject invalid B2C callback structure', async () => {
      const req = { body: { invalid: 'data' }, ip: '127.0.0.1', connection: {} };
      const res = mockResponse();

      await controller.b2cCallback(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._jsonData.ResultCode).toBe(1);
    });
  });

  describe('validationUrl (C2B)', () => {
    it('should accept valid booking reference with matching amount', async () => {
      const mockBooking = createMockBooking({ status: 'pending' });
      Booking.findOne = jest.fn().mockResolvedValue(mockBooking);

      const req = {
        body: {
          TransID: 'TXN123',
          TransAmount: '100',
          BillRefNumber: 'BK-2026-001',
          MSISDN: '254712345678',
        },
      };
      const res = mockResponse();

      await controller.validationUrl(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._jsonData.ResultCode).toBe(0);
      expect(res._jsonData.ResultDesc).toBe('Accepted');
    });

    it('should reject invalid booking reference', async () => {
      Booking.findOne = jest.fn().mockResolvedValue(null);

      const req = {
        body: {
          TransID: 'TXN123',
          TransAmount: '100',
          BillRefNumber: 'INVALID-REF',
          MSISDN: '254712345678',
        },
      };
      const res = mockResponse();

      await controller.validationUrl(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._jsonData.ResultCode).toBe(1);
      expect(res._jsonData.ResultDesc).toContain('Invalid booking reference');
    });

    it('should reject booking not in payable state', async () => {
      const mockBooking = createMockBooking({ status: 'completed' });
      Booking.findOne = jest.fn().mockResolvedValue(mockBooking);

      const req = {
        body: {
          TransID: 'TXN123',
          TransAmount: '100',
          BillRefNumber: 'BK-2026-001',
          MSISDN: '254712345678',
        },
      };
      const res = mockResponse();

      await controller.validationUrl(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._jsonData.ResultCode).toBe(1);
      expect(res._jsonData.ResultDesc).toContain('not in payable state');
    });

    it('should reject amount mismatch (beyond 1 KES tolerance)', async () => {
      const mockBooking = createMockBooking({
        status: 'pending',
        bookingFee: { amount: 100 },
      });
      Booking.findOne = jest.fn().mockResolvedValue(mockBooking);

      const req = {
        body: {
          TransID: 'TXN123',
          TransAmount: '200',
          BillRefNumber: 'BK-2026-001',
          MSISDN: '254712345678',
        },
      };
      const res = mockResponse();

      await controller.validationUrl(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._jsonData.ResultCode).toBe(1);
      expect(res._jsonData.ResultDesc).toContain('Amount mismatch');
    });

    it('should accept amount within 1 KES tolerance', async () => {
      const mockBooking = createMockBooking({
        status: 'pending',
        bookingFee: { amount: 100 },
      });
      Booking.findOne = jest.fn().mockResolvedValue(mockBooking);

      const req = {
        body: {
          TransID: 'TXN123',
          TransAmount: '100.50',
          BillRefNumber: 'BK-2026-001',
          MSISDN: '254712345678',
        },
      };
      const res = mockResponse();

      await controller.validationUrl(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._jsonData.ResultCode).toBe(0);
    });

    it('should reject on database error (ResultCode 1)', async () => {
      Booking.findOne = jest.fn().mockRejectedValue(new Error('DB error'));

      const req = {
        body: {
          TransID: 'TXN123',
          TransAmount: '100',
          BillRefNumber: 'BK-2026-001',
          MSISDN: '254712345678',
        },
      };
      const res = mockResponse();

      await controller.validationUrl(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._jsonData.ResultCode).toBe(1);
      expect(res._jsonData.ResultDesc).toContain('Validation error');
    });
  });

  describe('confirmationUrl (C2B)', () => {
    it('should update existing transaction on confirmation', async () => {
      const mockTxn = createMockTransaction({ status: 'pending', amount: {} });
      Transaction.findOne = jest.fn()
        .mockResolvedValueOnce(null)  // First query by merchantRequestId
        .mockResolvedValueOnce(mockTxn);  // Second query by transactionNumber

      const req = {
        body: {
          TransactionType: 'Pay Bill',
          TransID: 'TXN123',
          TransTime: '20261201143052',
          TransAmount: '100',
          BusinessShortCode: '174379',
          BillRefNumber: 'BK-2026-001',
          MSISDN: '254712345678',
          FirstName: 'John',
          LastName: 'Doe',
        },
      };
      const res = mockResponse();

      await controller.confirmationUrl(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._jsonData.ResultCode).toBe(0);
      expect(mockTxn.status).toBe('completed');
      expect(mockTxn.externalTransactionId).toBe('TXN123');
      expect(mockTxn.save).toHaveBeenCalled();
    });

    it('should skip already-completed transaction (idempotency)', async () => {
      const mockTxn = createMockTransaction({ status: 'completed' });
      Transaction.findOne = jest.fn().mockResolvedValueOnce(mockTxn);

      const req = {
        body: {
          TransID: 'TXN123',
          TransTime: '20261201143052',
          TransAmount: '100',
          BillRefNumber: 'BK-2026-001',
          MSISDN: '254712345678',
        },
      };
      const res = mockResponse();

      await controller.confirmationUrl(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockTxn.save).not.toHaveBeenCalled();
    });

    it('should handle no matching transaction gracefully', async () => {
      Transaction.findOne = jest.fn().mockResolvedValue(null);

      const req = {
        body: {
          TransID: 'TXN-UNKNOWN',
          TransAmount: '100',
          BillRefNumber: 'UNKNOWN-REF',
          MSISDN: '254712345678',
        },
      };
      const res = mockResponse();

      await controller.confirmationUrl(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._jsonData.ResultCode).toBe(0);
    });

    it('should return 200 on error (prevent M-Pesa retries)', async () => {
      Transaction.findOne = jest.fn().mockRejectedValue(new Error('DB error'));

      const req = {
        body: {
          TransID: 'TXN123',
          TransAmount: '100',
          BillRefNumber: 'BK-2026-001',
        },
      };
      const res = mockResponse();

      await controller.confirmationUrl(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._jsonData.ResultCode).toBe(0);
    });
  });

  describe('testWebhook', () => {
    it('should return webhook endpoint info', async () => {
      const req = {};
      const res = mockResponse();

      await controller.testWebhook(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._jsonData.success).toBe(true);
      expect(res._jsonData.endpoints).toBeDefined();
      expect(res._jsonData.endpoints.stkCallback).toBeDefined();
      expect(res._jsonData.endpoints.b2cCallback).toBeDefined();
    });
  });
});
