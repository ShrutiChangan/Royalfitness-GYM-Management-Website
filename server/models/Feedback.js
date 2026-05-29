const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false // optional for now
  },
  feedback: {
    type: String,
    enum: ["like", "dislike"],
    required: true
  },
  foods: [
    {
      name: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Feedback", feedbackSchema);