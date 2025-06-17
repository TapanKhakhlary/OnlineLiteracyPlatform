require('dotenv').config();
const mongoose = require('mongoose');
const winston = require('./config/logger');

let app;
try {
  app = require('./app'); // Catch if app.js fails
} catch (err) {
  winston.error('❌ Error loading app.js:', err);
  console.error(err); // Show full error stack
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    winston.info('🔄 Connecting to MongoDB...');
    require('./config/db')();

    const server = app.listen(PORT, () => {
      winston.info(`🚀 Server is running on port ${PORT}`);
    });

    process.on('unhandledRejection', (err) => {
      winston.error(`❌ Unhandled Rejection: ${err.stack || err}`);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err) => {
      winston.error(`❌ Uncaught Exception: ${err.stack || err}`);
      process.exit(1);
    });

    process.on('SIGTERM', () => {
      winston.info('👋 SIGTERM received. Shutting down...');
      server.close(() => {
        mongoose.connection.close(false, () => {
          winston.info('🛑 MongoDB connection closed.');
          process.exit(0);
        });
      });
    });

  } catch (err) {
    winston.error('❌ Startup error:', err);
    process.exit(1);
  }
})();
