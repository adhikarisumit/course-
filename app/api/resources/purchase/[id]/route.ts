import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const purchaseId = id

    const purchase = await prisma.resourcePurchase.findUnique({
      where: { id: purchaseId },
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

    if (!purchase) {
      return NextResponse.json(
        { message: "Purchase not found" },
        { status: 404 }
      )
    }

    // Check if the purchase belongs to the current user
    if (purchase.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      )
    }

    return NextResponse.json({ purchase })
  } catch (error) {
    console.error("Error fetching purchase:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}