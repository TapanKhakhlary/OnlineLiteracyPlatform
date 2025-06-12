console.log('Starting server...');
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
console.log('App type:', typeof app, 'Is function:', typeof app === 'function');
const winston = require('./config/logger');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Listen for requests
server.listen(PORT, () => {
  winston.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  return () => {
    winston.info(`${signal} received: closing HTTP server`);
    server.close(() => {
      winston.info('HTTP server closed');
      mongoose.connection.close(false, () => {
        winston.info('MongoDB connection closed');
        process.exit(0);
      });
    });
  };
};

process.on('SIGINT', gracefulShutdown('SIGINT'));
process.on('SIGTERM', gracefulShutdown('SIGTERM'));

// Handle server errors
server.on('error', (error) => {
  winston.error(`Server error: ${error.message}`);
  console.error(error);
});
