const AfricasTalking = require('africastalking');

/**
 * SMS Service
 * Handles SMS sending using Africa's Talking API
 */

// Initialize Africa's Talking
const initializeAT = () => {
  return AfricasTalking({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME
  });
};

/**
 * Send SMS
 */
exports.sendSMS = async (phoneNumber, message) => {
  try {
    const africastalking = initializeAT();
    const sms = africastalking.SMS;

    const options = {
      to: [phoneNumber],
      message,
      from: process.env.AT_SENDER_ID || 'BAITECH'
    };

    const result = await sms.send(options);

    console.log(`📱 SMS sent to ${phoneNumber}`);
    return { success: true, result };
  } catch (error) {
    console.error('SMS sending error:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

/**
 * Send verification code
 */
exports.sendVerificationCode = async (phoneNumber, code) => {
  const message = `Your BaiTech verification code is: ${code}. Valid for 10 minutes. Do not share this code with anyone.`;
  return this.sendSMS(phoneNumber, message);
};

/**
 * Send booking reminder
 */
exports.sendBookingReminder = async (phoneNumber, bookingNumber, date, time) => {
  const message = `Reminder: Your BaiTech booking ${bookingNumber} is scheduled for ${date} at ${time}. Thank you!`;
  return this.sendSMS(phoneNumber, message);
};

/**
 * Send booking confirmation
 */
exports.sendBookingConfirmation = async (phoneNumber, bookingNumber) => {
  const message = `Your BaiTech booking ${bookingNumber} has been confirmed! The technician will contact you shortly.`;
  return this.sendSMS(phoneNumber, message);
};

/**
 * Send technician arrival notification
 */
exports.sendTechnicianArrivalNotification = async (phoneNumber, technicianName) => {
  const message = `Good news! ${technicianName} is on the way to your location. They will arrive shortly.`;
  return this.sendSMS(phoneNumber, message);
};

/**
 * Send payment confirmation
 */
exports.sendPaymentConfirmation = async (phoneNumber, amount, transactionNumber) => {
  const message = `Payment of KES ${amount} received successfully. Transaction: ${transactionNumber}. Thank you for using BaiTech!`;
  return this.sendSMS(phoneNumber, message);
};

module.exports = exports;
