const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  memberName: {
    type: String,
    required: true
  },
  memberAvatar: {
    type: String,
    default: 'https://static.vecteezy.com/system/resources/previews/020/765/399/original/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Check if model already exists before compiling
module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);