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

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const purchaseId = id

    const purchase = await prisma.resourcePurchase.update({
      where: { id: purchaseId },
      data: { status: "rejected" },
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

    return NextResponse.json({
      message: "Purchase rejected successfully",
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