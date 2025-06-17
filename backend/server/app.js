const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
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
const winston = require('./config/logger');

// Load environment variables
require('dotenv').config();

// DB connection
require('./config/db')();

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const requestLogger = require('./middleware/requestLogger');

// Express app
const app = express();
const cache = apicache.middleware;

// ========== 1. SECURITY ==========
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-site" },
  referrerPolicy: { policy: "same-origin" }
}));

// Unique request ID
app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});

// Toobusy protection
app.use((req, res, next) => {
  if (toobusy()) {
    winston.warn(`Server busy: ${req.method} ${req.originalUrl}`);
    return res.status(503).json({
      status: 'error',
      message: 'Server is too busy. Try again later.',
      requestId: req.id
    });
  }
  next();
});

// Rate Limiting and Slowdown
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => req.path === '/api/health',
  message: (req, res) => ({
    status: 'error',
    message: 'Too many requests, try again later.',
    requestId: req.id
  }),
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 100,
  delayMs: 500
});

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-auth-token', 'x-request-id'],
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['x-auth-token', 'x-request-id']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ========== 2. PERFORMANCE & LOGGING ==========
app.use(compression({ level: 6 }));
app.use(responseTime());
app.use(requestLogger);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: winston.stream }));
}

// ========== 3. REQUEST PROCESSING ==========
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// CSRF (only if using session auth)
if (process.env.AUTH_STRATEGY === 'session') {
  app.use(csrf({
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    }
  }));
}

// ========== 4. ROUTES ==========
// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV,
    requestId: req.id
  });
});

// Swagger Docs
const swaggerOptions = require('./config/swagger');
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'Literacy Platform API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'list'
  }
}));

// Cache GET requests
app.use(cache('5 minutes', req => req.method === 'GET'));

// API routes
app.use('/api/v1', apiLimiter, speedLimiter, routes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
  });
}

// ========== 5. ERROR HANDLING ==========
app.use(notFound);
app.use(errorHandler);

// ========== 6. PROCESS HANDLERS ==========
process.on('unhandledRejection', (err) => {
  winston.error(`Unhandled Rejection: ${err.stack || err}`);
  if (process.env.NODE_ENV === 'development') console.error(err);
});

process.on('uncaughtException', (err) => {
  winston.error(`Uncaught Exception: ${err.stack || err}`);
  if (process.env.NODE_ENV === 'development') console.error(err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  winston.info('SIGTERM received. Shutting down...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      winston.info('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

module.exports = app;
