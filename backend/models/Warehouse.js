const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    capacity: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt timestamp before saving
warehouseSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("Warehouse", warehouseSchema);
