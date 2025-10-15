const nodemailer = require('nodemailer');

/**
 * Email Service
 * Handles all email sending functionality using Nodemailer
 */

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Send generic email
 */
exports.sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'BaiTech'} <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`📧 Email sent to ${options.to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send welcome email
 */
exports.sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4CAF50;">Welcome to BaiTech! 🎉</h1>
      <p>Hi ${user.firstName},</p>
      <p>Thank you for joining BaiTech - your AI-powered technician platform!</p>
      <p>We're excited to have you on board. Here's what you can do next:</p>
      <ul>
        <li>Complete your profile</li>
        <li>Browse available technicians</li>
        <li>Book your first service</li>
        <li>Join our community</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The BaiTech Team</p>
    </div>
  `;

  return this.sendEmail({
    to: user.email,
    subject: 'Welcome to BaiTech!',
    html
  });
};

/**
 * Send email verification
 */
exports.sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_WEB_URL}/verify-email/${verificationToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2196F3;">Verify Your Email</h1>
      <p>Hi ${user.firstName},</p>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        Verify Email
      </a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
      <p>Best regards,<br>The BaiTech Team</p>
    </div>
  `;

  return this.sendEmail({
    to: user.email,
    subject: 'Verify Your Email - BaiTech',
    html
  });
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_WEB_URL}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #F44336;">Reset Your Password</h1>
      <p>Hi ${user.firstName},</p>
      <p>You requested to reset your password. Click the button below to continue:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #F44336; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        Reset Password
      </a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p>This link will expire in 30 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
      <p>Best regards,<br>The BaiTech Team</p>
    </div>
  `;

  return this.sendEmail({
    to: user.email,
    subject: 'Reset Your Password - BaiTech',
    html
  });
};

/**
 * Send booking confirmation email
 */
exports.sendBookingConfirmationEmail = async (booking, customer, technician) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4CAF50;">Booking Confirmed! ✅</h1>
      <p>Hi ${customer.firstName},</p>
      <p>Your booking has been confirmed!</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details</h3>
        <p><strong>Booking Number:</strong> ${booking.bookingNumber}</p>
        <p><strong>Service:</strong> ${booking.serviceCategory}</p>
        <p><strong>Technician:</strong> ${technician.firstName} ${technician.lastName}</p>
        <p><strong>Date:</strong> ${new Date(booking.schedule.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.schedule.time}</p>
        <p><strong>Location:</strong> ${booking.location.address}</p>
      </div>
      <p>The technician will contact you shortly to confirm details.</p>
      <p>Best regards,<br>The BaiTech Team</p>
    </div>
  `;

  return this.sendEmail({
    to: customer.email,
    subject: `Booking Confirmed - ${booking.bookingNumber}`,
    html
  });
};

/**
 * Send booking notification to technician
 */
exports.sendNewBookingToTechnician = async (booking, technician, customer) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2196F3;">New Booking Request! 📋</h1>
      <p>Hi ${technician.firstName},</p>
      <p>You have a new booking request!</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details</h3>
        <p><strong>Booking Number:</strong> ${booking.bookingNumber}</p>
        <p><strong>Service:</strong> ${booking.serviceCategory}</p>
        <p><strong>Customer:</strong> ${customer.firstName} ${customer.lastName}</p>
        <p><strong>Date:</strong> ${new Date(booking.schedule.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.schedule.time}</p>
        <p><strong>Location:</strong> ${booking.location.address}</p>
        <p><strong>Description:</strong> ${booking.description}</p>
      </div>
      <a href="${process.env.CLIENT_WEB_URL}/bookings/${booking._id}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        View Booking
      </a>
      <p>Best regards,<br>The BaiTech Team</p>
    </div>
  `;

  return this.sendEmail({
    to: technician.email,
    subject: `New Booking Request - ${booking.bookingNumber}`,
    html
  });
};

/**
 * Send payment receipt
 */
exports.sendPaymentReceipt = async (transaction, user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4CAF50;">Payment Receipt 💳</h1>
      <p>Hi ${user.firstName},</p>
      <p>Your payment has been processed successfully.</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Transaction Details</h3>
        <p><strong>Transaction Number:</strong> ${transaction.transactionNumber}</p>
        <p><strong>Amount:</strong> KES ${transaction.amount.gross.toLocaleString()}</p>
        <p><strong>Payment Method:</strong> ${transaction.gateway.toUpperCase()}</p>
        <p><strong>Status:</strong> ${transaction.status}</p>
        <p><strong>Date:</strong> ${new Date(transaction.createdAt).toLocaleString()}</p>
      </div>
      <p>Thank you for using BaiTech!</p>
      <p>Best regards,<br>The BaiTech Team</p>
    </div>
  `;

  return this.sendEmail({
    to: user.email,
    subject: `Payment Receipt - ${transaction.transactionNumber}`,
    html
  });
};

module.exports = exports;
