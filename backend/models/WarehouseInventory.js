const mongoose = require("mongoose");

const warehouseInventorySchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    minStock: {
        type: Number,
        default: 10,
    },
    batches: [
        {
            quantity: Number,
            dateIn: { type: Date, default: Date.now },
            cost: Number,
        },
    ],
    usageHistory: {
        type: [Number],
        default: [],
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

// Compound unique index - same product can't be in same warehouse twice
warehouseInventorySchema.index({ product: 1, warehouse: 1 }, { unique: true });

// Update timestamp on save
warehouseInventorySchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("WarehouseInventory", warehouseInventorySchema);
