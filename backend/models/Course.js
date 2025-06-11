const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  language: { type: String, default: 'English' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  resources: [
    {
      type: { type: String, enum: ['video', 'pdf', 'quiz'] },
      url: String,
      duration: Number // in minutes
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);