import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { resourceId, amount } = await request.json()

    if (!resourceId) {
      return NextResponse.json(
        { message: "Resource ID is required" },
        { status: 400 }
      )
    }

    // Check if resource exists and is not free
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        title: true,
        isFree: true,
        price: true,
        isActive: true,
      },
    })

    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      )
    }

    if (!resource.isActive) {
      return NextResponse.json(
        { message: "Resource is not available" },
        { status: 400 }
      )
    }

    if (resource.isFree) {
      return NextResponse.json(
        { message: "This resource is free" },
        { status: 400 }
      )
    }

    // Check if user already purchased this resource
    const existingPurchase = await prisma.resourcePurchase.findUnique({
      where: {
        userId_resourceId: {
          userId: session.user.id,
          resourceId: resourceId,
        },
      },
    })

    if (existingPurchase) {
      if (existingPurchase.status === "completed") {
        return NextResponse.json(
          { message: "You have already purchased this resource" },
          { status: 400 }
        )
      } else {
        // Return existing pending purchase
        const purchaseWithResource = await prisma.resourcePurchase.findUnique({
          where: { id: existingPurchase.id },
          include: {
            resource: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },
          },
        })
        return NextResponse.json({ purchase: purchaseWithResource })
      }
    }

    // Validate amount matches resource price
    if (amount !== resource.price) {
      return NextResponse.json(
        { message: "Invalid amount" },
        { status: 400 }
      )
    }

    // Create the purchase record as pending
    const purchase = await prisma.resourcePurchase.create({
      data: {
        userId: session.user.id,
        resourceId: resourceId,
        amount: resource.price!, // We know price exists since !resource.isFree
        currency: "jpy",
        status: "pending", // Mark as pending for admin approval
      },
      select: {
        id: true,
        resourceId: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    })

    // TODO: Send email notification to admin about pending purchase

    return NextResponse.json({
      message: "Purchase request submitted. Please complete payment.",
      purchase,
      redirectTo: `/portal/resources/payment-method/${purchase.id}`,
    })
  } catch (error) {
    console.error("Error processing resource purchase:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}