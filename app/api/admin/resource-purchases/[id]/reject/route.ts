import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()

    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const purchaseId = id

    // Get purchase info before deleting for response
    const purchase = await prisma.resourcePurchase.findUnique({
      where: { id: purchaseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resource: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!purchase) {
      return NextResponse.json(
        { message: "Purchase not found" },
        { status: 404 }
      )
    }

    // Delete the purchase record instead of just updating status
    await prisma.resourcePurchase.delete({
      where: { id: purchaseId },
    })

    return NextResponse.json({
      message: "Purchase rejected and removed successfully",
      purchase,
    })
  } catch (error) {
    console.error("Error rejecting purchase:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}