const mongoose = require("mongoose");
const User = require("./models/User");
const Warehouse = require("./models/Warehouse");
require("dotenv").config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/stockmanager");
        console.log("Connected to MongoDB");

        const email = "employee1@gmail.com";
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found.`);
        } else {
            console.log("User found:", user);
            if (user.warehouse) {
                console.log("Assigned Warehouse ID:", user.warehouse);
                const warehouse = await Warehouse.findById(user.warehouse);
                if (warehouse) {
                    console.log("Warehouse exists:", warehouse.name);
                } else {
                    console.log("❌ Warehouse NOT found in database (Dangling Reference).");
                    console.log("Fixing user...");
                    user.warehouse = null;
                    user.assignedBy = null;
                    user.assignedAt = null;
                    await user.save();
                    console.log("✅ User unassigned. Please re-assign via Manager Dashboard.");
                }
            } else {
                console.log("User has no warehouse assigned.");
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkUser();
