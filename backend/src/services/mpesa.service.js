const axios = require('axios');
const crypto = require('crypto');

/**
 * M-Pesa Daraja API Service
 * Implements STK Push (Lipa na M-Pesa Online)
 *
 * SECURITY: Production deployments MUST have proper M-Pesa credentials configured.
 * The service will throw errors if credentials are missing or use default values.
 */

/**
 * Validate M-Pesa credentials are properly configured
 * SECURITY: Throws error if production uses sandbox/test credentials
 */
const validateMpesaCredentials = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isMpesaProduction = process.env.MPESA_ENVIRONMENT === 'production';

  // In production, M-Pesa must also be in production mode
  if (isProduction && !isMpesaProduction) {
    console.warn('SECURITY WARNING: Running in production but MPESA_ENVIRONMENT is not set to "production"');
  }

  // Check for required credentials
  const requiredCredentials = [
    'MPESA_CONSUMER_KEY',
    'MPESA_CONSUMER_SECRET',
    'MPESA_PASSKEY',
    'MPESA_SHORTCODE',
  ];

  const missingCredentials = requiredCredentials.filter(cred => !process.env[cred]);

  if (missingCredentials.length > 0) {
    if (isProduction) {
      throw new Error(`CRITICAL: Missing M-Pesa credentials in production: ${missingCredentials.join(', ')}`);
    } else {
      console.warn(`WARNING: Missing M-Pesa credentials: ${missingCredentials.join(', ')}. M-Pesa functionality will not work.`);
    }
  }

  // SECURITY: Check for sandbox/test credentials in production
  if (isProduction && isMpesaProduction) {
    const sandboxPatterns = ['sandbox', 'test', 'demo', 'example', 'dummy'];

    for (const cred of requiredCredentials) {
      const value = process.env[cred];
      if (value) {
        for (const pattern of sandboxPatterns) {
          if (value.toLowerCase().includes(pattern)) {
            throw new Error(`SECURITY ERROR: ${cred} appears to contain sandbox/test credential "${pattern}" - cannot use in production`);
          }
        }
      }
    }
  }
};

// Run credential validation on module load
try {
  validateMpesaCredentials();
} catch (error) {
  console.error('M-Pesa Configuration Error:', error.message);
  // In production, we want to fail fast
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }
}

class MpesaService {
  constructor() {
    // SECURITY: No default values for credentials - must be explicitly configured
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.passkey = process.env.MPESA_PASSKEY;
    this.shortCode = process.env.MPESA_SHORTCODE;

    // Environment configuration
    // ALLOW_SANDBOX_IN_PROD=true allows testing M-Pesa in production (for development/staging)
    const allowSandboxInProd = process.env.ALLOW_SANDBOX_IN_PROD === 'true';
    this.environment = process.env.MPESA_ENVIRONMENT;

    // SECURITY: Require explicit environment configuration in production
    if (process.env.NODE_ENV === 'production') {
      if (!this.environment) {
        throw new Error('CRITICAL: MPESA_ENVIRONMENT is REQUIRED in production. Set to "production" or "sandbox" in environment variables.');
      }
      // Allow sandbox in production only if explicitly enabled (for testing)
      if (this.environment === 'sandbox' && !allowSandboxInProd) {
        throw new Error('CRITICAL: MPESA_ENVIRONMENT is "sandbox" in production. Set ALLOW_SANDBOX_IN_PROD=true to enable testing mode, or set MPESA_ENVIRONMENT=production.');
      }
      if (this.environment === 'sandbox') {
        console.warn('⚠️  WARNING: Running M-Pesa in SANDBOX mode on production server. Payments will NOT be real.');
      }
    }

    // Default to sandbox only in development/test
    if (!this.environment) {
      this.environment = 'sandbox';
    }

    // API URLs
    this.baseURL = this.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

    // Callback URLs - no defaults in production
    this.callbackURL = process.env.MPESA_CALLBACK_URL;
    this.b2cCallbackURL = process.env.MPESA_B2C_CALLBACK_URL;
    this.b2cTimeoutURL = process.env.MPESA_B2C_TIMEOUT_URL;

    // SECURITY: Validate callback URLs are configured in production
    if (process.env.NODE_ENV === 'production') {
      if (!this.callbackURL) {
        throw new Error('MPESA_CALLBACK_URL is required in production');
      }
    }

    // B2C Configuration - SECURITY: No default value for initiator name
    this.initiatorName = process.env.MPESA_INITIATOR_NAME;
    this.securityCredential = process.env.MPESA_SECURITY_CREDENTIAL;

    // SECURITY: Warn if B2C initiator uses default value
    if (!this.initiatorName && (this.b2cCallbackURL || this.b2cTimeoutURL)) {
      console.warn('WARNING: B2C is configured but MPESA_INITIATOR_NAME is not set. B2C payments will fail.');
    }
  }

  /**
   * Generate OAuth access token
   * SECURITY: Validates credentials before making request
   */
  async getAccessToken() {
    try {
      // SECURITY: Validate credentials exist before making request
      if (!this.consumerKey || !this.consumerSecret) {
        throw new Error('M-Pesa credentials not configured. Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET');
      }

      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

      const response = await axios.get(
        `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('M-Pesa OAuth Error:', error.response?.data || error.message);
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  /**
   * Generate password for STK Push
   * SECURITY: Validates required configuration before generating
   */
  generatePassword() {
    // SECURITY: Validate passkey and shortcode exist
    if (!this.passkey || !this.shortCode) {
      throw new Error('M-Pesa passkey and shortcode must be configured. Set MPESA_PASSKEY and MPESA_SHORTCODE');
    }

    const timestamp = this.getTimestamp();
    const password = Buffer.from(
      `${this.shortCode}${this.passkey}${timestamp}`
    ).toString('base64');

    return { password, timestamp };
  }

  /**
   * Get current timestamp in format YYYYMMDDHHmmss
   */
  getTimestamp() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Format phone number to international format (primarily for Kenyan numbers)
   */
  formatPhoneNumber(phoneNumber) {
    // Remove spaces, dashes, and plus signs
    let formatted = phoneNumber.replace(/[\s\-\+]/g, '');

    // If starts with 0, replace with 254 (Kenyan format)
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.substring(1);
    }

    // If doesn't start with 254, assume it's international or needs 254 prefix
    // For now, we'll assume most users are Kenyan, but this can be extended
    if (!formatted.startsWith('254')) {
      // If it's a valid international number, keep as is
      // Otherwise, assume Kenyan and add 254
      if (formatted.length === 9) {
        formatted = '254' + formatted;
      }
      // For other lengths, we'll trust the input but ensure it's numeric
    }

    // Basic validation - should be between 10-15 digits for international
    if (formatted.length < 10 || formatted.length > 15) {
      throw new Error('Invalid phone number format');
    }

    return formatted;
  }

  /**
   * Initiate STK Push
   * @param {Object} params - Payment parameters
   * @param {string} params.phoneNumber - Customer phone number
   * @param {number} params.amount - Amount to charge
   * @param {string} params.accountReference - Account reference (e.g., booking number)
   * @param {string} params.transactionDesc - Transaction description
   * @returns {Object} STK Push response
   */
  async initiateSTKPush({ phoneNumber, amount, accountReference, transactionDesc }) {
    try {
      // Get access token
      const accessToken = await this.getAccessToken();

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Generate password and timestamp
      const { password, timestamp } = this.generatePassword();

      // Prepare request payload
      const payload = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount), // M-Pesa only accepts whole numbers
        PartyA: formattedPhone, // Customer phone number
        PartyB: this.shortCode, // Business shortcode
        PhoneNumber: formattedPhone, // Phone number to receive STK push
        CallBackURL: this.callbackURL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc || 'Payment',
      };

      console.log('M-Pesa STK Push Request:', {
        ...payload,
        Password: '[HIDDEN]',
      });

      // Make request to M-Pesa
      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('M-Pesa STK Push Response:', response.data);

      return {
        success: true,
        data: {
          merchantRequestId: response.data.MerchantRequestID,
          checkoutRequestId: response.data.CheckoutRequestID,
          responseCode: response.data.ResponseCode,
          responseDescription: response.data.ResponseDescription,
          customerMessage: response.data.CustomerMessage,
        },
      };
    } catch (error) {
      console.error('M-Pesa STK Push Error:', error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.errorMessage || error.message || 'STK Push failed',
        details: error.response?.data,
      };
    }
  }

  /**
   * Query STK Push transaction status
   * @param {string} checkoutRequestId - CheckoutRequestID from STK Push
   */
  async querySTKPushStatus(checkoutRequestId) {
    try {
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      const payload = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('M-Pesa Query Response:', response.data);

      return {
        success: true,
        data: {
          merchantRequestId: response.data.MerchantRequestID,
          checkoutRequestId: response.data.CheckoutRequestID,
          responseCode: response.data.ResponseCode,
          responseDescription: response.data.ResponseDescription,
          resultCode: response.data.ResultCode,
          resultDesc: response.data.ResultDesc,
        },
      };
    } catch (error) {
      console.error('M-Pesa Query Error:', error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.errorMessage || error.message || 'Query failed',
        details: error.response?.data,
      };
    }
  }

  /**
   * Process M-Pesa callback
   * @param {Object} callbackData - Callback data from M-Pesa
   */
  processCallback(callbackData) {
    try {
      const { Body } = callbackData;
      const { stkCallback } = Body;

      const result = {
        merchantRequestId: stkCallback.MerchantRequestID,
        checkoutRequestId: stkCallback.CheckoutRequestID,
        resultCode: stkCallback.ResultCode,
        resultDesc: stkCallback.ResultDesc,
      };

      // ResultCode 0 means success
      if (stkCallback.ResultCode === 0) {
        // Extract callback metadata
        const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];

        const metadata = {};
        callbackMetadata.forEach(item => {
          metadata[item.Name] = item.Value;
        });

        result.success = true;
        result.amount = metadata.Amount;
        result.mpesaReceiptNumber = metadata.MpesaReceiptNumber;
        result.phoneNumber = metadata.PhoneNumber;

        // Parse M-Pesa transaction date (format: YYYYMMDDHHmmss)
        // Example: 20231119143052 = 2023-11-19 14:30:52
        if (metadata.TransactionDate) {
          const dateStr = metadata.TransactionDate.toString();
          if (dateStr.length === 14) {
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            const hour = dateStr.substring(8, 10);
            const minute = dateStr.substring(10, 12);
            const second = dateStr.substring(12, 14);

            // Create ISO date string
            result.transactionDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+03:00`);
            console.log('Parsed transaction date:', result.transactionDate);
          } else {
            console.warn('Invalid transaction date format:', dateStr);
            result.transactionDate = new Date(); // Fallback to current date
          }
        } else {
          result.transactionDate = new Date(); // Fallback to current date
        }
      } else {
        result.success = false;
        result.errorMessage = stkCallback.ResultDesc;
      }

      return result;
    } catch (error) {
      console.error('M-Pesa Callback Processing Error:', error);
      throw new Error('Failed to process M-Pesa callback');
    }
  }

  /**
   * Validate M-Pesa callback authenticity
   * This is a basic validation - you may want to add more security checks
   */
  validateCallback(callbackData) {
    // Check if callback has required structure
    if (!callbackData.Body || !callbackData.Body.stkCallback) {
      return false;
    }

    const { stkCallback } = callbackData.Body;

    // Check if it has required fields
    if (!stkCallback.MerchantRequestID || !stkCallback.CheckoutRequestID) {
      return false;
    }

    return true;
  }

  /**
   * Initiate B2C (Business to Customer) Payment
   * SECURITY: Validates B2C credentials before initiating payment
   * @param {Object} params - B2C parameters
   * @param {string} params.phoneNumber - Recipient phone number
   * @param {number} params.amount - Amount to send
   * @param {string} params.remarks - Payment remarks
   * @param {string} params.occasion - Payment occasion
   * @returns {Object} B2C response
   */
  async initiateB2C({ phoneNumber, amount, remarks, occasion }) {
    try {
      // SECURITY: Validate B2C credentials are configured
      if (!this.initiatorName) {
        throw new Error('B2C payment requires MPESA_INITIATOR_NAME to be configured');
      }
      if (!this.securityCredential) {
        throw new Error('B2C payment requires MPESA_SECURITY_CREDENTIAL to be configured');
      }
      if (!this.b2cCallbackURL) {
        throw new Error('B2C payment requires MPESA_B2C_CALLBACK_URL to be configured');
      }
      if (!this.b2cTimeoutURL) {
        throw new Error('B2C payment requires MPESA_B2C_TIMEOUT_URL to be configured');
      }

      // Get access token
      const accessToken = await this.getAccessToken();

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Prepare request payload
      const payload = {
        InitiatorName: this.initiatorName,
        SecurityCredential: this.securityCredential,
        CommandID: 'BusinessPayment', // For B2C payments to registered customers
        Amount: Math.ceil(amount), // M-Pesa only accepts whole numbers
        PartyA: this.shortCode, // Business shortcode
        PartyB: formattedPhone, // Customer phone number
        Remarks: remarks || 'Payment',
        QueueTimeOutURL: this.b2cTimeoutURL,
        ResultURL: this.b2cCallbackURL,
        Occasion: occasion || 'Payment',
      };

      console.log('M-Pesa B2C Request:', {
        ...payload,
        SecurityCredential: '[HIDDEN]',
      });

      // Make request to M-Pesa
      const response = await axios.post(
        `${this.baseURL}/mpesa/b2c/v1/paymentrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('M-Pesa B2C Response:', response.data);

      return {
        success: true,
        data: {
          conversationId: response.data.ConversationID,
          originatorConversationId: response.data.OriginatorConversationID,
          responseCode: response.data.ResponseCode,
          responseDescription: response.data.ResponseDescription,
        },
      };
    } catch (error) {
      console.error('M-Pesa B2C Error:', error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.errorMessage || error.message || 'B2C payment failed',
        details: error.response?.data,
      };
    }
  }

  /**
   * Process M-Pesa B2C callback
   * @param {Object} callbackData - Callback data from M-Pesa
   */
  processB2CCallback(callbackData) {
    try {
      const { Result } = callbackData;

      const result = {
        conversationId: Result.ConversationID,
        originatorConversationId: Result.OriginatorConversationID,
        transactionId: Result.TransactionID,
        resultCode: Result.ResultCode,
        resultDesc: Result.ResultDesc,
      };

      // ResultCode 0 means success
      if (Result.ResultCode === 0) {
        // Extract result parameters
        const resultParameters = Result.ResultParameters?.ResultParameter || [];

        const parameters = {};
        resultParameters.forEach(param => {
          parameters[param.Key] = param.Value;
        });

        result.success = true;
        result.transactionAmount = parameters.TransactionAmount;
        result.transactionReceipt = parameters.TransactionReceipt;
        result.b2CRecipientIsRegisteredCustomer = parameters.B2CRecipientIsRegisteredCustomer;
        result.b2CChargesPaidAccountAvailableFunds = parameters.B2CChargesPaidAccountAvailableFunds;
        result.receiverPartyPublicName = parameters.ReceiverPartyPublicName;
        result.transactionCompletedDateTime = parameters.TransactionCompletedDateTime;
        result.b2CUtilityAccountAvailableFunds = parameters.B2CUtilityAccountAvailableFunds;
        result.b2CWorkingAccountAvailableFunds = parameters.B2CWorkingAccountAvailableFunds;
      } else {
        result.success = false;
        result.errorMessage = Result.ResultDesc;
      }

      return result;
    } catch (error) {
      console.error('M-Pesa B2C Callback Processing Error:', error);
      throw new Error('Failed to process M-Pesa B2C callback');
    }
  }

  /**
   * Validate M-Pesa B2C callback authenticity
   */
  validateB2CCallback(callbackData) {
    // Check if callback has required structure
    if (!callbackData.Result) {
      return false;
    }

    const { Result } = callbackData;

    // Check if it has required fields
    if (!Result.ConversationID || !Result.OriginatorConversationID) {
      return false;
    }

    return true;
  }

  /**
   * Query account balance (for platform M-Pesa account)
   * @returns {Object} Account balance response
   */
  async queryAccountBalance() {
    try {
      // Validate B2C credentials
      if (!this.initiatorName) {
        throw new Error('Account balance query requires MPESA_INITIATOR_NAME to be configured');
      }
      if (!this.securityCredential) {
        throw new Error('Account balance query requires MPESA_SECURITY_CREDENTIAL to be configured');
      }

      const accessToken = await this.getAccessToken();

      const payload = {
        Initiator: this.initiatorName,
        SecurityCredential: this.securityCredential,
        CommandID: 'AccountBalance',
        PartyA: this.shortCode,
        IdentifierType: '4', // Organization
        Remarks: 'Account balance query',
        QueueTimeOutURL: this.b2cTimeoutURL || this.callbackURL,
        ResultURL: this.b2cCallbackURL || this.callbackURL,
      };

      console.log('M-Pesa Account Balance Query:', {
        ...payload,
        SecurityCredential: '[HIDDEN]',
      });

      const response = await axios.post(
        `${this.baseURL}/mpesa/accountbalance/v1/query`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('M-Pesa Account Balance Response:', response.data);

      return {
        success: true,
        data: {
          conversationId: response.data.ConversationID,
          originatorConversationId: response.data.OriginatorConversationID,
          responseCode: response.data.ResponseCode,
          responseDescription: response.data.ResponseDescription,
        },
      };
    } catch (error) {
      console.error('M-Pesa Account Balance Query Error:', error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.errorMessage || error.message || 'Account balance query failed',
        details: error.response?.data,
      };
    }
  }

  /**
   * Process account balance callback
   * @param {Object} callbackData - Callback data from M-Pesa
   * @returns {Object} Processed balance data
   */
  processAccountBalanceCallback(callbackData) {
    try {
      const { Result } = callbackData;

      const result = {
        conversationId: Result.ConversationID,
        originatorConversationId: Result.OriginatorConversationID,
        resultCode: Result.ResultCode,
        resultDesc: Result.ResultDesc,
      };

      if (Result.ResultCode === 0) {
        const resultParameters = Result.ResultParameters?.ResultParameter || [];
        const parameters = {};
        resultParameters.forEach(param => {
          parameters[param.Key] = param.Value;
        });

        result.success = true;
        result.accountBalance = parameters.AccountBalance;
        result.availableBalance = parameters.BOAvertimePaymentMMFAccountBalance;
        result.utilityBalance = parameters.UTILITYAccountBalance;
        result.workingBalance = parameters.WorkingAccountBalance;
      } else {
        result.success = false;
        result.errorMessage = Result.ResultDesc;
      }

      return result;
    } catch (error) {
      console.error('M-Pesa Account Balance Callback Processing Error:', error);
      throw new Error('Failed to process M-Pesa account balance callback');
    }
  }

  /**
   * Validate Kenyan phone number format
   * Supports 07XX, 01XX, +2547XX, +2541XX, 2547XX, 2541XX formats
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} True if valid Kenyan phone number
   */
  isValidKenyanPhone(phoneNumber) {
    if (!phoneNumber) return false;

    // Remove spaces and dashes
    const cleaned = phoneNumber.replace(/[\s\-]/g, '');

    // Valid Kenyan phone patterns
    const patterns = [
      /^(254|0)(1|7)\d{8}$/,  // 254XXXXXXXXX or 0XXXXXXXXX
      /^\+254(1|7)\d{8}$/,     // +254XXXXXXXXX
    ];

    return patterns.some(pattern => pattern.test(cleaned));
  }

  /**
   * Initiate STK Push for escrow funding
   * @param {Object} params - Escrow payment parameters
   * @param {string} params.phoneNumber - Customer phone number
   * @param {number} params.amount - Amount to charge
   * @param {string} params.escrowId - Escrow ID reference
   * @param {string} params.bookingId - Booking ID reference
   * @param {string} params.description - Transaction description
   * @returns {Object} STK Push response with escrow context
   */
  async initiateEscrowFunding({ phoneNumber, amount, escrowId, bookingId, description }) {
    try {
      // Validate phone number format
      if (!this.isValidKenyanPhone(phoneNumber)) {
        throw new Error('Invalid Kenyan phone number format. Use format 07XX or 2547XX');
      }

      // Validate amount
      if (!amount || amount < 1) {
        throw new Error('Amount must be at least 1 KES');
      }

      const accountReference = `ESC-${escrowId.substring(0, 8).toUpperCase()}`;
      const transactionDesc = description || `Escrow funding for booking`;

      const result = await this.initiateSTKPush({
        phoneNumber,
        amount,
        accountReference,
        transactionDesc,
      });

      // Add escrow context to response
      if (result.success) {
        result.data.escrowId = escrowId;
        result.data.bookingId = bookingId;
        result.data.paymentType = 'escrow_funding';
      }

      return result;
    } catch (error) {
      console.error('Escrow funding STK Push Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initiate escrow funding',
      };
    }
  }

  /**
   * Initiate B2C payout to technician for completed escrow
   * @param {Object} params - Payout parameters
   * @param {string} params.phoneNumber - Technician phone number
   * @param {number} params.amount - Amount to payout
   * @param {string} params.escrowId - Escrow ID reference
   * @param {string} params.bookingId - Booking ID reference
   * @param {string} params.transactionId - Internal transaction ID
   * @param {string} params.occasion - Payment occasion
   * @returns {Object} B2C response with escrow context
   */
  async initiateEscrowPayout({ phoneNumber, amount, escrowId, bookingId, transactionId, occasion }) {
    try {
      // Validate phone number format
      if (!this.isValidKenyanPhone(phoneNumber)) {
        throw new Error('Invalid Kenyan phone number format. Use format 07XX or 2547XX');
      }

      // Validate amount
      if (!amount || amount < 1) {
        throw new Error('Amount must be at least 1 KES');
      }

      // Maximum B2C amount per transaction (Safaricom limit)
      const MAX_B2C_AMOUNT = 150000; // 150,000 KES
      if (amount > MAX_B2C_AMOUNT) {
        throw new Error(`Amount exceeds maximum B2C limit of ${MAX_B2C_AMOUNT.toLocaleString()} KES`);
      }

      const remarks = `Payout for escrow ${escrowId.substring(0, 8).toUpperCase()}`;
      const payoutOccasion = occasion || 'Technician payout for completed service';

      const result = await this.initiateB2C({
        phoneNumber,
        amount,
        remarks,
        occasion: payoutOccasion,
      });

      // Add escrow context to response
      if (result.success) {
        result.data.escrowId = escrowId;
        result.data.bookingId = bookingId;
        result.data.transactionId = transactionId;
        result.data.paymentType = 'escrow_payout';
      }

      return result;
    } catch (error) {
      console.error('Escrow payout B2C Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initiate escrow payout',
      };
    }
  }

  /**
   * Handle STK Push callback for escrow integration
   * Parses callback and returns structured data for escrow funding
   * @param {Object} callbackData - Raw callback data from M-Pesa
   * @returns {Object} Processed callback with escrow context
   */
  handleSTKPushCallback(callbackData) {
    const processed = this.processCallback(callbackData);

    // Extract escrow reference from account reference if available
    if (processed.success && processed.checkoutRequestId) {
      // The account reference would contain ESC-XXXXXXXX format
      // This can be used to link back to the escrow
      processed.escrowFunded = processed.success;
      processed.fundedAt = processed.success ? new Date() : null;
    }

    return processed;
  }

  /**
   * Handle B2C callback for escrow release
   * Parses callback and returns structured data for escrow release
   * @param {Object} callbackData - Raw callback data from M-Pesa
   * @returns {Object} Processed callback with escrow context
   */
  handleB2CCallback(callbackData) {
    const processed = this.processB2CCallback(callbackData);

    // Add escrow release context
    if (processed.success) {
      processed.escrowReleased = true;
      processed.releasedAt = new Date();
    }

    return processed;
  }

  /**
   * Transaction status query for external systems
   * @param {string} checkoutRequestID - CheckoutRequestID from STK Push
   * @returns {Object} Transaction status response
   */
  async queryTransactionStatus(checkoutRequestID) {
    return this.querySTKPushStatus(checkoutRequestID);
  }
}

module.exports = new MpesaService();
