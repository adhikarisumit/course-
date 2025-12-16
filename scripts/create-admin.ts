import prisma from "../lib/prisma"
import bcrypt from "bcryptjs"

async function createAdminUser() {
  try {
    const email = "sumitadhikari2341@gmail.com"
    const password = "C242N012b.."
    const name = "Admin"

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // Update existing user to admin
      const hashedPassword = await bcrypt.hash(password, 12)
      await prisma.user.update({
        where: { email },
        data: {
          role: "admin",
          password: hashedPassword,
          name: name,
        },
      })
      console.log(`✅ Updated existing user ${email} to admin role`)
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 12)
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: "admin",
        },
      })
      console.log(`✅ Created admin user: ${email}`)
    }

    console.log(`\n🔑 Admin Credentials:`)
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`\n✨ You can now sign in as admin!`)
  } catch (error) {
    console.error("❌ Error creating admin user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
