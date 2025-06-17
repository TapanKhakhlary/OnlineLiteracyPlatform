const winston = require('../config/logger');
const AppError = require('../utils/appError');

// Handle 404 errors
const notFound = (req, res, next) => {
  const error = new AppError(
    `Not found - ${req.method} ${req.originalUrl}`, 
    404
  );
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log to console for dev
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value!`;
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    const message = `Invalid input data. ${messages.join('. ')}`;
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again!';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired! Please log in again.';
    error = new AppError(message, 401);
  }

  // Log error to winston
  winston.error({
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user?._id || 'anonymous'
  });

  // Send error response
  res.status(error.statusCode || 500).json({
    status: error.status || 'error',
    message: error.message,
    code: error.statusCode || 500,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    errors: error.errors
  });
};

module.exports = {
  notFound,
  errorHandler
};