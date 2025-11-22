const express = require("express");
const Product = require("../models/Product");
const WarehouseInventory = require("../models/WarehouseInventory");
const Warehouse = require("../models/Warehouse");
const MoveHistory = require("../models/MoveHistory");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Get all products (warehouse-filtered for proper isolation)
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    const user = req.user;

    // For employees: only return products in their assigned warehouse
    if (user.role === "worker") {
      if (!user.warehouse) {
        return res.json([]); // No warehouse = no products
      }

      // Get inventory items for employee's warehouse
      let inventoryQuery = { warehouse: user.warehouse._id };

      const inventoryItems = await WarehouseInventory.find(inventoryQuery)
        .populate("product", "name sku category minStock")
        .sort({ createdAt: -1 });

      // Filter by search if provided
      let results = inventoryItems;
      if (search) {
        results = inventoryItems.filter(item => {
          const product = item.product;
          if (!product) return false; // Skip items with missing product
          return (
            product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.sku.toLowerCase().includes(search.toLowerCase())
          );
        });
      }

      // Transform to match expected format (product with stock from inventory)
      // Filter out any items with null/missing products
      const productsWithStock = results
        .filter(inv => inv.product) // Only include items with valid product
        .map(inv => ({
          _id: inv.product._id,
          name: inv.product.name,
          sku: inv.product.sku,
          category: inv.product.category || "",
          minStock: inv.product.minStock,
          stock: inv.stock,
          warehouse: inv.warehouse,
          inventoryId: inv._id,
        }));

      return res.json(productsWithStock);
    }

    // For managers: only return products in their warehouses
    if (user.role === "manager") {
      // Get manager's warehouses
      const managerWarehouses = await Warehouse.find({ manager: user._id });
      const warehouseIds = managerWarehouses.map(w => w._id);

      if (warehouseIds.length === 0) {
        return res.json([]); // No warehouses = no products
      }

      // Get inventory items for manager's warehouses
      let inventoryQuery = { warehouse: { $in: warehouseIds } };

      const inventoryItems = await WarehouseInventory.find(inventoryQuery)
        .populate("product", "name sku category minStock")
        .populate("warehouse", "name location")
        .sort({ createdAt: -1 });

      // Filter by search if provided
      let results = inventoryItems;
      if (search) {
        results = inventoryItems.filter(item => {
          const product = item.product;
          if (!product) return false; // Skip items with missing product
          return (
            product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.sku.toLowerCase().includes(search.toLowerCase())
          );
        });
      }

      // Transform to match expected format
      // Filter out any items with null/missing products
      const productsWithStock = results
        .filter(inv => inv.product) // Only include items with valid product
        .map(inv => ({
          _id: inv.product._id,
          name: inv.product.name,
          sku: inv.product.sku,
          category: inv.product.category || "",
          minStock: inv.product.minStock,
          stock: inv.stock,
          warehouse: inv.warehouse,
          inventoryId: inv._id,
        }));

      return res.json(productsWithStock);
    }

    // Fallback (should not reach here)
    res.json([]);
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
    const { name, sku, stock, minStock, warehouse } = req.body;

    if (!name || !sku) {
      return res.status(400).json({ message: "Name and SKU are required" });
    }

    if (!warehouse) {
      return res.status(400).json({ message: "Warehouse assignment is required" });
    }

    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({ message: "SKU already exists" });
    }

    const product = new Product({
      name,
      sku: sku.toUpperCase(),
      minStock: minStock || 10,
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

    if (name) product.name = name;
    if (sku) product.sku = sku.toUpperCase();
    if (minStock !== undefined) product.minStock = minStock;

    await product.save();

    // Log history
    await MoveHistory.create({
      user: req.user.userId,
      action: "PRODUCT_EDIT",
      sku: product.sku,
      details: `Updated product ${product.name}`,
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete all inventory entries for this product
    await WarehouseInventory.deleteMany({ product: req.params.id });

    await Product.findByIdAndDelete(req.params.id);

    // Log history
    await MoveHistory.create({
      user: req.user.userId,
      action: "PRODUCT_DELETE",
      sku: product.sku,
      details: `Deleted product ${product.name}`,
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
