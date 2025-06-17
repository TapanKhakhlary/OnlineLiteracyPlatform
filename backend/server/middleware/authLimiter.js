const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per window
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again later'
  },
  skipSuccessfulRequests: true // Only count failed attempts
});

module.exports = authLimiter;