const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Links to Firebase auth
  bio: String,
  subjects: [String],
  availability: {
    days: [String], // ['Monday', 'Wednesday']
    hours: String   // '9am-5pm'
  },
  students: [{
    studentId: String,
    progress: Number // 0-100%
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Teacher', teacherSchema);