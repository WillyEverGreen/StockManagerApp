const mongoose = require("mongoose");

const moveHistorySchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      "STOCK_IN",
      "STOCK_OUT",
      "PRODUCT_UPDATE",
      "PRODUCT_CREATE",
      "LOGIN",
      "LOGOUT",
      "SETTINGS_CHANGE",
    ],
  },
  sku: {
    type: String,
  },
  details: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MoveHistory", moveHistorySchema);
