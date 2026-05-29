const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    match: /^[a-zA-Z\s]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    type: String,
    required: true,
    match: /^\d{10}$/
  },
  dob: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        const age = new Date().getFullYear() - value.getFullYear();
        return age >= 13 && age <= 100;
      },
      message: 'Age must be between 13 and 100 years'
    }
  },
  address: {
    type: String,
    required: true,
    minlength: 10
  },
  selectedTrainer: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  subscriptionPlan: {
    type: String,
    default: 'Basic'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  avatar: {
    type: String,
    default: 'https://static.vecteezy.com/system/resources/previews/020/765/399/original/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Check if model already exists before compiling
module.exports = mongoose.models.Member || mongoose.model('Member', memberSchema);