require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { connectDB, createIndexes } = require('./config/db');
const { initializeSocket } = require('./config/socket');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB().then(() => {
  // Create indexes after connection
  createIndexes();
});

// ===== MIDDLEWARE =====

// Security Headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      process.env.CLIENT_WEB_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000', // Backend server (for Swagger UI)
      'http://localhost:5173', // Vite default
      'http://localhost:5174', // Vite alternative
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:5173',
    ];

    // In development, allow requests with no origin (like Postman, Swagger UI, mobile apps)
    if (process.env.NODE_ENV === 'development') {
      // Always allow in development
      callback(null, true);
      if (origin && whitelist.indexOf(origin) === -1) {
        console.warn(`⚠️  Non-whitelisted origin allowed in dev: ${origin}`);
      }
    } else {
      // In production, be strict
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.error(`❌ CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// MongoDB Injection Prevention
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ===== ROUTES =====

// Health Check
app.get('/health', async (req, res) => {
  const { checkDatabaseHealth } = require('./config/db');
  const dbHealth = await checkDatabaseHealth();

  res.status(dbHealth.isHealthy ? 200 : 503).json({
    status: dbHealth.isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: dbHealth
  });
});

// API Info
app.get('/', (req, res) => {
  res.json({
    name: 'BaiTech API',
    version: process.env.API_VERSION || 'v1',
    description: 'AI-Powered Technician & Community Platform',
    documentation: '/api-docs',
    health: '/health',
    status: 'running'
  });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BaiTech API Documentation'
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/users', require('./routes/user.routes'));
app.use('/api/v1/bookings', require('./routes/booking.routes'));
app.use('/api/v1/transactions', require('./routes/transaction.routes'));
app.use('/api/v1/posts', require('./routes/post.routes'));
app.use('/api/v1/reviews', require('./routes/review.routes'));
app.use('/api/v1/conversations', require('./routes/conversation.routes'));
app.use('/api/v1/messages', require('./routes/message.routes'));
app.use('/api/v1/notifications', require('./routes/notification.routes'));
app.use('/api/v1/support', require('./routes/support.routes'));
app.use('/api/v1/matching', require('./routes/matching.routes'));
app.use('/api/v1/media', require('./routes/media.routes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT Error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // JWT Expired Error
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default Error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===== SERVER =====
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║     🚀 BaiTech Server Started        ║
╠═══════════════════════════════════════╣
║  Environment: ${process.env.NODE_ENV?.padEnd(23) || 'development'.padEnd(23)} ║
║  Port: ${PORT.toString().padEnd(30)} ║
║  URL: http://localhost:${PORT}${' '.repeat(17 - PORT.toString().length)} ║
╚═══════════════════════════════════════╝
  `);
});

// Initialize Socket.IO
initializeSocket(server);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
