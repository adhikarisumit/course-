import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resource = await prisma.resource.findUnique({
      where: { id },
    })

    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(resource)
  } catch (error) {
    console.error("Error fetching resource:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

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

    const resource = await prisma.resource.findUnique({
      where: { id },
    })

    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      )
    }

    const updatedResource = await prisma.resource.update({
      where: { id },
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

    return NextResponse.json(updatedResource)
  } catch (error) {
    console.error("Error updating resource:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { isActive } = body

    const resource = await prisma.resource.findUnique({
      where: { id },
    })

    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      )
    }

    const updatedResource = await prisma.resource.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json(updatedResource)
  } catch (error) {
    console.error("Error updating resource status:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resource = await prisma.resource.findUnique({
      where: { id },
    })

    if (!resource) {
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      )
    }

    await prisma.resource.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Resource deleted successfully" })
  } catch (error) {
    console.error("Error deleting resource:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}