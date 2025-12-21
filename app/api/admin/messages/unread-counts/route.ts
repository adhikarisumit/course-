import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(_request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const adminId = session.user.id

    // Get all users who have unread messages from admin's perspective
    const unreadMessages = await prisma.message.findMany({
      where: {
        receiverId: adminId,
        read: false
      },
      select: {
        senderId: true
      }
    })

    // Count unread messages per sender
    const unreadCounts: Record<string, number> = {}
    unreadMessages.forEach(message => {
      unreadCounts[message.senderId] = (unreadCounts[message.senderId] || 0) + 1
    })

    return NextResponse.json({ unreadCounts })
  } catch (error) {
    console.error("Error fetching unread counts:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}