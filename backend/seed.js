// Sample Data Seeder for StockManager
// Run this after setting up the backend to populate test data

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Product = require("./models/Product");
const Transaction = require("./models/Transaction");

const sampleProducts = [
  {
    name: "Industrial Widget A",
    sku: "WGT001",
    stock: 150,
    minStock: 30,
    usageHistory: [12, 15, 10, 14, 13, 11, 16, 12, 15, 10],
  },
  {
    name: "Premium Gadget B",
    sku: "GAD002",
    stock: 75,
    minStock: 20,
    usageHistory: [5, 8, 6, 7, 9, 5, 8, 6],
  },
  {
    name: "Standard Component C",
    sku: "CMP003",
    stock: 200,
    minStock: 50,
    usageHistory: [20, 25, 18, 22, 24, 19, 21, 23, 20, 25],
  },
  {
    name: "Deluxe Tool D",
    sku: "TL004",
    stock: 25,
    minStock: 10,
    usageHistory: [3, 4, 2, 5, 3, 4, 2],
  },
  {
    name: "Basic Supply E",
    sku: "SUP005",
    stock: 8,
    minStock: 15,
    usageHistory: [10, 12, 9, 11, 10, 13, 12, 11],
  },
];

const sampleUser = {
  name: "Demo User",
  email: "demo@stockmanager.com",
  password: "demo123456",
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Transaction.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create demo user
    const hashedPassword = await bcrypt.hash(sampleUser.password, 10);
    const user = await User.create({
      name: sampleUser.name,
      email: sampleUser.email,
      password: hashedPassword,
    });
    console.log(`👤 Created demo user: ${sampleUser.email}`);
    console.log(`🔑 Password: ${sampleUser.password}`);

    // Create products
    const products = await Product.insertMany(sampleProducts);
    console.log(`📦 Created ${products.length} products`);

    // Create sample transactions for each product
    const transactions = [];
    for (const product of products) {
      // Create 5 stock-in transactions
      for (let i = 0; i < 5; i++) {
        transactions.push({
          productId: product._id,
          type: "in",
          quantity: Math.floor(Math.random() * 50) + 20,
          productName: product.name,
          productSku: product.sku,
          timestamp: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000),
        });
      }

      // Create stock-out transactions based on usage history
      product.usageHistory.forEach((qty, idx) => {
        transactions.push({
          productId: product._id,
          type: "out",
          quantity: qty,
          productName: product.name,
          productSku: product.sku,
          timestamp: new Date(
            Date.now() -
              (product.usageHistory.length - idx) * 24 * 60 * 60 * 1000
          ),
        });
      });
    }

    await Transaction.insertMany(transactions);
    console.log(`📊 Created ${transactions.length} transactions`);

    console.log("\n✅ Database seeded successfully!");
    console.log("\n📝 Sample Data Summary:");
    console.log(
      `   - User: ${sampleUser.email} (password: ${sampleUser.password})`
    );
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Transactions: ${transactions.length}`);
    console.log("\n🎯 Product Highlights:");
    products.forEach((p) => {
      const avgUsage =
        p.usageHistory.reduce((a, b) => a + b, 0) / p.usageHistory.length;
      const predictedDays = Math.floor(p.stock / avgUsage);
      const status = p.stock <= p.minStock ? "⚠️ LOW STOCK" : "✅ OK";
      console.log(`   - ${p.name} (${p.sku}): ${p.stock} units ${status}`);
      console.log(`     Prediction: ~${predictedDays} days remaining`);
    });

    console.log("\n🚀 Ready to test the app!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

// Run the seeder
seedDatabase();
