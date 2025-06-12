const winston = require('winston');

module.exports = function(err, req, res, next) {
  // Log the exception
  winston.error(err.message, err);

  // Send appropriate response
  res.status(500).json({
    success: false,
    message: 'Something failed on the server',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};