const mongoose = require("mongoose");
const User = require("./models/User");
const Warehouse = require("./models/Warehouse");
const Product = require("./models/Product");
const MoveHistory = require("./models/MoveHistory");
const Transaction = require("./models/Transaction");
const WarehouseInventory = require("./models/WarehouseInventory");
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

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/stockmanager");
        console.log("Connected to MongoDB");

        // Clear existing data
        await Warehouse.deleteMany({});
        await Product.deleteMany({});
        await WarehouseInventory.deleteMany({});
        await MoveHistory.deleteMany({});
        await Transaction.deleteMany({});
        console.log("Cleared existing warehouses, products, inventory, history, and transactions.");

        const managers = await User.find({ role: "manager" });
        if (managers.length === 0) {
            console.log("No managers found. Please run seedManagers.js first.");
            process.exit(1);
        }

        console.log(`Found ${managers.length} managers.`);

        // Indian cities for warehouse names
        const indianCities = [
            { name: "Mumbai", state: "Maharashtra" },
            { name: "Delhi", state: "Delhi NCR" },
            { name: "Bangalore", state: "Karnataka" },
            { name: "Chennai", state: "Tamil Nadu" },
            { name: "Kolkata", state: "West Bengal" },
            { name: "Hyderabad", state: "Telangana" },
            { name: "Pune", state: "Maharashtra" },
            { name: "Ahmedabad", state: "Gujarat" },
            { name: "Jaipur", state: "Rajasthan" },
        ];

        let cityIndex = 0;
        const allWarehouses = [];

        // Create warehouses
        for (const manager of managers) {
            console.log(`\nProcessing Manager: ${manager.name} (${manager.email})`);

            for (let i = 1; i <= 3; i++) {
                const city = indianCities[cityIndex % indianCities.length];
                const warehouseName = `${city.name} Warehouse`;
                const location = `${city.name}, ${city.state}`;
                cityIndex++;

                const warehouse = new Warehouse({
                    name: warehouseName,
                    location: location,
                    manager: manager._id,
                    capacity: Math.floor(Math.random() * 5000) + 5000,
                });

                await warehouse.save();
                allWarehouses.push(warehouse);
                console.log(`  - Created Warehouse: ${warehouse.name}`);
            }
        }

        // Create base products (without warehouse assignment)
        console.log("\nCreating base products...");
        const baseProducts = [];
        const numBaseProducts = 30; // Create 30 unique products

        for (let i = 0; i < numBaseProducts; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const name = productNames[category][Math.floor(Math.random() * productNames[category].length)];
            const uniqueSuffix = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
            const sku = `${category.substring(0, 3).toUpperCase()}-${uniqueSuffix}`;

            const product = new Product({
                name: `${name} ${Math.floor(Math.random() * 100)}`,
                sku: sku,
                category: category,
                minStock: Math.floor(Math.random() * 20) + 5,
            });

            await product.save();
            baseProducts.push(product);
        }

        console.log(`  - Created ${baseProducts.length} base products.`);

        // Create warehouse inventory - each product in 2-3 warehouses
        console.log("\nCreating warehouse inventory...");
        const inventoryEntries = [];
        const historyEntries = [];
        const transactionEntries = [];

        for (const product of baseProducts) {
            // Randomly assign this product to 2-3 warehouses
            const numWarehouses = Math.floor(Math.random() * 2) + 2; // 2 or 3
            const selectedWarehouses = [];

            // Randomly select warehouses
            while (selectedWarehouses.length < numWarehouses) {
                const randomWarehouse = allWarehouses[Math.floor(Math.random() * allWarehouses.length)];
                if (!selectedWarehouses.find(w => w._id.equals(randomWarehouse._id))) {
                    selectedWarehouses.push(randomWarehouse);
                }
            }

            for (const warehouse of selectedWarehouses) {
                const stock = Math.floor(Math.random() * 200);
                const usageHistory = [];
                for (let i = 0; i < 7; i++) {
                    usageHistory.push(Math.floor(Math.random() * 10));
                }

                const inventory = new WarehouseInventory({
                    product: product._id,
                    warehouse: warehouse._id,
                    stock: stock,
                    minStock: product.minStock,
                    batches: stock > 0 ? [{ quantity: stock, dateIn: new Date(), cost: Math.floor(Math.random() * 100) + 10 }] : [],
                    usageHistory: usageHistory,
                });

                await inventory.save();
                inventoryEntries.push(inventory);

                // Generate history for stock out
                usageHistory.forEach((usage, index) => {
                    if (usage > 0) {
                        const date = new Date();
                        date.setDate(date.getDate() - (index + 1));

                        historyEntries.push({
                            user: warehouse.manager.toString(),
                            action: "STOCK_OUT",
                            sku: product.sku,
                            details: `Stock out of ${usage} units from ${warehouse.name}`,
                            timestamp: date,
                        });

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

                // Generate stock in events
                const numRestocks = Math.floor(Math.random() * 2) + 1;
                for (let k = 0; k < numRestocks; k++) {
                    const date = new Date();
                    date.setDate(date.getDate() - Math.floor(Math.random() * 7));
                    const quantity = Math.floor(Math.random() * 40) + 10;

                    historyEntries.push({
                        user: warehouse.manager.toString(),
                        action: "STOCK_IN",
                        sku: product.sku,
                        details: `Restocked ${quantity} units in ${warehouse.name}`,
                        timestamp: date,
                    });

                    transactionEntries.push({
                        productId: product._id,
                        type: "in",
                        quantity: quantity,
                        timestamp: date,
                        productName: product.name,
                        productSku: product.sku,
                    });
                }
            }

            console.log(`  - ${product.name} added to ${selectedWarehouses.length} warehouses`);
        }

        if (historyEntries.length > 0) {
            try {
                await MoveHistory.insertMany(historyEntries);
                console.log(`\n  - Generated ${historyEntries.length} audit records.`);
            } catch (err) {
                console.error("Error inserting history:", err.message);
            }
        }

        if (transactionEntries.length > 0) {
            try {
                await Transaction.insertMany(transactionEntries);
                console.log(`  - Generated ${transactionEntries.length} transaction records.`);
            } catch (err) {
                console.error("Error inserting transactions:", err.message);
            }
        }

        console.log("\n🎉 Multi-warehouse dummy data generation completed successfully!");
        console.log(`   - ${allWarehouses.length} warehouses`);
        console.log(`   - ${baseProducts.length} unique products`);
        console.log(`   - ${inventoryEntries.length} warehouse inventory entries`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seedData();
