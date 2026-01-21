import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { userEmail, courseId, amount, currency } = body

    if (!userEmail || !courseId || !amount) {
      return NextResponse.json(
        { error: "User email, course ID, and amount are required" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please make sure the user has an account." },
        { status: 404 }
      )
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        courseId: courseId,
        amount: amount,
        currency: currency || "jpy",
        status: "succeeded", // Since it's manually recorded after payment
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

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}