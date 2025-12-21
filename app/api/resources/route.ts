import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const types = searchParams.getAll("type")
    const category = searchParams.get("category")
    const isFree = searchParams.get("isFree")

    const where: any = {
      isActive: true,
    }

    if (types.length > 0) {
      where.type = {
        in: types
      }
    }

    if (category) {
      where.category = {
        contains: category,
        mode: "insensitive",
      }
    }

    if (isFree !== null) {
      where.isFree = isFree === "true"
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(resources)
  } catch (error) {
    console.error("Error fetching resources:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}