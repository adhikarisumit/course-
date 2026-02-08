import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// GET - Get a single chat room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "admin" && user?.role !== "super") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = await params

    const room = await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    })

    if (!room) {
      return NextResponse.json({ error: "Chat room not found" }, { status: 404 })
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error("Error fetching chat room:", error)
    return NextResponse.json({ error: "Failed to fetch chat room" }, { status: 500 })
  }
}

// PUT - Update a chat room
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "admin" && user?.role !== "super") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, type, isActive } = body

    const room = await prisma.chatRoom.update({
      where: { id },
      data: {
        name,
        description: description || null,
        type: type || "general",
        isActive: isActive ?? true
      },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error("Error updating chat room:", error)
    return NextResponse.json({ error: "Failed to update chat room" }, { status: 500 })
  }
}

// DELETE - Delete a chat room
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "admin" && user?.role !== "super") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = await params

    // Delete the chat room (messages will be cascade deleted)
    await prisma.chatRoom.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Chat room deleted successfully" })
  } catch (error) {
    console.error("Error deleting chat room:", error)
    return NextResponse.json({ error: "Failed to delete chat room" }, { status: 500 })
  }
}
