const mongoose = require("mongoose");

const userPreferenceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  likedFoods: {
    type: [String],
    default: []
  },
  dislikedFoods: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model("UserPreference", userPreferenceSchema);