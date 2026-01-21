import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ADMIN_EMAILS = [
  'sumitadhikari2341@gmail.com',
  'proteclink.com@gmail.com'
]

// Default password for secondary admin - should be changed after first login
const DEFAULT_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!'

async function main() {
  console.log('🔍 Checking current admin users...\n')

  // Check current state
  const existingUsers = await prisma.user.findMany({
    where: { email: { in: ADMIN_EMAILS } },
    select: { id: true, email: true, role: true, name: true }
  })

  console.log('Current users:')
  if (existingUsers.length === 0) {
    console.log('  No admin users found')
  } else {
    existingUsers.forEach(u => {
      console.log(`  - ${u.email}: role="${u.role}", name="${u.name}"`)
    })
  }

  console.log('\n🔧 Ensuring super admin accounts...\n')

  // Update/create both emails as super admin
  for (const email of ADMIN_EMAILS) {
    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
      // Update existing user to super admin
      await prisma.user.update({
        where: { email },
        data: {
          role: 'super',
          isFrozen: false,
          profileVerified: true,
        }
      })
      console.log(`✅ Updated ${email} to role="super"`)
    } else {
      // Create new super admin
      const password = email === process.env.SUPER_ADMIN_EMAIL 
        ? process.env.SUPER_ADMIN_PASSWORD! 
        : DEFAULT_ADMIN_PASSWORD
      
      const name = email === process.env.SUPER_ADMIN_EMAIL
        ? process.env.SUPER_ADMIN_NAME || 'Super Admin'
        : 'Super Admin 2'

      await prisma.user.create({
        data: {
          email,
          password: await bcrypt.hash(password, 12),
          name,
          role: 'super',
          isFrozen: false,
          profileVerified: true,
          emailVerified: new Date(),
          sessionVersion: 0,
        }
      })
      console.log(`✅ Created ${email} as super admin (password: same as primary admin)`)
    }
  }

  // Verify final state
  console.log('\n📋 Final state:')
  const updatedUsers = await prisma.user.findMany({
    where: { email: { in: ADMIN_EMAILS } },
    select: { id: true, email: true, role: true, name: true }
  })

  updatedUsers.forEach(u => {
    console.log(`  - ${u.email}: role="${u.role}", name="${u.name}"`)
  })

  console.log('\n✨ Done! Please sign out and sign back in.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
