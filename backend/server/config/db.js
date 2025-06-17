const mongoose = require('mongoose');
const logger = require('./logger'); // Use main logger for consistency

const connectDB = async () => {
  try {
    logger.info('🔄 Connecting to MongoDB...');
    if (!process.env.MONGO_URI) {
      logger.error('❌ MONGO_URI not found in environment variables');
      process.exit(1);
    }

    // Add a connection timeout for faster failure if MongoDB is unreachable
    const uriWithTimeout = process.env.MONGO_URI.includes('connectTimeoutMS')
      ? process.env.MONGO_URI
      : process.env.MONGO_URI + (process.env.MONGO_URI.includes('?') ? '&' : '?') + 'connectTimeoutMS=5000';

    logger.info(`MONGO_URI: ${uriWithTimeout}`); // Debug: print URI (remove in production)
    await mongoose.connect(uriWithTimeout);
    logger.info('✅ MongoDB Connected...');
  } catch (err) {
    logger.error('❌ MongoDB connection error: ' + err.message);
    logger.error(err); // Log full error object for debugging
    process.exit(1);
  }
};

module.exports = connectDB;