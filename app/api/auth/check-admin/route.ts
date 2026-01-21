import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

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

    // Find user and check if they're an admin
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        role: true,
      }
    })

    // Return whether the email belongs to an admin
    // This is used to show appropriate UI messaging
    return NextResponse.json({
      isAdmin: user?.role === "admin" || false
    })

  } catch (error) {
    console.error("Error checking admin email:", error)
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    )
  }
}
