const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Socket.IO Configuration
 * Handles real-time communication for messages, notifications, and live updates
 */

let io;

/**
 * Initialize Socket.IO
 */
exports.initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: [
        process.env.CLIENT_WEB_URL,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(socket.userId);

    // Update user online status
    updateUserOnlineStatus(socket.userId, true);

    // Handle user joining conversation
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Handle user leaving conversation
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle typing indicator
    socket.on('typing', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        conversationId
      });
    });

    // Handle stop typing
    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
        userId: socket.userId,
        conversationId
      });
    });

    // Handle booking updates
    socket.on('subscribe_booking', (bookingId) => {
      socket.join(`booking:${bookingId}`);
      console.log(`User ${socket.userId} subscribed to booking ${bookingId}`);
    });

    socket.on('unsubscribe_booking', (bookingId) => {
      socket.leave(`booking:${bookingId}`);
      console.log(`User ${socket.userId} unsubscribed from booking ${bookingId}`);
    });

    // Handle location updates (for technician tracking)
    socket.on('update_location', ({ bookingId, location }) => {
      socket.to(`booking:${bookingId}`).emit('technician_location', {
        technicianId: socket.userId,
        location,
        timestamp: new Date()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      updateUserOnlineStatus(socket.userId, false);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  console.log('✅ Socket.IO initialized');
  return io;
};

/**
 * Get Socket.IO instance
 */
exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Emit event to specific user
 */
exports.emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(userId).emit(event, data);
};

/**
 * Emit event to conversation
 */
exports.emitToConversation = (conversationId, event, data) => {
  if (!io) return;
  io.to(`conversation:${conversationId}`).emit(event, data);
};

/**
 * Emit event to booking subscribers
 */
exports.emitToBooking = (bookingId, event, data) => {
  if (!io) return;
  io.to(`booking:${bookingId}`).emit(event, data);
};

/**
 * Broadcast to all connected users
 */
exports.broadcast = (event, data) => {
  if (!io) return;
  io.emit(event, data);
};

/**
 * Send new message notification
 */
exports.sendNewMessage = (conversationId, message) => {
  this.emitToConversation(conversationId, 'new_message', message);
};

/**
 * Send booking update notification
 */
exports.sendBookingUpdate = (bookingId, update) => {
  this.emitToBooking(bookingId, 'booking_update', update);
};

/**
 * Send notification to user
 */
exports.sendNotification = (userId, notification) => {
  this.emitToUser(userId, 'notification', notification);
};

/**
 * Update user online status
 */
const updateUserOnlineStatus = async (userId, isOnline) => {
  try {
    await User.findByIdAndUpdate(userId, {
      isOnline,
      ...(isOnline ? {} : { lastSeen: new Date() })
    });
  } catch (error) {
    console.error('Error updating user online status:', error);
  }
};

/**
 * Get online users count
 */
exports.getOnlineUsersCount = () => {
  if (!io) return 0;
  return io.sockets.sockets.size;
};

/**
 * Check if user is online
 */
exports.isUserOnline = (userId) => {
  if (!io) return false;
  const userSockets = io.sockets.adapter.rooms.get(userId);
  return userSockets && userSockets.size > 0;
};

module.exports = exports;
