/**
 * M-Pesa Service Tests (Issue #30)
 *
 * Tests:
 * - Phone number formatting and validation
 * - STK Push password generation
 * - STK callback processing (success + failure)
 * - B2C callback processing (success + failure)
 * - Callback structure validation
 * - Credential validation
 * - Amount validation in escrow methods
 */

process.env.NODE_ENV = 'test';

// Set minimal M-Pesa env so module loads without warnings
process.env.MPESA_CONSUMER_KEY = 'test-consumer-key';
process.env.MPESA_CONSUMER_SECRET = 'test-consumer-secret';
process.env.MPESA_PASSKEY = 'test-passkey-value';
process.env.MPESA_SHORTCODE = '174379';
process.env.MPESA_CALLBACK_URL = 'https://example.com/callback';

const mpesaService = require('../src/services/mpesa.service');

describe('MpesaService', () => {
  describe('formatPhoneNumber', () => {
    it('should convert 07XX format to 2547XX', () => {
      expect(mpesaService.formatPhoneNumber('0712345678')).toBe('254712345678');
    });

    it('should convert 01XX format to 2541XX', () => {
      expect(mpesaService.formatPhoneNumber('0112345678')).toBe('254112345678');
    });

    it('should keep 254XXXXXXXXX as is', () => {
      expect(mpesaService.formatPhoneNumber('254712345678')).toBe('254712345678');
    });

    it('should handle +254 prefix', () => {
      expect(mpesaService.formatPhoneNumber('+254712345678')).toBe('254712345678');
    });

    it('should strip spaces and dashes', () => {
      expect(mpesaService.formatPhoneNumber('0712-345-678')).toBe('254712345678');
      expect(mpesaService.formatPhoneNumber('0712 345 678')).toBe('254712345678');
    });

    it('should add 254 prefix to 9-digit numbers', () => {
      expect(mpesaService.formatPhoneNumber('712345678')).toBe('254712345678');
    });

    it('should throw for too-short phone numbers', () => {
      expect(() => mpesaService.formatPhoneNumber('12345')).toThrow('Invalid phone number format');
    });

    it('should throw for too-long phone numbers', () => {
      expect(() => mpesaService.formatPhoneNumber('1234567890123456')).toThrow('Invalid phone number format');
    });
  });

  describe('isValidKenyanPhone', () => {
    it('should accept 07XX format', () => {
      expect(mpesaService.isValidKenyanPhone('0712345678')).toBe(true);
    });

    it('should accept 01XX format', () => {
      expect(mpesaService.isValidKenyanPhone('0112345678')).toBe(true);
    });

    it('should accept 254 prefix', () => {
      expect(mpesaService.isValidKenyanPhone('254712345678')).toBe(true);
    });

    it('should accept +254 prefix', () => {
      expect(mpesaService.isValidKenyanPhone('+254712345678')).toBe(true);
    });

    it('should reject null/empty', () => {
      expect(mpesaService.isValidKenyanPhone(null)).toBe(false);
      expect(mpesaService.isValidKenyanPhone('')).toBe(false);
      expect(mpesaService.isValidKenyanPhone(undefined)).toBe(false);
    });

    it('should reject non-Kenyan numbers', () => {
      expect(mpesaService.isValidKenyanPhone('0512345678')).toBe(false);
      expect(mpesaService.isValidKenyanPhone('123456')).toBe(false);
    });
  });

  describe('generatePassword', () => {
    it('should return password and timestamp', () => {
      const result = mpesaService.generatePassword();
      expect(result).toHaveProperty('password');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.password).toBe('string');
      expect(result.password.length).toBeGreaterThan(0);
    });

    it('should produce base64-encoded password', () => {
      const { password } = mpesaService.generatePassword();
      // Base64 decode should not throw
      expect(() => Buffer.from(password, 'base64')).not.toThrow();
    });

    it('should produce 14-digit timestamp', () => {
      const { timestamp } = mpesaService.generatePassword();
      expect(timestamp).toMatch(/^\d{14}$/);
    });
  });

  describe('getTimestamp', () => {
    it('should return YYYYMMDDHHmmss format', () => {
      const ts = mpesaService.getTimestamp();
      expect(ts).toMatch(/^\d{14}$/);
    });
  });

  describe('validateCallback', () => {
    it('should accept valid STK callback', () => {
      const data = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'merchant-123',
            CheckoutRequestID: 'checkout-456',
            ResultCode: 0,
            ResultDesc: 'Success',
          },
        },
      };
      expect(mpesaService.validateCallback(data)).toBe(true);
    });

    it('should reject missing Body', () => {
      expect(mpesaService.validateCallback({})).toBe(false);
    });

    it('should reject missing stkCallback', () => {
      expect(mpesaService.validateCallback({ Body: {} })).toBe(false);
    });

    it('should reject missing MerchantRequestID', () => {
      const data = {
        Body: {
          stkCallback: {
            CheckoutRequestID: 'checkout-456',
            ResultCode: 0,
          },
        },
      };
      expect(mpesaService.validateCallback(data)).toBe(false);
    });

    it('should reject missing CheckoutRequestID', () => {
      const data = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'merchant-123',
            ResultCode: 0,
          },
        },
      };
      expect(mpesaService.validateCallback(data)).toBe(false);
    });
  });

  describe('validateB2CCallback', () => {
    it('should accept valid B2C callback', () => {
      const data = {
        Result: {
          ConversationID: 'conv-123',
          OriginatorConversationID: 'orig-456',
          ResultCode: 0,
        },
      };
      expect(mpesaService.validateB2CCallback(data)).toBe(true);
    });

    it('should reject missing Result', () => {
      expect(mpesaService.validateB2CCallback({})).toBe(false);
    });

    it('should reject missing ConversationID', () => {
      const data = {
        Result: {
          OriginatorConversationID: 'orig-456',
          ResultCode: 0,
        },
      };
      expect(mpesaService.validateB2CCallback(data)).toBe(false);
    });
  });

  describe('processCallback (STK Push)', () => {
    it('should process successful STK callback', () => {
      const data = {
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
      };

      const result = mpesaService.processCallback(data);

      expect(result.success).toBe(true);
      expect(result.merchantRequestId).toBe('merchant-123');
      expect(result.checkoutRequestId).toBe('checkout-456');
      expect(result.resultCode).toBe(0);
      expect(result.amount).toBe(100);
      expect(result.mpesaReceiptNumber).toBe('QKJ1234ABC');
      expect(result.phoneNumber).toBe(254712345678);
      expect(result.transactionDate).toBeInstanceOf(Date);
    });

    it('should process failed STK callback', () => {
      const data = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'merchant-123',
            CheckoutRequestID: 'checkout-456',
            ResultCode: 1032,
            ResultDesc: 'Request cancelled by user',
          },
        },
      };

      const result = mpesaService.processCallback(data);

      expect(result.success).toBe(false);
      expect(result.resultCode).toBe(1032);
      expect(result.errorMessage).toBe('Request cancelled by user');
    });

    it('should handle missing CallbackMetadata on success', () => {
      const data = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'merchant-123',
            CheckoutRequestID: 'checkout-456',
            ResultCode: 0,
            ResultDesc: 'Success',
          },
        },
      };

      const result = mpesaService.processCallback(data);
      expect(result.success).toBe(true);
      expect(result.amount).toBeUndefined();
      expect(result.transactionDate).toBeInstanceOf(Date);
    });

    it('should handle invalid transaction date format', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const data = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'merchant-123',
            CheckoutRequestID: 'checkout-456',
            ResultCode: 0,
            ResultDesc: 'Success',
            CallbackMetadata: {
              Item: [
                { Name: 'TransactionDate', Value: 12345 },
              ],
            },
          },
        },
      };

      const result = mpesaService.processCallback(data);
      expect(result.transactionDate).toBeInstanceOf(Date);
      warnSpy.mockRestore();
    });
  });

  describe('processB2CCallback', () => {
    it('should process successful B2C callback', () => {
      const data = {
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
              { Key: 'TransactionCompletedDateTime', Value: '01.12.2026 14:30:52' },
            ],
          },
        },
      };

      const result = mpesaService.processB2CCallback(data);

      expect(result.success).toBe(true);
      expect(result.conversationId).toBe('conv-123');
      expect(result.transactionId).toBe('txn-789');
      expect(result.transactionAmount).toBe(500);
      expect(result.transactionReceipt).toBe('QKJ5678DEF');
      expect(result.b2CRecipientIsRegisteredCustomer).toBe('Y');
    });

    it('should process failed B2C callback', () => {
      const data = {
        Result: {
          ConversationID: 'conv-123',
          OriginatorConversationID: 'orig-456',
          TransactionID: 'txn-789',
          ResultCode: 2001,
          ResultDesc: 'The initiator information is invalid.',
        },
      };

      const result = mpesaService.processB2CCallback(data);

      expect(result.success).toBe(false);
      expect(result.resultCode).toBe(2001);
      expect(result.errorMessage).toBe('The initiator information is invalid.');
    });

    it('should handle missing ResultParameters on success', () => {
      const data = {
        Result: {
          ConversationID: 'conv-123',
          OriginatorConversationID: 'orig-456',
          TransactionID: 'txn-789',
          ResultCode: 0,
          ResultDesc: 'Success',
        },
      };

      const result = mpesaService.processB2CCallback(data);
      expect(result.success).toBe(true);
      expect(result.transactionAmount).toBeUndefined();
    });
  });

  describe('handleSTKPushCallback', () => {
    it('should add escrow context to successful callback', () => {
      const data = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'merchant-123',
            CheckoutRequestID: 'checkout-456',
            ResultCode: 0,
            ResultDesc: 'Success',
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: 100 },
                { Name: 'MpesaReceiptNumber', Value: 'QKJ1234ABC' },
              ],
            },
          },
        },
      };

      const result = mpesaService.handleSTKPushCallback(data);
      expect(result.escrowFunded).toBe(true);
      expect(result.fundedAt).toBeInstanceOf(Date);
    });

    it('should not set escrowFunded for failed callback', () => {
      const data = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'merchant-123',
            CheckoutRequestID: 'checkout-456',
            ResultCode: 1032,
            ResultDesc: 'Cancelled',
          },
        },
      };

      const result = mpesaService.handleSTKPushCallback(data);
      expect(result.success).toBe(false);
      expect(result.escrowFunded).toBeUndefined();
    });
  });

  describe('handleB2CCallback', () => {
    it('should add escrow release context to successful callback', () => {
      const data = {
        Result: {
          ConversationID: 'conv-123',
          OriginatorConversationID: 'orig-456',
          TransactionID: 'txn-789',
          ResultCode: 0,
          ResultDesc: 'Success',
        },
      };

      const result = mpesaService.handleB2CCallback(data);
      expect(result.escrowReleased).toBe(true);
      expect(result.releasedAt).toBeInstanceOf(Date);
    });

    it('should not set escrowReleased for failed callback', () => {
      const data = {
        Result: {
          ConversationID: 'conv-123',
          OriginatorConversationID: 'orig-456',
          TransactionID: 'txn-789',
          ResultCode: 2001,
          ResultDesc: 'Failed',
        },
      };

      const result = mpesaService.handleB2CCallback(data);
      expect(result.success).toBe(false);
      expect(result.escrowReleased).toBeUndefined();
    });
  });

  describe('getAccessToken', () => {
    it('should throw when credentials are not configured', async () => {
      // Create a service instance with no credentials
      jest.resetModules();
      const origKey = process.env.MPESA_CONSUMER_KEY;
      const origSecret = process.env.MPESA_CONSUMER_SECRET;
      process.env.MPESA_CONSUMER_KEY = '';
      process.env.MPESA_CONSUMER_SECRET = '';

      const freshService = require('../src/services/mpesa.service');
      await expect(freshService.getAccessToken()).rejects.toThrow('Failed to get M-Pesa access token');

      process.env.MPESA_CONSUMER_KEY = origKey;
      process.env.MPESA_CONSUMER_SECRET = origSecret;
    });
  });

  describe('generatePassword validation', () => {
    it('should throw when passkey is missing', () => {
      jest.resetModules();
      const origPasskey = process.env.MPESA_PASSKEY;
      process.env.MPESA_PASSKEY = '';

      const freshService = require('../src/services/mpesa.service');
      expect(() => freshService.generatePassword()).toThrow('passkey and shortcode must be configured');

      process.env.MPESA_PASSKEY = origPasskey;
    });
  });

  describe('B2C credential validation', () => {
    it('should fail initiateB2C without initiator name', async () => {
      const result = await mpesaService.initiateB2C({
        phoneNumber: '0712345678',
        amount: 100,
        remarks: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('MPESA_INITIATOR_NAME');
    });
  });

  describe('escrow funding validation', () => {
    it('should reject invalid phone number', async () => {
      const result = await mpesaService.initiateEscrowFunding({
        phoneNumber: '123',
        amount: 100,
        escrowId: 'esc-12345678',
        bookingId: 'bk-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid Kenyan phone number');
    });

    it('should reject zero amount', async () => {
      const result = await mpesaService.initiateEscrowFunding({
        phoneNumber: '0712345678',
        amount: 0,
        escrowId: 'esc-12345678',
        bookingId: 'bk-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 1 KES');
    });
  });

  describe('escrow payout validation', () => {
    it('should reject invalid phone number', async () => {
      const result = await mpesaService.initiateEscrowPayout({
        phoneNumber: '123',
        amount: 100,
        escrowId: 'esc-12345678',
        bookingId: 'bk-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid Kenyan phone number');
    });

    it('should reject amount exceeding B2C limit', async () => {
      const result = await mpesaService.initiateEscrowPayout({
        phoneNumber: '0712345678',
        amount: 200000,
        escrowId: 'esc-12345678',
        bookingId: 'bk-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds maximum B2C limit');
    });

    it('should reject zero amount', async () => {
      const result = await mpesaService.initiateEscrowPayout({
        phoneNumber: '0712345678',
        amount: 0,
        escrowId: 'esc-12345678',
        bookingId: 'bk-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 1 KES');
    });
  });

  describe('credential validation on module load', () => {
    it('should throw in production when credentials are missing', () => {
      jest.resetModules();
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      // Clear credentials
      const origKey = process.env.MPESA_CONSUMER_KEY;
      process.env.MPESA_CONSUMER_KEY = '';

      expect(() => {
        require('../src/services/mpesa.service');
      }).toThrow('Missing M-Pesa credentials in production');

      process.env.NODE_ENV = origEnv;
      process.env.MPESA_CONSUMER_KEY = origKey;
    });

    it('should throw in production for sandbox credentials', () => {
      jest.resetModules();
      const origEnv = process.env.NODE_ENV;
      const origMpesaEnv = process.env.MPESA_ENVIRONMENT;
      process.env.NODE_ENV = 'production';
      process.env.MPESA_ENVIRONMENT = 'production';
      const origKey = process.env.MPESA_CONSUMER_KEY;
      process.env.MPESA_CONSUMER_KEY = 'sandbox-test-key';

      expect(() => {
        require('../src/services/mpesa.service');
      }).toThrow('sandbox/test credential');

      process.env.NODE_ENV = origEnv;
      process.env.MPESA_ENVIRONMENT = origMpesaEnv;
      process.env.MPESA_CONSUMER_KEY = origKey;
    });
  });
});
