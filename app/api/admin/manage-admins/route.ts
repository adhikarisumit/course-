import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

const SUPER_ADMIN_EMAIL = "sumitadhikari2341@gmail.com"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Unauthorized: Only super admin can access this" },
        { status: 401 }
      )
    }

    const admins = await prisma.user.findMany({
      where: {
        role: "admin",
        email: {
          not: SUPER_ADMIN_EMAIL, // Exclude super admin from list
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(admins)
  } catch (error) {
    console.error("Error fetching admins:", error)
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Unauthorized: Only super admin can add admins" },
        { status: 401 }
      )
    }

    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "admin",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(admin)
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json(
      { error: "Failed to create admin" },
      { status: 500 }
    )
  }
}
