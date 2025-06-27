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
const cluster = require('cluster');
const os = require('os');
const crypto = require('crypto');

require('dotenv').config();
require('./config/db')();

const routes = require('./routes');
const courseRoutes = require('./routes/courseRoutes'); // ✅ Added
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const requestLogger = require('./middleware/requestLogger');
const authLimiter = require('./middleware/authLimiter');

const app = express();
const cache = apicache.middleware;

if (process.env.NODE_ENV === 'production' && cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  winston.info(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    winston.error(`Worker ${worker.process.pid} died with code ${code}`);
    cluster.fork();
  });

  return;
}

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", process.env.TRUSTED_DOMAINS || ''],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https://*.amazonaws.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", process.env.API_BASE_URL || ''],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-site" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use((req, res, next) => {
  req.id = uuidv4();
  res.set({
    'X-Request-ID': req.id,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
  });
  next();
});

app.use((req, res, next) => {
  if (toobusy()) {
    winston.warn(`Server busy: ${req.method} ${req.originalUrl}`);
    return res.status(503).json({
      status: 'error',
      message: 'Server is too busy. Try again later.',
      requestId: req.id,
      retryAfter: '30'
    });
  }
  next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => req.path === '/api/health',
  handler: (req, res) => {
    winston.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
    res.status(429).json({
      status: 'error',
      message: 'Too many requests, please try again later.',
      requestId: req.id,
      retryAfter: 15 * 60
    });
  }
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: (hits) => hits * 100,
  maxDelayMs: 5000
});

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      winston.warn(`❌ CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'x-auth-token',
    'x-request-id',
    'x-forwarded-for'
  ],
  credentials: true,
  optionsSuccessStatus: 204,
  exposedHeaders: [
    'x-auth-token',
    'x-request-id',
    'x-response-time',
    'x-rate-limit-remaining'
  ],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(compression({
  level: 6,
  threshold: '1kb',
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

app.use(responseTime());
app.use(requestLogger);

const morganFormat = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
const morganOptions = {
  stream: winston.stream,
  skip: (req) => req.path === '/api/health'
};

app.use(morgan(morganFormat, morganOptions));

app.use(express.json({
  limit: '10kb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10kb',
  parameterLimit: 50
}));

app.use(cookieParser(process.env.COOKIE_SECRET, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 86400000,
  signed: true
}));

app.use(mongoSanitize({ replaceWith: '_' }));
app.use(xss());
app.use(hpp({ whitelist: ['filter', 'sort', 'limit', 'page'] }));

if (process.env.AUTH_STRATEGY === 'session') {
  app.use(csrf({
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      signed: true
    },
    value: (req) => req.headers['x-csrf-token'] || req.body._csrf
  }));

  app.use((req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    next();
  });
}

app.get('/api/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.status(200).json({
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV,
      memoryUsage: process.memoryUsage(),
      loadAvg: process.getLoadAvg?.() || 'N/A',
      requestId: req.id
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
      error: err.message,
      requestId: req.id
    });
  }
});

const swaggerOptions = require('./config/swagger');
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: `${process.env.APP_NAME || 'API'} Documentation`,
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    defaultModelsExpandDepth: -1,
    filter: true,
    validatorUrl: null
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customfavIcon: '/public/favicon.ico'
}));

const onlyStatus200 = (req, res) => res.statusCode === 200;
const cacheSuccesses = cache('5 minutes', onlyStatus200);

app.use('/api/v1', apiLimiter, speedLimiter, cacheSuccesses, routes);
app.use('/api/courses', courseRoutes); // ✅ Add course route here
app.use('/api/v1/auth', authLimiter, require('./routes/auth'));

app.use('/public', express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build'), {
    maxAge: '1h',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'), {
      cacheControl: false,
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  });
}

app.use(notFound);
app.use(errorHandler);

process.on('unhandledRejection', (err) => {
  winston.error(`Unhandled Rejection: ${err.stack || err}`);
  if (process.env.NODE_ENV === 'development') {
    console.error('Unhandled Rejection:', err);
  }
});

process.on('uncaughtException', (err) => {
  winston.error(`Uncaught Exception: ${err.stack || err}`);
  if (process.env.NODE_ENV === 'development') {
    console.error('Uncaught Exception:', err);
  }
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  winston.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      winston.info('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  winston.info('SIGINT received. Shutting down...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      winston.info('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

module.exports = app;
