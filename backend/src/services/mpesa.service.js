const axios = require('axios');
const crypto = require('crypto');

/**
 * M-Pesa Daraja API Service
 * Implements STK Push (Lipa na M-Pesa Online)
 */

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.passkey = process.env.MPESA_PASSKEY;
    this.shortCode = process.env.MPESA_SHORTCODE;
    this.environment = process.env.MPESA_ENVIRONMENT || 'sandbox'; // 'sandbox' or 'production'

    // API URLs
    this.baseURL = this.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

    this.callbackURL = process.env.MPESA_CALLBACK_URL || `${process.env.API_URL}/api/v1/payments/mpesa/callback`;
  }

  /**
   * Generate OAuth access token
   */
  async getAccessToken() {
    try {
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
   */
  generatePassword() {
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
        result.transactionDate = metadata.TransactionDate;
        result.phoneNumber = metadata.PhoneNumber;
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
}

module.exports = new MpesaService();
