const express = require("express");
const router = express.Router();
const { generateDietController } = require("../controllers/dietController");

router.post("/generate-diet", generateDietController);

module.exports = router;