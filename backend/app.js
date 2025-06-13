const mongoose = require('mongoose');
console.log('Starting server...');
require('dotenv').config(); // Automatically loads `.env` by default

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
console.log('📦 Loading DB connection...');

// Database connection
require('./config/db')();

// Import routes
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const requestLogger = require('./middleware/requestLogger');

const app = express();

// === 1. SECURITY & PERFORMANCE ===
app.use('/api', routes);
app.set('trust proxy', 1);

app.use((req, res, next) => {
  if (toobusy()) {
    return res.status(503).json({ status: 'error', message: 'Server is too busy right now, please try again later' });
  }
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com', 'cdnjs.cloudflare.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com', 'cdnjs.cloudflare.com'],
      imgSrc: ["'self'", 'data:', 'blob:', '*.cloudinary.com'],
      connectSrc: ["'self'", '*.cloudinary.com']
    }
  },
  crossOriginEmbedderPolicy: false
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 100,
  delayMs: () => 500
});

const corsOptions = {
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-auth-token'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400,
  exposedHeaders: ['x-auth-token', 'x-request-id']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(requestLogger);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: winston.stream }));
}

app.use(responseTime());

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(mongoSanitize());
app.use(xss());

app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price', 'limit', 'page', 'sort']
}));

app.use(compression());

if (process.env.AUTH_STRATEGY === 'session') {
  app.use(csrf({ cookie: true }));
}

// === 2. SWAGGER DOCS ===

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Online Literacy Platform API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for the Online Literacy Platform',
      contact: {
        name: 'API Support',
        url: 'https://support.literacyplatform.com',
        email: 'api-support@literacyplatform.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000/api/v1',
        description: `${process.env.NODE_ENV || 'development'} server`
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'sessionId' }
      },
      responses: {
        UnauthorizedError: { description: 'Access token is missing or invalid' },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            username: { type: 'string', example: 'johndoe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { type: 'string', enum: ['student', 'teacher', 'admin'], default: 'student' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['fail', 'error'], example: 'fail' },
            message: { type: 'string', example: 'Error message describing the issue' },
            code: { type: 'integer', example: 400 },
            stack: { type: 'string', example: 'Error stack trace (development only)' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Authentication', description: 'User registration and authentication' },
      { name: 'Users', description: 'User management operations' },
      { name: 'Courses', description: 'Course management operations' },
      { name: 'Lessons', description: 'Lesson management operations' }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js', './models/*.js', './docs/*.yaml']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// === 3. ROUTES ===

app.get('/api/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0', // ✅ fallback added
    memoryUsage: process.memoryUsage()
  };

  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = error;
    res.status(503).json(healthcheck);
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'Literacy Platform API',
  customCss: `.swagger-ui .topbar { display: none } .swagger-ui .information-container { background: #fafafa; padding: 20px }`,
  customfavIcon: '/public/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    defaultModelsExpandDepth: -1,
    defaultModelExpandDepth: 3,
    docExpansion: 'list',
    filter: true
  }
}));

app.use('/api/v1', apiLimiter, speedLimiter, routes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// === 4. ERROR HANDLING ===

app.use(notFound);
app.use(errorHandler);

process.on('unhandledRejection', (err) => {
  winston.error(`Unhandled Rejection: ${err.message}`);
  if (process.env.NODE_ENV === 'development') console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  winston.error(`Uncaught Exception: ${err.message}`);
  if (process.env.NODE_ENV === 'development') console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
