import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resources = await prisma.resource.findMany({
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      type,
      url,
      fileUrl,
      category,
      tags,
      isFree,
      price,
      isActive,
    } = body

    if (!title || !type) {
      return NextResponse.json(
        { message: "Title and type are required" },
        { status: 400 }
      )
    }

    if ((type === "software" || type === "link") && !url) {
      return NextResponse.json(
        { message: "URL is required for software and link types" },
        { status: 400 }
      )
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        type,
        url: type === "software" || type === "link" ? url : null,
        fileUrl: type === "cheatsheet" ? fileUrl : null,
        category,
        tags,
        isFree,
        price: !isFree ? price : null,
        isActive,
      },
    })

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error("Error creating resource:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}