import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET - Get a specific purchase request
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    if (!purchaseRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Only allow the user who made the request or admins to view it
    if (purchaseRequest.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(purchaseRequest)
  } catch (error) {
    console.error("Error fetching purchase request:", error)
    return NextResponse.json({ error: "Failed to fetch request" }, { status: 500 })
  }
}

// DELETE - Cancel a purchase request (only pending requests)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id },
    })

    if (!purchaseRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Only allow the user who made the request to cancel it
    if (purchaseRequest.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Only allow canceling pending requests
    if (purchaseRequest.status !== "pending") {
      return NextResponse.json({ error: "Can only cancel pending requests" }, { status: 400 })
    }

    await prisma.purchaseRequest.delete({ where: { id } })

    return NextResponse.json({ message: "Request canceled successfully" })
  } catch (error) {
    console.error("Error canceling purchase request:", error)
    return NextResponse.json({ error: "Failed to cancel request" }, { status: 500 })
  }
}
