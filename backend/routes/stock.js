const express = require("express");
const Product = require("../models/Product");
const WarehouseInventory = require("../models/WarehouseInventory");
const Transaction = require("../models/Transaction");
const MoveHistory = require("../models/MoveHistory");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Stock In (Receipt) - Now requires warehouseId
router.post("/in", async (req, res) => {
  try {
    const { productId, warehouseId, quantity } = req.body;

    if (!productId || !warehouseId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Product ID, Warehouse ID, and valid quantity are required" });
    }

    // Find or create warehouse inventory entry
    let inventory = await WarehouseInventory.findOne({
      product: productId,
      warehouse: warehouseId,
    }).populate("product", "name sku");

    if (!inventory) {
      // Product doesn't exist in this warehouse yet, create new inventory entry
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      inventory = new WarehouseInventory({
        product: productId,
        warehouse: warehouseId,
        stock: 0,
        minStock: product.minStock || 10,
        batches: [],
        usageHistory: [],
      });
    }

    // Update stock
    inventory.stock += parseInt(quantity);

    // Add batch (FIFO)
    inventory.batches.push({
      quantity: parseInt(quantity),
      dateIn: new Date(),
    });

    await inventory.save();
    await inventory.populate("product", "name sku");

    // Create transaction
    const transaction = new Transaction({
      productId,
      type: "in",
      quantity: parseInt(quantity),
      productName: inventory.product.name,
      productSku: inventory.product.sku,
    });
    await transaction.save();

    // Log history
    await MoveHistory.create({
      user: req.user.userId,
      action: "STOCK_IN",
      sku: inventory.product.sku,
      details: `Added ${quantity} units to warehouse`,
    });

    res.json({
      message: "Stock added successfully",
      inventory,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Stock Out (Delivery) - Now requires warehouseId
router.post("/out", async (req, res) => {
  try {
    const { productId, warehouseId, quantity } = req.body;

    if (!productId || !warehouseId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Product ID, Warehouse ID, and valid quantity are required" });
    }

    const inventory = await WarehouseInventory.findOne({
      product: productId,
      warehouse: warehouseId,
    }).populate("product", "name sku");

    if (!inventory) {
      return res.status(404).json({ message: "Product not found in this warehouse" });
    }

    // Check if enough stock
    if (inventory.stock < quantity) {
      return res.status(400).json({
        message: "Insufficient stock",
        available: inventory.stock,
      });
    }

    // FIFO Logic: Deduct from oldest batches
    let remainingQty = parseInt(quantity);

    // Sort batches by date (oldest first)
    inventory.batches.sort((a, b) => new Date(a.dateIn) - new Date(b.dateIn));

    const newBatches = [];
    for (const batch of inventory.batches) {
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
    inventory.batches = newBatches;

    // Update total stock
    inventory.stock -= parseInt(quantity);

    // Update usage history (keep last 10 for prediction)
    inventory.usageHistory.push(parseInt(quantity));
    if (inventory.usageHistory.length > 10) {
      inventory.usageHistory = inventory.usageHistory.slice(-10);
    }

    await inventory.save();

    // Create transaction
    const transaction = new Transaction({
      productId,
      type: "out",
      quantity: parseInt(quantity),
      productName: inventory.product.name,
      productSku: inventory.product.sku,
    });
    await transaction.save();

    // Log history
    await MoveHistory.create({
      user: req.user.userId,
      action: "STOCK_OUT",
      sku: inventory.product.sku,
      details: `Removed ${quantity} units from warehouse (FIFO applied)`,
    });

    res.json({
      message: "Stock removed successfully",
      inventory,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
