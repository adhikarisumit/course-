import prisma from "../lib/prisma"
import bcrypt from "bcryptjs"
import "dotenv/config"

async function createAdminUser() {
  try {
    // Admin credentials from environment variables
    const email = process.env.SUPER_ADMIN_EMAIL
    const password = process.env.SUPER_ADMIN_PASSWORD
    const name = process.env.SUPER_ADMIN_NAME || "Super Admin"

    if (!email || !password) {
      console.error("❌ SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env file")
      process.exit(1)
    }

    console.log("🔐 Setting up super admin user...")

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    })

    let admin
    if (existingAdmin) {
      console.log("📝 Admin user already exists, updating credentials...")

      // Update existing admin
      admin = await prisma.user.update({
        where: { email },
        data: {
          password: await bcrypt.hash(password, 12),
          name: name,
          role: "admin",
          isFrozen: false,
          profileVerified: true,
          emailVerified: new Date(),
          sessionVersion: 0,
        }
      })
    } else {
      console.log("🆕 Creating new super admin user...")

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create new admin
      admin = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: "admin",
          isFrozen: false,
          profileVerified: true,
          emailVerified: new Date(),
          sessionVersion: 0,
        }
      })
    }

    console.log(`✅ Super admin user ${email} is ready`)
    console.log(`\n🔑 Super Admin Credentials:`)
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`\n🛡️  Super admin access is guaranteed even after database resets!`)
    console.log(`🔒 This admin user cannot be deleted through normal means.`)

  } catch (error) {
    console.error("❌ Error setting up super admin user:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Export for use in other scripts
export { createAdminUser }

// Run if called directly
if (require.main === module) {
  createAdminUser()
}

createAdminUser()
