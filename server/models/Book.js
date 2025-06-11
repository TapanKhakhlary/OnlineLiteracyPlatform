const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  genre: {
    type: String,
    enum: ['fiction', 'non-fiction', 'poetry', 'drama'],
    required: true
  },
  vocabulary: [{
    word: String,
    definition: String
  }],
  questions: [{
    question: String,
    options: [String],
    answer: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Book', BookSchema);