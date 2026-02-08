import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// GET - Get messages for a room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { roomId } = await params
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor")
    const limit = parseInt(searchParams.get("limit") || "50")

    // Check if room exists
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const messages = await prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1
      })
    })

    let nextCursor: string | undefined = undefined
    if (messages.length > limit) {
      const nextItem = messages.pop()
      nextCursor = nextItem?.id
    }

    // Reverse to show oldest first
    messages.reverse()

    return NextResponse.json({
      messages,
      nextCursor
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST - Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { roomId } = await params
    const body = await request.json()
    const { content } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    // Check if room exists and is active
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId }
    })

    if (!room || !room.isActive) {
      return NextResponse.json({ error: "Room not found or inactive" }, { status: 404 })
    }

    // Get user info for caching in message
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, image: true }
    })

    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        roomId,
        userId: session.user.id,
        userName: user?.name || "Anonymous",
        userImage: user?.image || null
      }
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
