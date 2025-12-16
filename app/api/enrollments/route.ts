import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    }) as any

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id!,
          courseId: courseId,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      )
    }

    // Create enrollment with course's access duration
    const enrolledAt = new Date()
    const expiresAt = new Date(enrolledAt)
    expiresAt.setMonth(expiresAt.getMonth() + (course.accessDurationMonths || 6))

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id!,
        courseId: courseId,
        enrolledAt,
        expiresAt,
      },
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error("Error creating enrollment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
