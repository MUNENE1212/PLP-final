const Notification = require('../models/Notification');
const admin = require('firebase-admin');

/**
 * Notification Service
 * Handles push notifications and in-app notifications
 */

// Initialize Firebase Admin (if credentials are provided)
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return true;

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        })
      });
    } else {
      console.warn('⚠️  Firebase credentials not configured. Push notifications will not work.');
      return false;
    }

    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized');
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    return false;
  }
};

/**
 * Create in-app notification
 */
exports.createNotification = async (recipientId, data) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      ...data
    });

    console.log(`🔔 Notification created for user ${recipientId}`);
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};

/**
 * Send push notification
 */
exports.sendPushNotification = async (fcmTokens, title, body, data = {}) => {
  try {
    if (!initializeFirebase()) {
      console.warn('⚠️  Push notification skipped - Firebase not initialized');
      return { success: false, message: 'Firebase not configured' };
    }

    if (!fcmTokens || fcmTokens.length === 0) {
      console.warn('⚠️  No FCM tokens provided');
      return { success: false, message: 'No FCM tokens' };
    }

    const tokens = Array.isArray(fcmTokens) ? fcmTokens : [fcmTokens];

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      tokens
    };

    const response = await admin.messaging().sendMulticast(message);

    console.log(`📲 Push notification sent: ${response.successCount}/${tokens.length} succeeded`);
    return { success: true, response };
  } catch (error) {
    console.error('Push notification error:', error);
    throw new Error(`Failed to send push notification: ${error.message}`);
  }
};

/**
 * Notify new booking
 */
exports.notifyNewBooking = async (user, booking) => {
  // Create in-app notification
  await this.createNotification(user._id, {
    type: 'booking',
    title: 'New Booking Request',
    message: `You have a new booking request for ${booking.serviceCategory}`,
    data: {
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber
    },
    priority: 'high'
  });

  // Send push notification
  if (user.fcmTokens && user.fcmTokens.length > 0) {
    const tokens = user.fcmTokens.map(t => t.token);
    await this.sendPushNotification(
      tokens,
      'New Booking Request',
      `You have a new booking for ${booking.serviceCategory}`,
      {
        type: 'booking',
        bookingId: booking._id.toString()
      }
    );
  }
};

/**
 * Notify booking status change
 */
exports.notifyBookingStatusChange = async (user, booking, status) => {
  const statusMessages = {
    accepted: 'Your booking has been accepted',
    rejected: 'Your booking was declined',
    in_progress: 'Your booking is now in progress',
    completed: 'Your booking has been completed',
    cancelled: 'Your booking has been cancelled'
  };

  const message = statusMessages[status] || `Booking status changed to ${status}`;

  await this.createNotification(user._id, {
    type: 'booking_update',
    title: 'Booking Update',
    message,
    data: {
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      status
    },
    priority: 'medium'
  });

  if (user.fcmTokens && user.fcmTokens.length > 0) {
    const tokens = user.fcmTokens.map(t => t.token);
    await this.sendPushNotification(
      tokens,
      'Booking Update',
      message,
      {
        type: 'booking_update',
        bookingId: booking._id.toString(),
        status
      }
    );
  }
};

/**
 * Notify payment received
 */
exports.notifyPaymentReceived = async (user, transaction) => {
  await this.createNotification(user._id, {
    type: 'payment',
    title: 'Payment Received',
    message: `You received a payment of KES ${transaction.amount.net}`,
    data: {
      transactionId: transaction._id,
      transactionNumber: transaction.transactionNumber,
      amount: transaction.amount.net
    },
    priority: 'high'
  });

  if (user.fcmTokens && user.fcmTokens.length > 0) {
    const tokens = user.fcmTokens.map(t => t.token);
    await this.sendPushNotification(
      tokens,
      'Payment Received',
      `You received KES ${transaction.amount.net}`,
      {
        type: 'payment',
        transactionId: transaction._id.toString()
      }
    );
  }
};

/**
 * Notify new message
 */
exports.notifyNewMessage = async (user, sender, messageText) => {
  await this.createNotification(user._id, {
    type: 'message',
    title: `New message from ${sender.firstName}`,
    message: messageText.substring(0, 100),
    data: {
      senderId: sender._id,
      senderName: `${sender.firstName} ${sender.lastName}`
    },
    priority: 'medium'
  });

  if (user.fcmTokens && user.fcmTokens.length > 0) {
    const tokens = user.fcmTokens.map(t => t.token);
    await this.sendPushNotification(
      tokens,
      `${sender.firstName} ${sender.lastName}`,
      messageText.substring(0, 100),
      {
        type: 'message',
        senderId: sender._id.toString()
      }
    );
  }
};

/**
 * Notify new review
 */
exports.notifyNewReview = async (user, reviewer, rating) => {
  await this.createNotification(user._id, {
    type: 'review',
    title: 'New Review',
    message: `${reviewer.firstName} left you a ${rating}-star review`,
    data: {
      reviewerId: reviewer._id,
      rating
    },
    priority: 'low'
  });

  if (user.fcmTokens && user.fcmTokens.length > 0) {
    const tokens = user.fcmTokens.map(t => t.token);
    await this.sendPushNotification(
      tokens,
      'New Review',
      `${reviewer.firstName} left you a ${rating}-star review`,
      {
        type: 'review',
        reviewerId: reviewer._id.toString()
      }
    );
  }
};

/**
 * Mark notifications as read
 */
exports.markAsRead = async (notificationIds, userId) => {
  try {
    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipient: userId
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Mark as read error:', error);
    throw error;
  }
};

/**
 * Get unread count
 */
exports.getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    return count;
  } catch (error) {
    console.error('Get unread count error:', error);
    throw error;
  }
};

module.exports = exports;
