const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const winston = require('./config/logger');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const responseTime = require('response-time');
const slowDown = require('express-slow-down');
const csrf = require('csurf');
const toobusy = require('toobusy-js');
const apicache = require('apicache');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

// Initialize cache
const cache = apicache.middleware;

// Load environment variables
require('dotenv').config();

// Database connection with enhanced handlers
require('./config/db')();

// Import routes and middleware
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const requestLogger = require('./middleware/requestLogger');

const app = express();

// ======================
// 1. SECURITY MIDDLEWARE
// ======================
app.set('trust proxy', 1);

// Enhanced security headers
app.use(helmet({
  contentSecurityPolicy: false, // Configure separately if needed
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-site" },
  referrerPolicy: { policy: "same-origin" }
}));

// Request ID for tracing
app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});

// Server load protection
app.use((req, res, next) => {
  if (toobusy()) {
    winston.warn(`Server overloaded: ${req.method} ${req.originalUrl}`);
    return res.status(503).json({ 
      status: 'error', 
      message: 'Server is too busy right now, please try again later',
      requestId: req.id
    });
  }
  next();
});

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  message: (req, res) => ({
  status: 'error',
  message: 'Too many requests from this IP, please try again later',
  requestId: req.id
}),
  skip: (req) => req.path === '/api/health',
  standardHeaders: true,
  legacyHeaders: false
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 100,
  delayMs: () => 500
});

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-auth-token', 'x-request-id'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400,
  exposedHeaders: ['x-auth-token', 'x-request-id']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ======================
// 2. PERFORMANCE & LOGGING
// ======================
app.use(compression({
  level: 6,
  threshold: '10kb',
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

app.use(responseTime());
app.use(requestLogger);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: winston.stream }));
}

// ======================
// 3. REQUEST PROCESSING
// ======================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Security middleware
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

// CSRF protection for session auth
if (process.env.AUTH_STRATEGY === 'session') {
  app.use(csrf({ 
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    }
  }));
}

// ======================
// 4. ROUTES & CACHING
// ======================
// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthcheck = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    memoryUsage: process.memoryUsage(),
    requestId: req.id
  };

  res.status(200).json(healthcheck);
});

// API documentation
const swaggerSpec = swaggerJsdoc(require('./config/swagger'));
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Literacy Platform API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list'
    }
  })
);

// Cache GET requests
app.use(cache('5 minutes', (req) => req.method === 'GET'));

// API routes
app.use('/api/v1', apiLimiter, speedLimiter, routes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// ======================
// 5. ERROR HANDLING
// ======================
app.use(notFound);
app.use(errorHandler);

// Process event handlers
process.on('unhandledRejection', (err) => {
  winston.error(`Unhandled Rejection: ${err.stack || err.message}`);
  if (process.env.NODE_ENV === 'development') console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  winston.error(`Uncaught Exception: ${err.stack || err.message}`);
  if (process.env.NODE_ENV === 'development') console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  winston.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      winston.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;