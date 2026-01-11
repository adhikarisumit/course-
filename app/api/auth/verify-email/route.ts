import { NextRequest, NextResponse } from "next/server"
import { verifyToken, generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/email"
import prisma from "@/lib/prisma"

// POST: Verify code or resend verification email
export async function POST(req: NextRequest) {
  try {
    const { email, code, action } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // If action is 'verify', verify the code
    if (action === 'verify') {
      if (!code) {
        return NextResponse.json(
          { error: "Verification code is required" },
          { status: 400 }
        )
      }

      const result = await verifyToken(normalizedEmail, code)

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { 
          message: "Email verified successfully",
          verified: true
        },
        { status: 200 }
      )
    }

    // Default action: resend verification email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json(
        { message: "If an account exists with this email, a verification code has been sent" },
        { status: 200 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      )
    }

    // Generate new verification code
    const verificationToken = await generateVerificationToken(normalizedEmail)

    // Send verification email with code
    const emailResult = await sendVerificationEmail(
      normalizedEmail,
      verificationToken.token,
      user.name || undefined
    )

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Verification code sent successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
