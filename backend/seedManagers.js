const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Warehouse = require("./models/Warehouse");
require("dotenv").config();

const seedManagers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Check if managers already exist
        const existingManagers = await User.find({ role: "manager" });
        if (existingManagers.length > 0) {
            console.log("Managers already exist. Skipping seed.");
            process.exit(0);
        }

        // Create 3 manager accounts
        const managers = [
            {
                email: "manager1@example.com",
                password: await bcrypt.hash("manager123", 10),
                name: "Manager One",
                role: "manager",
            },
            {
                email: "manager2@example.com",
                password: await bcrypt.hash("manager123", 10),
                name: "Manager Two",
                role: "manager",
            },
            {
                email: "manager3@example.com",
                password: await bcrypt.hash("manager123", 10),
                name: "Manager Three",
                role: "manager",
            },
        ];

        const createdManagers = await User.insertMany(managers);
        console.log("✅ Created 3 manager accounts:");
        createdManagers.forEach((manager) => {
            console.log(`   - ${manager.email} (${manager.name})`);
        });

        // Create sample warehouses
        const warehouses = [
            {
                name: "Main Warehouse",
                location: "123 Main Street, City Center",
                manager: createdManagers[0]._id,
                capacity: 10000,
            },
            {
                name: "North Warehouse",
                location: "456 North Avenue, Industrial Zone",
                manager: createdManagers[1]._id,
                capacity: 8000,
            },
            {
                name: "South Warehouse",
                location: "789 South Road, Storage District",
                manager: createdManagers[2]._id,
                capacity: 12000,
            },
        ];

        const createdWarehouses = await Warehouse.insertMany(warehouses);
        console.log("\n✅ Created 3 sample warehouses:");
        createdWarehouses.forEach((warehouse) => {
            console.log(`   - ${warehouse.name} at ${warehouse.location}`);
        });

        console.log("\n🎉 Seed completed successfully!");
        console.log("\nManager Credentials:");
        console.log("-------------------");
        console.log("Email: manager1@example.com | Password: manager123");
        console.log("Email: manager2@example.com | Password: manager123");
        console.log("Email: manager3@example.com | Password: manager123");

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedManagers();
