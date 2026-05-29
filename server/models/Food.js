const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  type: { type: String, enum: ["veg", "non-veg"] },
  mealType: [String],
});

module.exports = mongoose.model("Food", foodSchema);