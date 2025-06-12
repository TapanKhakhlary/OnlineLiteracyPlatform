const winston = require('../config/logger');

module.exports = (req, res, next) => {
  // Skip logging for health checks and static files
  if (req.path === '/api/health' || req.path.startsWith('/static')) {
    return next();
  }

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    winston.info({
      message: 'Request completed',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user?._id || 'anonymous'
    });
  });

  next();
};