const fs = require('fs');
const path = require('path');
const winston = require('winston');
const { Loggly } = require('winston-loggly-bulk');
const { combine, timestamp, printf, colorize, json, errors } = winston.format;

// Ensure logs directory exists
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] ${level}: ${stack || message}`;
});

// Base format parts
const baseFormat = [
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true })
];

// Choose format based on environment
const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: isProduction
    ? combine(...baseFormat, json())
    : combine(...baseFormat, colorize(), logFormat),

  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') })
  ],

  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') })
  ],

  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'rejections.log') })
  ]
});

// Optional: Loggly transport in production
if (isProduction && process.env.LOGGLY_TOKEN && process.env.LOGGLY_SUBDOMAIN) {
  logger.add(new Loggly({
    token: process.env.LOGGLY_TOKEN,
    subdomain: process.env.LOGGLY_SUBDOMAIN,
    tags: ['literacy-platform-api'],
    json: true
  }));
}

// Stream support for morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;
