// createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User'); // ✅ Adjust path if your model is in a different folder

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email: 'admin@gmail.com' });
    if (existing) {
      console.log('⚠️ Admin already exists:', existing.email);
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);

    const admin = new User({
      username: 'admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin user created:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
}

createAdmin();
