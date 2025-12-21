import prisma from "../lib/prisma"
import bcrypt from "bcryptjs"

async function createAdminUser() {
  try {
    // Admin credentials - these should be consistent
    const email = "sumitadhikari2341@gmail.com"
    const password = "C242N012b.."
    const name = "Admin"

    console.log("🔐 Setting up admin user...")

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Use upsert to ensure admin always exists
    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        name: name,
        role: "admin",
        isFrozen: false,
        profileVerified: true,
        sessionVersion: 0,
      },
      create: {
        email,
        password: hashedPassword,
        name,
        role: "admin",
        isFrozen: false,
        profileVerified: true,
        sessionVersion: 0,
      },
    })

    console.log(`✅ Admin user ${email} is ready`)
    console.log(`\n🔑 Admin Credentials:`)
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`\n✨ Admin access is guaranteed even after database resets!`)

  } catch (error) {
    console.error("❌ Error setting up admin user:", error)
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
