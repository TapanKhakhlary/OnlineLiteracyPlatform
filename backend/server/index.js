require('dotenv').config();
const mongoose = require('mongoose');
const winston = require('./config/logger');

const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

let app;
try {
  app = require('./app');
} catch (err) {
  winston.error('❌ Failed to load application:', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
}

// Database connection with retry logic
async function connectDB() {
  try {
    if (mongoose.connection.readyState === 0) { // Only connect if not already connected
      winston.info('🔄 Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGO_URI, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      winston.info('✅ MongoDB connected successfully');
    }
  } catch (err) {
    winston.error('❌ MongoDB connection failed:', {
      error: err.message,
      stack: err.stack
    });
    throw err;
  }
}

async function startServer() {
  try {
    await connectDB();
    
    const server = app.listen(PORT, () => {
      winston.info(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        winston.error(`❌ Port ${PORT} is already in use`);
      } else {
        winston.error('❌ Server error:', err);
      }
      process.exit(1);
    });

    // Process handlers remain the same...
    process.on('unhandledRejection', (err) => {
      winston.error('❌ Unhandled rejection:', {
        error: err.message,
        stack: err.stack
      });
      if (server) server.close(() => process.exit(1));
    });

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    function gracefulShutdown() {
      winston.info('🛑 Received shutdown signal');
      server.close(() => {
        mongoose.connection.close(false)
          .then(() => {
            winston.info('✅ All connections closed');
            process.exit(0);
          })
          .catch((err) => {
            winston.error('❌ Error closing connections:', err);
            process.exit(1);
          });
      });
    }

  } catch (err) {
    winston.error('❌ Startup failed:', {
      error: err.message,
      stack: err.stack
    });
    process.exit(1);
  }
}

startServer();