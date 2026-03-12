/**
 * M-Pesa Callback Verification Middleware Tests (Issue #30)
 *
 * Tests:
 * - IP whitelist validation
 * - Callback secret verification
 * - STK Push callback structure validation
 * - B2C callback structure validation
 * - C2B callback structure validation
 * - Unrecognized structure rejection
 */

// Must set env before requiring module (startup validation runs on import)
process.env.NODE_ENV = 'test';
process.env.MPESA_CALLBACK_SECRET = 'test-mpesa-secret-for-testing';

const {
  mpesaCallbackVerify,
  mpesaTimeoutVerify,
  isAllowedIP,
  getClientIP,
  validateCallbackStructure,
  SAFARICOM_IP_RANGES,
} = require('../src/middleware/mpesaVerify');

// Helper: create a valid STK Push callback body
const validStkBody = () => ({
  Body: {
    stkCallback: {
      MerchantRequestID: 'merchant-123',
      CheckoutRequestID: 'checkout-456',
      ResultCode: 0,
      ResultDesc: 'Success',
    },
  },
});

// Helper: create a valid B2C callback body
const validB2CBody = () => ({
  Result: {
    ResultType: 0,
    ResultCode: 0,
    ResultDesc: 'Success',
    OriginatorConversationID: 'conv-123',
  },
});

// Helper: create a valid C2B callback body
const validC2BBody = () => ({
  TransactionType: 'Pay Bill',
  TransID: 'TXN123456',
  MSISDN: '254712345678',
  TransAmount: '100.00',
  BillRefNumber: 'BK-2026-001',
});

// Helper: mock Express response object
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

describe('M-Pesa Verify Middleware', () => {
  describe('validateCallbackStructure', () => {
    it('should accept valid STK Push callback', () => {
      const result = validateCallbackStructure(validStkBody());
      expect(result.valid).toBe(true);
    });

    it('should reject STK callback missing MerchantRequestID', () => {
      const body = validStkBody();
      delete body.Body.stkCallback.MerchantRequestID;
      const result = validateCallbackStructure(body);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('MerchantRequestID');
    });

    it('should reject STK callback missing CheckoutRequestID', () => {
      const body = validStkBody();
      delete body.Body.stkCallback.CheckoutRequestID;
      const result = validateCallbackStructure(body);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('CheckoutRequestID');
    });

    it('should reject STK callback missing ResultCode', () => {
      const body = validStkBody();
      delete body.Body.stkCallback.ResultCode;
      const result = validateCallbackStructure(body);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ResultCode');
    });

    it('should accept valid B2C callback', () => {
      const result = validateCallbackStructure(validB2CBody());
      expect(result.valid).toBe(true);
    });

    it('should reject B2C callback missing ResultType', () => {
      const body = validB2CBody();
      delete body.Result.ResultType;
      const result = validateCallbackStructure(body);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ResultType');
    });

    it('should reject B2C callback missing ResultCode', () => {
      const body = validB2CBody();
      delete body.Result.ResultCode;
      const result = validateCallbackStructure(body);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ResultCode');
    });

    it('should accept valid C2B callback (TransactionType + TransID + MSISDN)', () => {
      const result = validateCallbackStructure(validC2BBody());
      expect(result.valid).toBe(true);
    });

    it('should reject unrecognized callback structure', () => {
      const result = validateCallbackStructure({ foo: 'bar' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unrecognized');
    });

    it('should reject null body', () => {
      const result = validateCallbackStructure(null);
      expect(result.valid).toBe(false);
    });

    it('should reject non-object body', () => {
      const result = validateCallbackStructure('string');
      expect(result.valid).toBe(false);
    });
  });

  describe('isAllowedIP', () => {
    it('should allow Safaricom IPs', () => {
      expect(isAllowedIP('196.201.214.200')).toBe(true);
      expect(isAllowedIP('196.201.213.114')).toBe(true);
    });

    it('should reject unknown IPs', () => {
      expect(isAllowedIP('1.2.3.4')).toBe(false);
      expect(isAllowedIP('10.0.0.1')).toBe(false);
    });

    it('should allow localhost in dev/test', () => {
      expect(isAllowedIP('127.0.0.1')).toBe(true);
      expect(isAllowedIP('::1')).toBe(true);
    });

    it('should reject null/empty IP', () => {
      expect(isAllowedIP(null)).toBe(false);
      expect(isAllowedIP('')).toBe(false);
      expect(isAllowedIP(undefined)).toBe(false);
    });

    it('should export Safaricom IP ranges', () => {
      expect(Array.isArray(SAFARICOM_IP_RANGES)).toBe(true);
      expect(SAFARICOM_IP_RANGES.length).toBeGreaterThan(0);
    });
  });

  describe('getClientIP', () => {
    it('should extract IP from X-Forwarded-For header', () => {
      const req = { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }, socket: {} };
      expect(getClientIP(req)).toBe('1.2.3.4');
    });

    it('should extract IP from X-Real-IP header', () => {
      const req = { headers: { 'x-real-ip': '9.8.7.6' }, socket: {} };
      expect(getClientIP(req)).toBe('9.8.7.6');
    });

    it('should fall back to socket remoteAddress', () => {
      const req = { headers: {}, socket: { remoteAddress: '192.168.1.1' } };
      expect(getClientIP(req)).toBe('192.168.1.1');
    });

    it('should return empty string if no IP available', () => {
      const req = { headers: {}, socket: {} };
      expect(getClientIP(req)).toBe('');
    });
  });

  describe('mpesaCallbackVerify middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: { 'x-mpesa-callback-secret': 'test-mpesa-secret-for-testing' },
        body: validStkBody(),
        path: '/api/v1/mpesa/callback',
        socket: { remoteAddress: '127.0.0.1' },
        protocol: 'http',
        secure: false,
      };
      res = mockResponse();
      next = jest.fn();
    });

    it('should pass valid STK callback with correct secret', () => {
      mpesaCallbackVerify(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.mpesaVerification).toBeDefined();
      expect(req.mpesaVerification.ip).toBe('127.0.0.1');
    });

    it('should reject invalid callback secret', () => {
      req.headers['x-mpesa-callback-secret'] = 'wrong-secret';

      mpesaCallbackVerify(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(403);
      expect(res._jsonData.ResultDesc).toBe('Invalid credentials');
    });

    it('should reject missing callback secret', () => {
      delete req.headers['x-mpesa-callback-secret'];

      mpesaCallbackVerify(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(403);
    });

    it('should reject invalid callback structure', () => {
      req.body = { invalid: 'structure' };

      mpesaCallbackVerify(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(400);
      expect(res._jsonData.ResultCode).toBe(1);
    });

    it('should accept B2C callback structure', () => {
      req.body = validB2CBody();

      mpesaCallbackVerify(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept C2B callback structure', () => {
      req.body = validC2BBody();

      mpesaCallbackVerify(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should accept x-callback-secret header as alternative', () => {
      delete req.headers['x-mpesa-callback-secret'];
      req.headers['x-callback-secret'] = 'test-mpesa-secret-for-testing';

      mpesaCallbackVerify(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('mpesaTimeoutVerify middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: { 'x-mpesa-callback-secret': 'test-mpesa-secret-for-testing' },
        body: {},
        path: '/api/v1/mpesa/timeout',
        socket: { remoteAddress: '127.0.0.1' },
      };
      res = mockResponse();
      next = jest.fn();
    });

    it('should pass with valid secret', () => {
      mpesaTimeoutVerify(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid secret', () => {
      req.headers['x-mpesa-callback-secret'] = 'wrong';

      mpesaTimeoutVerify(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.statusCode).toBe(403);
    });
  });
});
