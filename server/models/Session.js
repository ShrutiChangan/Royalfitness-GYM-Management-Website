const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  trainerId: {
    type: String,
    required: true
  },
  trainerName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 60
  },
  maxParticipants: {
    type: Number,
    default: 15
  },
  enrolledCount: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  cancelled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Check if model already exists before compiling
module.exports = mongoose.models.Session || mongoose.model('Session', sessionSchema);