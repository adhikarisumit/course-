import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { message: "Resource access ID is required" },
        { status: 400 }
      )
    }

    // Delete the resource purchase record
    await prisma.resourcePurchase.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Resource access revoked successfully" })
  } catch (error) {
    console.error("Error deleting resource access:", error)

    // Check if it's a "not found" error
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json(
        { message: "Resource access record not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}