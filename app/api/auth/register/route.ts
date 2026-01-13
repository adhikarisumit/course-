import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Strict email validation
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    // Validate email length and format
    if (normalizedEmail.length > 254 || normalizedEmail.length < 5) {
      return NextResponse.json(
        { error: "Email address is invalid" },
        { status: 400 }
      )
    }

    // Check for valid domain
    const [localPart, domain] = normalizedEmail.split('@')
    if (!domain || domain.length < 3 || !domain.includes('.')) {
      return NextResponse.json(
        { error: "Email domain is invalid" },
        { status: 400 }
      )
    }

    // Block common disposable/temporary email domains
    const disposableDomains = [
      'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
      'trashmail.com', 'throwaway.email', 'getnada.com', 'temp-mail.org',
      'fakeinbox.com', 'yopmail.com', 'maildrop.cc', 'sharklasers.com'
    ]
    
    if (disposableDomains.includes(domain.toLowerCase())) {
      return NextResponse.json(
        { error: "Temporary email addresses are not allowed. Please use a valid email address" },
        { status: 400 }
      )
    }

    // Validate domain structure
    const domainParts = domain.split('.')
    if (domainParts.length < 2) {
      return NextResponse.json(
        { error: "Email domain is invalid" },
        { status: 400 }
      )
    }

    // Check TLD is valid (at least 2 characters)
    const tld = domainParts[domainParts.length - 1]
    if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
      return NextResponse.json(
        { error: "Email domain extension is invalid" },
        { status: 400 }
      )
    }

    // Validate local part
    if (localPart.length > 64 || localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
      return NextResponse.json(
        { error: "Email format is invalid" },
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

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "student",
      },
    })

    // Generate verification token
    const verificationToken = await generateVerificationToken(normalizedEmail)

    // Send verification email
    const emailResult = await sendVerificationEmail(
      normalizedEmail,
      verificationToken.token,
      name
    )

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error)
      // Delete the user since they won't be able to verify without the email
      await prisma.user.delete({
        where: { id: user.id }
      })
      // Also delete the verification token
      await prisma.verificationToken.deleteMany({
        where: { identifier: normalizedEmail }
      })
      return NextResponse.json(
        { error: "Failed to send verification email. Please check your email address and try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        message: "Account created successfully. Please check your email to verify your account.",
        requiresVerification: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
