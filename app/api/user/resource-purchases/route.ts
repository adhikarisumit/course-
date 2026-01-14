import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Return all purchases (including pending) so user can see request status
    const resourcePurchases = await prisma.resourcePurchase.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        resourceId: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json(resourcePurchases)
  } catch (error) {
    console.error("Error fetching resource purchases:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}