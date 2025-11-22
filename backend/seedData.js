const mongoose = require("mongoose");
const User = require("./models/User");
const Warehouse = require("./models/Warehouse");
const Product = require("./models/Product");
const MoveHistory = require("./models/MoveHistory");
const Transaction = require("./models/Transaction");
require("dotenv").config();

const categories = [
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Sports",
    "Toys",
    "Books",
    "Automotive",
    "Beauty",
    "Health",
    "Groceries",
];

const productNames = {
    Electronics: ["Smartphone", "Laptop", "Headphones", "Smart Watch", "Tablet", "Camera", "Speaker", "Monitor", "Keyboard", "Mouse"],
    Clothing: ["T-Shirt", "Jeans", "Jacket", "Sneakers", "Dress", "Hat", "Socks", "Sweater", "Shorts", "Scarf"],
    "Home & Garden": ["Sofa", "Lamp", "Table", "Chair", "Plant Pot", "Rug", "Curtains", "Bed Sheet", "Pillow", "Mirror"],
    Sports: ["Football", "Basketball", "Tennis Racket", "Yoga Mat", "Dumbbell", "Running Shoes", "Bike", "Helmet", "Jersey", "Water Bottle"],
    Toys: ["Action Figure", "Doll", "Puzzle", "Board Game", "Toy Car", "Lego Set", "Plush Bear", "Drone", "Kite", "Yo-Yo"],
    Books: ["Novel", "Textbook", "Comic Book", "Magazine", "Cookbook", "Biography", "Dictionary", "Atlas", "Notebook", "Planner"],
    Automotive: ["Car Wax", "Tire Inflator", "Oil Filter", "Wiper Blades", "Car Mat", "Air Freshener", "Jump Starter", "Seat Cover", "Phone Mount", "Tool Kit"],
    Beauty: ["Lipstick", "Mascara", "Foundation", "Perfume", "Nail Polish", "Shampoo", "Conditioner", "Face Cream", "Body Lotion", "Sunscreen"],
    Health: ["Vitamins", "Protein Powder", "Bandages", "Thermometer", "Face Mask", "Hand Sanitizer", "Pain Reliever", "First Aid Kit", "Blood Pressure Monitor", "Scale"],
    Groceries: ["Rice", "Pasta", "Cereal", "Coffee", "Tea", "Sugar", "Flour", "Olive Oil", "Canned Soup", "Snacks"],
};

const generateRandomProduct = (warehouseId) => {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const name = productNames[category][Math.floor(Math.random() * productNames[category].length)];

    // Use timestamp + random to ensure uniqueness
    const uniqueSuffix = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
    const sku = `${category.substring(0, 3).toUpperCase()}-${uniqueSuffix}`;
    const stock = Math.floor(Math.random() * 200);

    // Generate usage history (last 7 days of usage)
    const usageHistory = [];
    for (let i = 0; i < 7; i++) {
        usageHistory.push(Math.floor(Math.random() * 10)); // 0-9 items used per day
    }

    return {
        name: `${name} ${Math.floor(Math.random() * 100)}`,
        sku: sku,
        stock: stock,
        minStock: Math.floor(Math.random() * 20) + 5,
        warehouse: warehouseId,
        // category removed as it is not in schema
        batches: stock > 0 ? [{ quantity: stock, dateIn: new Date(), cost: Math.floor(Math.random() * 100) + 10 }] : [],
        usageHistory: usageHistory,
    };
};

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/stockmanager");
        console.log("Connected to MongoDB");

        // Clear existing data
        await Warehouse.deleteMany({});
        await Product.deleteMany({});
        await MoveHistory.deleteMany({});
        await Transaction.deleteMany({}); // Clear transactions too
        console.log("Cleared existing warehouses, products, history, and transactions.");

        const managers = await User.find({ role: "manager" });
        if (managers.length === 0) {
            console.log("No managers found. Please run seedManagers.js first.");
            process.exit(1);
        }

        console.log(`Found ${managers.length} managers.`);

        for (const manager of managers) {
            console.log(`\nProcessing Manager: ${manager.name} (${manager.email})`);

            for (let i = 1; i <= 3; i++) {
                const warehouseName = `${manager.name.split(" ")[0]}'s Warehouse ${i}`;
                const location = `Location ${i} for ${manager.name}`;

                const warehouse = new Warehouse({
                    name: warehouseName,
                    location: location,
                    manager: manager._id,
                    capacity: Math.floor(Math.random() * 5000) + 5000,
                });

                await warehouse.save();
                console.log(`  - Created Warehouse: ${warehouse.name}`);

                // Create 15-20 products for each warehouse
                const numProducts = Math.floor(Math.random() * 6) + 15;
                const productsData = [];
                for (let j = 0; j < numProducts; j++) {
                    productsData.push(generateRandomProduct(warehouse._id));
                }

                const createdProducts = await Product.insertMany(productsData);
                console.log(`    - Added ${numProducts} products.`);

                // Generate MoveHistory and Transaction for these products based on their usageHistory
                const historyEntries = [];
                const transactionEntries = [];

                for (const product of createdProducts) {
                    // Create history for the last 7 days
                    product.usageHistory.forEach((usage, index) => {
                        if (usage > 0) {
                            const date = new Date();
                            date.setDate(date.getDate() - (index + 1)); // Past dates

                            // Add to MoveHistory (Audit Log)
                            historyEntries.push({
                                user: manager._id,
                                action: "STOCK_OUT",
                                sku: product.sku,
                                details: `Stock out of ${usage} units`,
                                timestamp: date,
                            });

                            // Add to Transaction (Financial/Stock Log)
                            transactionEntries.push({
                                productId: product._id,
                                type: "out",
                                quantity: usage,
                                timestamp: date,
                                productName: product.name,
                                productSku: product.sku,
                            });
                        }
                    });
                }

                if (historyEntries.length > 0) {
                    await MoveHistory.insertMany(historyEntries);
                    console.log(`    - Generated ${historyEntries.length} audit records.`);
                }

                if (transactionEntries.length > 0) {
                    await Transaction.insertMany(transactionEntries);
                    console.log(`    - Generated ${transactionEntries.length} transaction records.`);
                }
            }
        }

        console.log("\n🎉 Dummy data generation completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedData();
