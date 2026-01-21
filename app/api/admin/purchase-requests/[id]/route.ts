import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// PATCH - Approve or reject a purchase request (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { action, adminNote } = await request.json()

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        user: true,
      },
    })

    if (!purchaseRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    if (purchaseRequest.status !== "pending") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 })
    }

    const newStatus = action === "approve" ? "approved" : "rejected"

    // Start a transaction for approval (need to create enrollment/purchase)
    if (action === "approve") {
      await prisma.$transaction(async (tx) => {
        // Update the request
        await tx.purchaseRequest.update({
          where: { id },
          data: {
            status: newStatus,
            adminNote: adminNote || null,
            reviewedAt: new Date(),
            reviewedBy: session.user.id,
          },
        })

        // Create enrollment or resource purchase
        if (purchaseRequest.itemType === "course") {
          // Check if enrollment already exists
          const existingEnrollment = await tx.enrollment.findUnique({
            where: {
              userId_courseId: {
                userId: purchaseRequest.userId,
                courseId: purchaseRequest.itemId,
              },
            },
          })

          if (!existingEnrollment) {
            // Get course for access duration
            const course = await tx.course.findUnique({
              where: { id: purchaseRequest.itemId },
            })

            await tx.enrollment.create({
              data: {
                userId: purchaseRequest.userId,
                courseId: purchaseRequest.itemId,
                enrolledAt: new Date(),
                expiresAt: new Date(Date.now() + (course?.accessDurationMonths || 6) * 30 * 24 * 60 * 60 * 1000),
              },
            })

            // Create payment record
            await tx.payment.create({
              data: {
                userId: purchaseRequest.userId,
                courseId: purchaseRequest.itemId,
                amount: purchaseRequest.amount,
                currency: purchaseRequest.currency,
                status: "completed",
              },
            })
          }
        } else if (purchaseRequest.itemType === "resource") {
          // Check if resource purchase already exists
          const existingPurchase = await tx.resourcePurchase.findUnique({
            where: {
              userId_resourceId: {
                userId: purchaseRequest.userId,
                resourceId: purchaseRequest.itemId,
              },
            },
          })

          if (!existingPurchase) {
            await tx.resourcePurchase.create({
              data: {
                userId: purchaseRequest.userId,
                resourceId: purchaseRequest.itemId,
                amount: purchaseRequest.amount,
                currency: purchaseRequest.currency,
                status: "completed",
              },
            })
          }
        }
      })
    } else {
      // Just update the request for rejection
      await prisma.purchaseRequest.update({
        where: { id },
        data: {
          status: newStatus,
          adminNote: adminNote || null,
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
        },
      })
    }

    return NextResponse.json({ message: `Request ${newStatus} successfully` })
  } catch (error) {
    console.error("Error processing purchase request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

// DELETE - Delete a purchase request (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.purchaseRequest.delete({ where: { id } })

    return NextResponse.json({ message: "Request deleted successfully" })
  } catch (error) {
    console.error("Error deleting purchase request:", error)
    return NextResponse.json({ error: "Failed to delete request" }, { status: 500 })
  }
}
