import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET - Get all purchase requests (admin only)
export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const itemType = searchParams.get("itemType")

    const where: any = {}
    if (status && status !== "all") {
      where.status = status
    }
    if (itemType && itemType !== "all") {
      where.itemType = itemType
    }

    const requests = await prisma.purchaseRequest.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Get stats
    const stats = await prisma.purchaseRequest.groupBy({
      by: ["status"],
      _count: { status: true },
    })

    const statsObj = {
      total: requests.length,
      pending: stats.find((s: any) => s.status === "pending")?._count.status || 0,
      approved: stats.find((s: any) => s.status === "approved")?._count.status || 0,
      rejected: stats.find((s: any) => s.status === "rejected")?._count.status || 0,
    }

    return NextResponse.json({ requests, stats: statsObj })
  } catch (error) {
    console.error("Error fetching purchase requests:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}
