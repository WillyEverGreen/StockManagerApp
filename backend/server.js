const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const stockRoutes = require("./routes/stock");
const transactionRoutes = require("./routes/transactions");
const historyRoutes = require("./routes/history");
const warehouseRoutes = require("./routes/warehouses");
const employeeRoutes = require("./routes/employees");

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/stock", stockRoutes);
app.use("/transactions", transactionRoutes);
app.use("/history", historyRoutes);
app.use("/warehouses", warehouseRoutes);
app.use("/employees", employeeRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "StockManager API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Backend Error:", err);
  res.status(500).json({ error: err.message });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
