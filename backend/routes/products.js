const express = require("express");
const Product = require("../models/Product");
const MoveHistory = require("../models/MoveHistory");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Get all products
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { sku: { $regex: search, $options: "i" } },
        ],
      };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create product
router.post("/", async (req, res) => {
  try {
    const { name, sku, stock, minStock } = req.body;

    if (!name || !sku) {
      return res.status(400).json({ message: "Name and SKU are required" });
    }

    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({ message: "SKU already exists" });
    }

    const product = new Product({
      name,
      sku: sku.toUpperCase(),
      stock: stock || 0,
      minStock: minStock || 10,
      batches: stock > 0 ? [{ quantity: stock, dateIn: new Date() }] : [],
    });

    await product.save();

    // Log history
    await MoveHistory.create({
      user: req.user.userId,
      action: "PRODUCT_CREATE",
      sku: product.sku,
      details: `Created product ${name}`,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update product
router.put("/:id", async (req, res) => {
  try {
    const { name, sku, stock, minStock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if SKU is being changed and if it's already taken
    if (sku && sku.toUpperCase() !== product.sku) {
      const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
      if (existingProduct) {
        return res.status(400).json({ message: "SKU already exists" });
      }
    }

    product.name = name || product.name;
    product.sku = sku ? sku.toUpperCase() : product.sku;
    product.stock = stock !== undefined ? stock : product.stock;
    product.minStock = minStock !== undefined ? minStock : product.minStock;

    await product.save();

    // Log history
    await MoveHistory.create({
      user: req.user.userId,
      action: "PRODUCT_UPDATE",
      sku: product.sku,
      details: `Updated product details`,
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
