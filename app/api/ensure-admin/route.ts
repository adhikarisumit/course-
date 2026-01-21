import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * API endpoint to ensure admin user exists
 * This is called at runtime to guarantee admin persistence
 */
export async function GET(request: NextRequest) {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL
    const password = process.env.SUPER_ADMIN_PASSWORD
    const name = process.env.SUPER_ADMIN_NAME || 'Super Admin'

    if (!email || !password) {
      console.log('⚠️ SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set')
      return NextResponse.json({
        success: false,
        message: 'Admin credentials not configured in environment'
      }, { status: 500 })
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      // Update existing admin to ensure correct role and credentials
      await prisma.user.update({
        where: { email },
        data: {
          password: await bcrypt.hash(password, 12),
          name,
          role: 'super',
          isFrozen: false,
          profileVerified: true,
          emailVerified: new Date(),
        }
      })
      console.log('✅ Admin user updated')
    } else {
      // Create new admin
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
      console.log('✅ Admin user created')
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user ensured to exist'
    })

  } catch (error) {
    console.error('Error ensuring admin exists:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}