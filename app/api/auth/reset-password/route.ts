import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { verifyPasswordResetToken, deletePasswordResetToken } from "@/lib/tokens"

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json()

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Email, code, and new password are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Verify the reset token
    const verification = await verifyPasswordResetToken(normalizedEmail, code)

    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error || "Invalid or expired reset code" },
        { status: 400 }
      )
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        isBanned: true,
        role: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: "This account has been banned" },
        { status: 403 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update the user's password
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { 
        password: hashedPassword,
        // Increment session version to invalidate all existing sessions
        sessionVersion: { increment: 1 }
      }
    })

    // Delete the used token
    await deletePasswordResetToken(normalizedEmail, code)

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
      isAdmin: user.role === "admin"
    })

  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
