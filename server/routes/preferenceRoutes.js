const express = require("express");
const router = express.Router();

const { updatePreferences, getPreferences } = require("../controllers/preferenceController");

router.post("/update", updatePreferences);
router.get("/:userId", getPreferences);

module.exports = router;