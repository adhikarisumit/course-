import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET - Get all purchase requests for the current user
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requests = await prisma.purchaseRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching purchase requests:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

// POST - Create a new purchase request
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { itemType, itemId, message } = await request.json()

    if (!itemType || !itemId) {
      return NextResponse.json({ error: "Item type and ID are required" }, { status: 400 })
    }

    if (!["course", "resource"].includes(itemType)) {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 })
    }

    // Get item details
    let item: any = null
    let amount = 0
    let itemTitle = ""

    if (itemType === "course") {
      item = await prisma.course.findUnique({ where: { id: itemId } })
      if (!item) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 })
      }
      amount = item.price || 0
      itemTitle = item.title

      // Check if already enrolled
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: itemId,
          },
        },
      })

      if (existingEnrollment) {
        return NextResponse.json({ error: "You are already enrolled in this course" }, { status: 400 })
      }
    } else if (itemType === "resource") {
      item = await prisma.resource.findUnique({ where: { id: itemId } })
      if (!item) {
        return NextResponse.json({ error: "Resource not found" }, { status: 404 })
      }
      amount = item.price || 0
      itemTitle = item.title

      // Check if already purchased (only block if status is "completed")
      const existingPurchase = await prisma.resourcePurchase.findFirst({
        where: {
          userId: session.user.id,
          resourceId: itemId,
          status: "completed",
        },
      })

      if (existingPurchase) {
        return NextResponse.json({ error: "You have already purchased this resource" }, { status: 400 })
      }
    }

    // Create the purchase request (allow multiple pending requests)
    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        userId: session.user.id,
        itemType,
        itemId,
        itemTitle,
        amount,
        message: message || null,
        status: "pending",
      },
    })

    return NextResponse.json(purchaseRequest, { status: 201 })
  } catch (error) {
    console.error("Error creating purchase request:", error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}
