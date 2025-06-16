// backend/middleware/security.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests
  message: 'Too many login attempts, please try again later'
});

module.exports = (app) => {
  app.use(helmet());
  app.use('/api/auth', authLimiter);
};