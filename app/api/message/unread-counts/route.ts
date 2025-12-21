import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUserId = session.user.id

    // Get unread message counts grouped by sender (mentors)
    const unreadMessages = await prisma.message.groupBy({
      by: ['senderId'],
      where: {
        receiverId: currentUserId,
        read: false
      },
      _count: {
        id: true
      }
    })

    // Convert to the expected format
    const unreadCounts: Record<string, number> = {}
    unreadMessages.forEach(group => {
      unreadCounts[group.senderId] = group._count.id
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