const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const checkSystem = async () => {
    try {
        // 1. Check Database
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/stockmanager");
        console.log("✅ Connected to MongoDB");

        const email = "manager1@gmail.com";
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ Manager ${email} NOT found.`);
        } else {
            console.log(`✅ Manager found: ${user.email} (Role: ${user.role})`);
            // Check password hash (optional, but good to know it exists)
            if (user.password) console.log("   Password hash exists.");
        }

        // 2. Check Server Connectivity (Local)
        try {
            const response = await fetch("http://localhost:5000/api/health");
            console.log("✅ Local Server is reachable (Status: " + response.status + ")");
        } catch (err) {
            // Try root if health doesn't exist
            try {
                const response = await fetch("http://localhost:5000/");
                console.log("✅ Local Server is reachable (Root Status: " + response.status + ")");
            } catch (innerErr) {
                console.log("❌ Local Server seems unreachable or erroring: " + innerErr.message);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkSystem();
