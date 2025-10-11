const mongoose = require('mongoose');

// MongoDB Connection Configuration
const connectDB = async () => {
  try {
    const options = {
      // Connection options
      maxPoolSize: 10, // Maximum number of connections in the pool
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Socket timeout
      family: 4, // Use IPv4, skip trying IPv6

      // For production
      retryWrites: true,
      w: 'majority',

      // Additional options
      autoIndex: process.env.NODE_ENV === 'development', // Build indexes in development only
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Create database indexes
const createIndexes = async () => {
  try {
    console.log('🔨 Ensuring database indexes...');

    // Import all models to ensure indexes are created (autoIndex handles this in development)
    require('../models/User');
    require('../models/Booking');
    require('../models/Transaction');
    require('../models/Post');
    require('../models/Review');
    require('../models/Message');
    require('../models/Conversation');
    require('../models/Notification');
    require('../models/SupportTicket');

    console.log('✅ Database indexes ensured successfully');
  } catch (error) {
    console.error('❌ Error ensuring indexes:', error.message);
  }
};

// Seed initial data (for development)
const seedDatabase = async () => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    console.log('🌱 Seeding database...');

    // Add seed data here if needed
    // const User = require('../models/User');
    // await User.create({ ... });

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Check database health
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      status: states[state],
      isHealthy: state === 1,
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      collections: await mongoose.connection.db.listCollections().toArray()
    };
  } catch (error) {
    return {
      status: 'error',
      isHealthy: false,
      error: error.message
    };
  }
};

// Get database statistics
const getDatabaseStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();

    return {
      database: mongoose.connection.name,
      collections: stats.collections,
      dataSize: `${(stats.dataSize / (1024 * 1024)).toFixed(2)} MB`,
      indexSize: `${(stats.indexSize / (1024 * 1024)).toFixed(2)} MB`,
      totalSize: `${((stats.dataSize + stats.indexSize) / (1024 * 1024)).toFixed(2)} MB`,
      documents: stats.objects,
      avgObjSize: `${(stats.avgObjSize / 1024).toFixed(2)} KB`,
      indexes: stats.indexes
    };
  } catch (error) {
    throw new Error(`Error getting database stats: ${error.message}`);
  }
};

// Clean up old data (maintenance function)
const cleanupOldData = async () => {
  try {
    console.log('🧹 Cleaning up old data...');

    const Message = require('../models/Message');
    const Notification = require('../models/Notification');
    const Conversation = require('../models/Conversation');

    // Delete old messages (90 days)
    await Message.deleteOldMessages(90);

    // Clean up old notifications (30 days)
    await Notification.cleanupOldNotifications(30);

    // Clean up expired notifications
    await Notification.cleanupExpiredNotifications();

    // Clean up deleted conversations (30 days)
    await Conversation.cleanupDeleted(30);

    console.log('✅ Old data cleaned up successfully');
  } catch (error) {
    console.error('❌ Error cleaning up old data:', error.message);
  }
};

module.exports = {
  connectDB,
  createIndexes,
  seedDatabase,
  checkDatabaseHealth,
  getDatabaseStats,
  cleanupOldData
};
