import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const { months } = await request.json()

    if (typeof months !== "number") {
      return NextResponse.json(
        { error: "Months must be a number" },
        { status: 400 }
      )
    }

    // Get current enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      )
    }

    // Calculate new expiry date
    const currentExpiry = enrollment.expiresAt || new Date()
    const newExpiry = new Date(currentExpiry)
    newExpiry.setMonth(newExpiry.getMonth() + months)

    // Update enrollment
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id },
      data: {
        expiresAt: newExpiry,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    })

    return NextResponse.json(updatedEnrollment)
  } catch (error) {
    console.error("Error updating enrollment validity:", error)
    return NextResponse.json(
      { error: "Failed to update enrollment validity" },
      { status: 500 }
    )
  }
}
