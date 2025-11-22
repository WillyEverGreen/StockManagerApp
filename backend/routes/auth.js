const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const MoveHistory = require("../models/MoveHistory");

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate
    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password, selectedRole } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Normalize email to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email: normalizedEmail }).populate("warehouse", "name location");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Validate role if selectedRole is provided
    if (selectedRole) {
      const roleMap = {
        manager: "manager",
        employee: "worker",
      };

      const expectedRole = roleMap[selectedRole];
      if (expectedRole && user.role !== expectedRole) {
        return res.status(403).json({
          message: `You are not registered as a ${selectedRole}. Please select the correct role.`
        });
      }
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    // Log history
    await MoveHistory.create({
      user: user._id,
      action: "LOGIN",
      details: "User logged in",
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        warehouse: user.warehouse,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
