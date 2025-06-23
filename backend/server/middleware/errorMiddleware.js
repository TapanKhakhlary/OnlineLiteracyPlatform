const winston = require('../config/logger');
const AppError = require('../utils/appError');
const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.method} ${req.originalUrl}`, 404);
  next(error);
};
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log to console in dev
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new AppError(message, 404);
  }

  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value!`;
    error = new AppError(message, 400);
  }

  // Validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));

    const message = `Invalid input data. ${errors.map(e => e.message).join('. ')}`;
    error = new AppError(message, 400);
    error.errors = errors;
  }

  // JWT
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again!', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired! Please log in again.', 401);
  }

  // Log
  winston.error({
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user?._id || 'anonymous'
  });

  // Send
  res.status(error.statusCode || 500).json({
    status: error.status || 'error',
    message: error.message,
    code: error.statusCode || 500,
    name: error.name,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    errors: error.errors || null
  });
};

module.exports = {
  notFound,
  errorHandler
};
