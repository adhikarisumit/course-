import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { generatePasswordResetToken } from "@/lib/tokens"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBanned: true,
      }
    })

    // Always return success to prevent email enumeration attacks
    // But only actually send if user exists
    if (user) {
      // Check if user is banned
      if (user.isBanned) {
        return NextResponse.json(
          { error: "This account has been banned. Please contact support." },
          { status: 403 }
        )
      }

      // Generate password reset token
      const resetToken = await generatePasswordResetToken(normalizedEmail)

      // Send password reset email
      await sendPasswordResetEmail(normalizedEmail, resetToken.token, user.name || undefined)
    }

    // Return success response with isAdmin flag if user is an admin
    // This helps the frontend show appropriate messaging
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset code has been sent.",
      isAdmin: user?.role === "admin" || user?.role === "super" || false
    })

  } catch (error) {
    console.error("Error in forgot password:", error)
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    )
  }
}
