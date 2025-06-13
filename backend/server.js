const http = require('http');
const winston = require('./config/logger');
const mongoose = require('mongoose');

console.log('✅ All setup complete. Starting HTTP server...');


let app;

try {
  app = require('./app');
  console.log('App loaded successfully');
} catch (error) {
  console.error('❌ Error loading app.js:', error.message);
  console.error(error); // 👈 Add full stack trace
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server startup error:', err.message);
  console.error(err); // 👈 Add full stack trace
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
