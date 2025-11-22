const express = require("express");
const User = require("../models/User");
const Warehouse = require("../models/Warehouse");
const MoveHistory = require("../models/MoveHistory");
const { authMiddleware, requireManager } = require("../middleware/roleMiddleware");

const router = express.Router();

// All employee management routes require authentication and manager role
router.use(authMiddleware);
router.use(requireManager);

// Get all employees
router.get("/", async (req, res) => {
    try {
        const { warehouse, assigned } = req.query;

        let query = { role: "worker" };

        // Filter by warehouse if provided
        if (warehouse) {
            query.warehouse = warehouse;
        }

        // Filter by assignment status
        if (assigned === "true") {
            query.warehouse = { $ne: null };
        } else if (assigned === "false") {
            query.warehouse = null;
        }

        const employees = await User.find(query)
            .select("-password")
            .populate("warehouse", "name location")
            .populate("assignedBy", "name email")
            .sort({ createdAt: -1 });

        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get single employee
router.get("/:id", async (req, res) => {
    try {
        const employee = await User.findOne({
            _id: req.params.id,
            role: "worker"
        })
            .select("-password")
            .populate("warehouse", "name location")
            .populate("assignedBy", "name email");

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Assign employee to warehouse
router.post("/assign", async (req, res) => {
    try {
        const { employeeId, warehouseId } = req.body;

        if (!employeeId || !warehouseId) {
            return res.status(400).json({
                message: "Employee ID and Warehouse ID are required"
            });
        }

        // Verify employee exists and is a worker
        const employee = await User.findOne({
            _id: employeeId,
            role: "worker"
        });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Verify warehouse exists and belongs to this manager
        const warehouse = await Warehouse.findOne({
            _id: warehouseId,
            manager: req.user._id
        });

        if (!warehouse) {
            return res.status(404).json({
                message: "Warehouse not found or you don't have permission to assign to this warehouse"
            });
        }

        // Update employee assignment
        employee.warehouse = warehouseId;
        employee.assignedBy = req.user._id;
        employee.assignedAt = new Date();
        await employee.save();

        // Log the assignment
        await MoveHistory.create({
            user: req.user._id,
            action: "EMPLOYEE_ASSIGNED",
            details: `Assigned ${employee.name} to ${warehouse.name}`,
        });

        await employee.populate("warehouse", "name location");
        await employee.populate("assignedBy", "name email");

        res.json({
            message: "Employee assigned successfully",
            employee: {
                id: employee._id,
                name: employee.name,
                email: employee.email,
                warehouse: employee.warehouse,
                assignedBy: employee.assignedBy,
                assignedAt: employee.assignedAt,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Unassign employee from warehouse
router.post("/unassign/:id", async (req, res) => {
    try {
        const employee = await User.findOne({
            _id: req.params.id,
            role: "worker"
        });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        if (!employee.warehouse) {
            return res.status(400).json({
                message: "Employee is not assigned to any warehouse"
            });
        }

        const previousWarehouse = await Warehouse.findById(employee.warehouse);

        // Unassign employee
        employee.warehouse = null;
        employee.assignedBy = null;
        employee.assignedAt = null;
        await employee.save();

        // Log the unassignment
        await MoveHistory.create({
            user: req.user._id,
            action: "EMPLOYEE_UNASSIGNED",
            details: `Unassigned ${employee.name} from ${previousWarehouse?.name || "warehouse"}`,
        });

        res.json({
            message: "Employee unassigned successfully",
            employee: {
                id: employee._id,
                name: employee.name,
                email: employee.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Update employee details
router.put("/:id", async (req, res) => {
    try {
        const { name, email } = req.body;

        const employee = await User.findOne({
            _id: req.params.id,
            role: "worker"
        });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Update fields
        if (name) employee.name = name;
        if (email) {
            // Check if email is already taken
            const existingUser = await User.findOne({
                email,
                _id: { $ne: req.params.id }
            });
            if (existingUser) {
                return res.status(400).json({ message: "Email already in use" });
            }
            employee.email = email;
        }

        await employee.save();
        await employee.populate("warehouse", "name location");

        res.json({
            message: "Employee updated successfully",
            employee: {
                id: employee._id,
                name: employee.name,
                email: employee.email,
                warehouse: employee.warehouse,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Delete employee
router.delete("/:id", async (req, res) => {
    try {
        const employee = await User.findOne({
            _id: req.params.id,
            role: "worker"
        });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        await User.findByIdAndDelete(req.params.id);

        // Log the deletion
        await MoveHistory.create({
            user: req.user._id,
            action: "EMPLOYEE_DELETED",
            details: `Deleted employee ${employee.name}`,
        });

        res.json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get employee activity log
router.get("/:id/activity", async (req, res) => {
    try {
        const employee = await User.findOne({
            _id: req.params.id,
            role: "worker"
        });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const activities = await MoveHistory.find({ user: req.params.id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
