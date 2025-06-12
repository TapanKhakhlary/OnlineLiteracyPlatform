require('dotenv').config();
const connectDB = require('./config/db');

connectDB().then(() => {
  console.log('✅ Database connected successfully!');
}).catch((err) => {
  console.error('❌ Database connection failed:', err);
});
