const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Payment Service
 * Handles payment processing via M-Pesa and Stripe
 */

/**
 * Process M-Pesa STK Push (Lipa Na M-Pesa)
 */
exports.initiateMpesaPayment = async (phoneNumber, amount, accountReference, transactionDesc) => {
  try {
    // Get M-Pesa access token
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const authResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );

    const accessToken = authResponse.data.access_token;

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);

    // Generate password
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    // Format phone number (ensure it starts with 254 for Kenyan numbers, or handle international)
    let formattedPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits

    if (formattedPhone.startsWith('0')) {
      formattedPhone = `254${formattedPhone.slice(1)}`;
    } else if (formattedPhone.startsWith('254')) {
      // Already in correct format for Kenya
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1);
    }

    // For international numbers, we might need to handle differently, but for now assume Kenyan
    if (!formattedPhone.startsWith('254')) {
      // If not Kenyan, still try to format as best as possible
      // This is a simplified approach - in production, you'd want more robust international handling
      formattedPhone = formattedPhone;
    }

    // Initiate STK Push
    const stkPushResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc || 'Payment for BaiTech services'
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    console.log('📱 M-Pesa STK Push initiated:', stkPushResponse.data);

    return {
      success: true,
      checkoutRequestID: stkPushResponse.data.CheckoutRequestID,
      merchantRequestID: stkPushResponse.data.MerchantRequestID,
      responseCode: stkPushResponse.data.ResponseCode,
      responseDescription: stkPushResponse.data.ResponseDescription
    };
  } catch (error) {
    console.error('M-Pesa payment error:', error.response?.data || error.message);
    throw new Error(`Failed to initiate M-Pesa payment: ${error.response?.data?.errorMessage || error.message}`);
  }
};

/**
 * Query M-Pesa transaction status
 */
exports.queryMpesaTransaction = async (checkoutRequestID) => {
  try {
    // Get access token
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const authResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );

    const accessToken = authResponse.data.access_token;

    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    // Query transaction status
    const queryResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    return {
      success: true,
      resultCode: queryResponse.data.ResultCode,
      resultDesc: queryResponse.data.ResultDesc
    };
  } catch (error) {
    console.error('M-Pesa query error:', error.response?.data || error.message);
    throw new Error(`Failed to query M-Pesa transaction: ${error.message}`);
  }
};

/**
 * Process Stripe payment
 */
exports.createStripePaymentIntent = async (amount, currency = 'kes', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true
      }
    });

    console.log('💳 Stripe Payment Intent created:', paymentIntent.id);

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('Stripe payment error:', error);
    throw new Error(`Failed to create Stripe payment: ${error.message}`);
  }
};

/**
 * Confirm Stripe payment
 */
exports.confirmStripePayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    };
  } catch (error) {
    console.error('Stripe confirmation error:', error);
    throw new Error(`Failed to confirm Stripe payment: ${error.message}`);
  }
};

/**
 * Process refund
 */
exports.processRefund = async (paymentIntentId, amount = null) => {
  try {
    const refundData = {
      payment_intent: paymentIntentId
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundData);

    console.log('💸 Refund processed:', refund.id);

    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status
    };
  } catch (error) {
    console.error('Refund error:', error);
    throw new Error(`Failed to process refund: ${error.message}`);
  }
};

/**
 * Create Stripe customer
 */
exports.createStripeCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata
    });

    return {
      success: true,
      customerId: customer.id
    };
  } catch (error) {
    console.error('Create customer error:', error);
    throw new Error(`Failed to create Stripe customer: ${error.message}`);
  }
};

/**
 * Handle M-Pesa callback
 */
exports.handleMpesaCallback = async (callbackData) => {
  try {
    const { Body } = callbackData;
    const { stkCallback } = Body;

    const result = {
      merchantRequestID: stkCallback.MerchantRequestID,
      checkoutRequestID: stkCallback.CheckoutRequestID,
      resultCode: stkCallback.ResultCode,
      resultDesc: stkCallback.ResultDesc
    };

    // If payment was successful, extract metadata
    if (stkCallback.ResultCode === 0 && stkCallback.CallbackMetadata) {
      const metadata = {};
      stkCallback.CallbackMetadata.Item.forEach(item => {
        metadata[item.Name] = item.Value;
      });
      result.metadata = metadata;
    }

    console.log('📲 M-Pesa callback processed:', result);
    return result;
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    throw new Error(`Failed to process M-Pesa callback: ${error.message}`);
  }
};

module.exports = exports;
