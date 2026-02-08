import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// POST - Initialize default chat rooms (admin only, run once)
export async function POST() {
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

    // Check if rooms already exist
    const existingRooms = await prisma.chatRoom.count()
    if (existingRooms > 0) {
      return NextResponse.json({ 
        message: "Chat rooms already initialized", 
        count: existingRooms 
      })
    }

    // Create default chat rooms
    const defaultRooms = [
      {
        name: "General Discussion",
        description: "Chat with fellow students about anything!",
        type: "general"
      },
      {
        name: "Study Group",
        description: "Find study partners and discuss learning strategies",
        type: "general"
      },
      {
        name: "Help & Support",
        description: "Ask questions and get help from the community",
        type: "support"
      },
      {
        name: "Introductions",
        description: "Introduce yourself to the community!",
        type: "general"
      }
    ]

    const createdRooms = await prisma.chatRoom.createMany({
      data: defaultRooms
    })

    return NextResponse.json({
      message: "Chat rooms initialized successfully",
      count: createdRooms.count
    }, { status: 201 })
  } catch (error) {
    console.error("Error initializing chat rooms:", error)
    return NextResponse.json({ error: "Failed to initialize chat rooms" }, { status: 500 })
  }
}
