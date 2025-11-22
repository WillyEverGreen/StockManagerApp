const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  minStock: {
    type: Number,
    required: true,
    default: 10,
  },
  batches: [
    {
      quantity: Number,
      dateIn: { type: Date, default: Date.now },
      cost: Number,
    },
  ],
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    default: null,
  },
  usageHistory: {
    type: [Number],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
