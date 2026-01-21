import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const purchases = await prisma.resourcePurchase.findMany({
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
            description: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ purchases })
  } catch (error) {
    console.error("Error fetching resource purchases:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}