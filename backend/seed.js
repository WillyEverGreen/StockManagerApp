const { execSync } = require("child_process");

console.log("🌱 Starting Database Seed Process...");

try {
  console.log("\n--- Step 1: Seeding Managers ---");
  execSync("node seedManagers.js", { stdio: "inherit" });

  console.log("\n--- Step 2: Seeding Warehouses, Products & Transactions ---");
  execSync("node seedData.js", { stdio: "inherit" });

  console.log("\n✅ All seed operations completed successfully!");
} catch (error) {
  console.error("\n❌ Seeding failed.");
  // The child process output is already inherited, so the user sees the specific error.
  process.exit(1);
}
