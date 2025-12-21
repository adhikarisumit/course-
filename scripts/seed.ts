import { execSync } from "child_process"

async function main() {
  console.log("🌱 Starting database seeding...")

  try {
    // 1. Create admin user first (most important)
    console.log("\n👤 Creating admin user...")
    execSync("npm run create-admin", { stdio: "inherit" })

    // 2. Seed resources
    console.log("\n📚 Seeding resources...")
    execSync("tsx scripts/seed-resources.ts", { stdio: "inherit" })

    // 3. Check mentors (if needed)
    console.log("\n👨‍🏫 Checking mentors...")
    execSync("tsx scripts/check-mentors.ts", { stdio: "inherit" })

    console.log("\n✅ Database seeding completed successfully!")
    console.log("\n🔑 Admin credentials are now available.")
    console.log("   Run 'npm run create-admin' anytime to see credentials again.")

  } catch (error) {
    console.error("❌ Error during seeding:", error)
    process.exit(1)
  }
}

main()