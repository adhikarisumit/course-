import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json({ ok: true })
    }

    if (user.isBanned) {
      return NextResponse.json({ 
        error: "banned",
        message: "Your account has been banned",
        reason: user.banReason 
      }, { status: 403 })
    }

    if (!user.emailVerified) {
      return NextResponse.json({ 
        error: "unverified",
        message: "Please verify your email before signing in" 
      }, { status: 403 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error checking user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
