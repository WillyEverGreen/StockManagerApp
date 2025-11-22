const express = require("express");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const MoveHistory = require("../models/MoveHistory");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Stock In (Receipt)
router.post("/in", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update stock
    product.stock += parseInt(quantity);

    // Add batch (FIFO)
    product.batches.push({
      quantity: parseInt(quantity),
      dateIn: new Date(),
    });

    await product.save();

    // Create transaction
    const transaction = new Transaction({
      productId,
      type: "in",
      quantity: parseInt(quantity),
      productName: product.name,
      productSku: product.sku,
    });
    await transaction.save();

    // Log history
    await MoveHistory.create({
      user: req.user.userId, // Assuming auth middleware adds user info
      action: "STOCK_IN",
      sku: product.sku,
      details: `Added ${quantity} units`,
    });

    res.json({
      message: "Stock added successfully",
      product,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Stock Out (Delivery)
router.post("/out", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if enough stock
    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Insufficient stock",
        available: product.stock,
      });
    }

    // FIFO Logic: Deduct from oldest batches
    let remainingQty = parseInt(quantity);

    // Sort batches by date (oldest first) just in case
    product.batches.sort((a, b) => new Date(a.dateIn) - new Date(b.dateIn));

    const newBatches = [];
    for (const batch of product.batches) {
      if (remainingQty <= 0) {
        newBatches.push(batch);
        continue;
      }

      if (batch.quantity > remainingQty) {
        batch.quantity -= remainingQty;
        remainingQty = 0;
        newBatches.push(batch);
      } else {
        remainingQty -= batch.quantity;
        // Batch fully used, don't push to newBatches
      }
    }
    product.batches = newBatches;

    // Update total stock
    product.stock -= parseInt(quantity);

    // Update usage history (keep last 10 for prediction)
    product.usageHistory.push(parseInt(quantity));
    if (product.usageHistory.length > 10) {
      product.usageHistory = product.usageHistory.slice(-10);
    }

    await product.save();

    // Create transaction
    const transaction = new Transaction({
      productId,
      type: "out",
      quantity: parseInt(quantity),
      productName: product.name,
      productSku: product.sku,
    });
    await transaction.save();

    // Log history
    await MoveHistory.create({
      user: req.user.userId,
      action: "STOCK_OUT",
      sku: product.sku,
      details: `Removed ${quantity} units (FIFO applied)`,
    });

    res.json({
      message: "Stock removed successfully",
      product,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
