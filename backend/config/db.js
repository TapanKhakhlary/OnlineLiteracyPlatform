const mongoose = require('mongoose');
const winston = require('winston');

// ✅ Setup Winston properly with Console transport
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // ✅ no options needed in Mongoose 6+
    logger.info('✅ MongoDB Connected...');
  } catch (err) {
    logger.error('❌ MongoDB connection error: ' + err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
