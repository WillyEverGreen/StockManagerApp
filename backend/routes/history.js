const express = require("express");
const MoveHistory = require("../models/MoveHistory");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Get all history
router.get("/", async (req, res) => {
  try {
    const history = await MoveHistory.find()
      .populate("user", "name email")
      .sort({ timestamp: -1 })
      .limit(100); // Limit to last 100 entries for performance
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
