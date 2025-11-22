const express = require("express");
const Warehouse = require("../models/Warehouse");
const User = require("../models/User");
const Product = require("../models/Product");
const { authMiddleware, requireManager } = require("../middleware/roleMiddleware");

const router = express.Router();

// All warehouse routes require authentication and manager role
router.use(authMiddleware);
router.use(requireManager);

// Get all warehouses
router.get("/", async (req, res) => {
    try {
        const warehouses = await Warehouse.find()
            .populate("manager", "name email")
            .sort({ createdAt: -1 });

        res.json(warehouses);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get single warehouse
router.get("/:id", async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id)
            .populate("manager", "name email");

        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse not found" });
        }

        res.json(warehouse);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Create new warehouse
router.post("/", async (req, res) => {
    try {
        const { name, location, manager, capacity } = req.body;

        // Validate required fields
        if (!name || !location || !manager) {
            return res.status(400).json({
                message: "Name, location, and manager are required"
            });
        }

        // Verify manager exists and has manager role
        const managerUser = await User.findById(manager);
        if (!managerUser || managerUser.role !== "manager") {
            return res.status(400).json({
                message: "Invalid manager ID"
            });
        }

        const warehouse = new Warehouse({
            name,
            location,
            manager,
            capacity: capacity || 0,
        });

        await warehouse.save();
        await warehouse.populate("manager", "name email");

        res.status(201).json(warehouse);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Update warehouse
router.put("/:id", async (req, res) => {
    try {
        const { name, location, manager, capacity, isActive } = req.body;

        const warehouse = await Warehouse.findById(req.params.id);
        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse not found" });
        }

        // Update fields
        if (name) warehouse.name = name;
        if (location) warehouse.location = location;
        if (capacity !== undefined) warehouse.capacity = capacity;
        if (isActive !== undefined) warehouse.isActive = isActive;

        if (manager) {
            const managerUser = await User.findById(manager);
            if (!managerUser || managerUser.role !== "manager") {
                return res.status(400).json({ message: "Invalid manager ID" });
            }
            warehouse.manager = manager;
        }

        await warehouse.save();
        await warehouse.populate("manager", "name email");

        res.json(warehouse);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Delete warehouse
router.delete("/:id", async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);
        if (!warehouse) {
            return res.status(404).json({ message: "Warehouse not found" });
        }

        // Check if warehouse has assigned employees
        const assignedEmployees = await User.countDocuments({ warehouse: req.params.id });
        if (assignedEmployees > 0) {
            return res.status(400).json({
                message: `Cannot delete warehouse. ${assignedEmployees} employee(s) are still assigned to it.`
            });
        }

        // Check if warehouse has products
        const products = await Product.countDocuments({ warehouse: req.params.id });
        if (products > 0) {
            return res.status(400).json({
                message: `Cannot delete warehouse. ${products} product(s) are still stored in it.`
            });
        }

        await Warehouse.findByIdAndDelete(req.params.id);
        res.json({ message: "Warehouse deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get employees assigned to warehouse
router.get("/:id/employees", async (req, res) => {
    try {
        const employees = await User.find({
            warehouse: req.params.id,
            role: "worker"
        })
            .select("-password")
            .populate("assignedBy", "name email")
            .sort({ assignedAt: -1 });

        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get warehouse inventory
router.get("/:id/inventory", async (req, res) => {
    try {
        const products = await Product.find({ warehouse: req.params.id })
            .sort({ name: 1 });

        const totalItems = products.length;
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
        const lowStockItems = products.filter(p => p.stock <= p.minStock).length;

        res.json({
            products,
            stats: {
                totalItems,
                totalStock,
                lowStockItems,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
