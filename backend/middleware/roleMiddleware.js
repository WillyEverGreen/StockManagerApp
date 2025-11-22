const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT token and attach user to request
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).populate("warehouse");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// Require manager role
const requireManager = (req, res, next) => {
    if (req.user.role !== "manager") {
        return res.status(403).json({
            message: "Access denied. Manager role required."
        });
    }
    next();
};

// Require employee role
const requireEmployee = (req, res, next) => {
    if (req.user.role !== "worker") {
        return res.status(403).json({
            message: "Access denied. Employee role required."
        });
    }
    next();
};

// Validate warehouse access (employees can only access their assigned warehouse)
const requireWarehouseAccess = (warehouseIdParam = "warehouseId") => {
    return (req, res, next) => {
        const requestedWarehouseId = req.params[warehouseIdParam] || req.body.warehouse;

        // Managers have access to all warehouses
        if (req.user.role === "manager") {
            return next();
        }

        // Employees must have a warehouse assigned
        if (!req.user.warehouse) {
            return res.status(403).json({
                message: "You are not assigned to any warehouse"
            });
        }

        // Check if employee is accessing their assigned warehouse
        if (requestedWarehouseId && req.user.warehouse._id.toString() !== requestedWarehouseId.toString()) {
            return res.status(403).json({
                message: "Access denied. You can only access your assigned warehouse."
            });
        }

        next();
    };
};

module.exports = {
    authMiddleware,
    requireManager,
    requireEmployee,
    requireWarehouseAccess,
};
