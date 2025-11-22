const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  type: {
    type: String,
    enum: ["in", "out"],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  productName: {
    type: String,
  },
  productSku: {
    type: String,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
