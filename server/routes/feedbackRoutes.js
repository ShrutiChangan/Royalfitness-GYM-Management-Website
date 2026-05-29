const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

// POST /api/feedback
router.post("/", async (req, res) => {
  try {
    const { feedback, dietPlan } = req.body;

    if (!feedback || !dietPlan) {
      return res.status(400).json({ success: false, error: "Missing data" });
    }

    // Extract all food names from meals
    const foods = [];

    Object.values(dietPlan.meals || {}).forEach(meal => {
      meal.forEach(item => {
        foods.push({ name: item.name });
      });
    });

    const newFeedback = new Feedback({
      feedback,
      foods
    });

    await newFeedback.save();

    res.json({ success: true });

  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;