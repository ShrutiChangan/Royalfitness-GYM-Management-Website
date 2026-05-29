const UserPreference = require("../models/UserPreference");

// Save like/dislike
const updatePreferences = async (req, res) => {
  try {
    const { userId, foodName, action } = req.body;

    if (!userId || !foodName || !action) {
      return res.status(400).json({ error: "Missing fields" });
    }

    let userPref = await UserPreference.findOne({ userId });

    if (!userPref) {
      userPref = new UserPreference({ userId });
    }

    if (action === "like") {
      if (!userPref.likedFoods.includes(foodName)) {
        userPref.likedFoods.push(foodName);
      }
      userPref.dislikedFoods = userPref.dislikedFoods.filter(f => f !== foodName);
    }

    if (action === "dislike") {
      if (!userPref.dislikedFoods.includes(foodName)) {
        userPref.dislikedFoods.push(foodName);
      }
      userPref.likedFoods = userPref.likedFoods.filter(f => f !== foodName);
    }

    await userPref.save();

    res.json({ success: true, data: userPref });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get preferences
const getPreferences = async (req, res) => {
  try {
    const { userId } = req.params;

    const userPref = await UserPreference.findOne({ userId });

    res.json({
      success: true,
      data: userPref || { likedFoods: [], dislikedFoods: [] }
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { updatePreferences, getPreferences };