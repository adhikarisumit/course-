import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(_request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const adminId = session.user.id

    // Get all users who have conversations with the admin
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: adminId },
          { receiverId: adminId }
        ]
      },
      select: {
        senderId: true,
        receiverId: true,
        content: true,
        createdAt: true,
        read: true,
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Group by conversation partner and calculate unread counts
    const conversationMap = new Map<string, any>()

    conversations.forEach(message => {
      const partnerId = message.senderId === adminId ? message.receiverId : message.senderId
      const partner = message.senderId === adminId ? message.receiver : message.sender

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          userId: partnerId,
          userName: partner.name,
          userEmail: partner.email,
          userImage: partner.image,
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt,
            senderId: message.senderId
          },
          unreadCount: 0
        })
      }

      // Count unread messages from this user to admin
      if (message.receiverId === adminId && !message.read) {
        conversationMap.get(partnerId).unreadCount++
      }

      // Update last message if this is more recent
      if (new Date(message.createdAt) > new Date(conversationMap.get(partnerId).lastMessage.createdAt)) {
        conversationMap.get(partnerId).lastMessage = {
          content: message.content,
          createdAt: message.createdAt,
          senderId: message.senderId
        }
      }
    })

    const result = Array.from(conversationMap.values())

    return NextResponse.json({ conversations: result })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}