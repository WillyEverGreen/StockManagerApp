const express = require("express");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Get all transactions
router.get("/", async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const transactions = await Transaction.find()
      .populate("productId", "name sku")
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get transactions by product
router.get("/product/:productId", async (req, res) => {
  try {
    const transactions = await Transaction.find({
      productId: req.params.productId,
    }).sort({ timestamp: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
