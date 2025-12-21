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
    const url = new URL(request.url)
    const action = url.pathname.split('/').pop() // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action!)) {
      return NextResponse.json(
        { message: "Invalid action" },
        { status: 400 }
      )
    }

    const newStatus = action === 'approve' ? 'completed' : 'rejected'

    const purchase = await prisma.resourcePurchase.update({
      where: { id: purchaseId },
      data: { status: newStatus },
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
      message: `Purchase ${action}d successfully`,
      purchase,
    })
  } catch (error) {
    console.error(`Error ${id} purchase:`, error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}