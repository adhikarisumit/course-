import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// GET - Get all active chat rooms (students only)
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rooms = await prisma.chatRoom.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      include: {
        course: {
          select: { id: true, title: true }
        },
        _count: {
          select: { messages: true }
        }
      }
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error("Error fetching chat rooms:", error)
    return NextResponse.json({ error: "Failed to fetch chat rooms" }, { status: 500 })
  }
}

// POST - Create a new chat room (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, type, courseId } = body

    if (!name) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 })
    }

    const room = await prisma.chatRoom.create({
      data: {
        name,
        description: description || null,
        type: type || "general",
        courseId: courseId || null
      }
    })

    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    console.error("Error creating chat room:", error)
    return NextResponse.json({ error: "Failed to create chat room" }, { status: 500 })
  }
}
