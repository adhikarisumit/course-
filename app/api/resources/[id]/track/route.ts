import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body // "click" or "download"

    if (!action || !["click", "download"].includes(action)) {
      return NextResponse.json(
        { message: "Invalid action. Must be 'click' or 'download'" },
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

    // Update the appropriate counter
    const updateData =
      action === "download"
        ? { downloadCount: { increment: 1 } }
        : { clickCount: { increment: 1 } }

    const updatedResource = await prisma.resource.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      message: "Tracking updated successfully",
      resource: updatedResource,
    })
  } catch (error) {
    console.error("Error tracking resource interaction:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}