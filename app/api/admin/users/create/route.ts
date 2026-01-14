import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { sendAccountCredentialsEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, password, sendCredentials } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Basic email validation
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with email already verified (admin-created accounts don't need verification)
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "student",
        emailVerified: new Date(), // Mark as verified since admin created it
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    // Optionally send credentials via email
    if (sendCredentials) {
      try {
        await sendAccountCredentialsEmail(normalizedEmail, password, name)
      } catch (emailError) {
        console.error("Failed to send credentials email:", emailError)
        // Don't fail the request if email fails, user is still created
      }
    }

    return NextResponse.json({
      user,
      message: "User account created successfully",
      credentialsSent: sendCredentials,
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Failed to create user account" },
      { status: 500 }
    )
  }
}
