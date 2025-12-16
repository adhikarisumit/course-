import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const detailed = searchParams.get("detailed") === "true"

    const enrollments = await prisma.enrollment.findMany({
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
            lessons: {
              select: {
                id: true,
                title: true,
                order: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    })

    // If detailed view, calculate completed lessons
    if (detailed) {
      const enrichedEnrollments = await Promise.all(
        enrollments.map(async (enrollment) => {
          const completedLessonsCount = await prisma.lessonProgress.count({
            where: {
              userId: enrollment.user.id,
              completed: true,
              lessonId: {
                in: enrollment.course.lessons.map((l) => l.id),
              },
            },
          })

          return {
            ...enrollment,
            completedLessons: completedLessonsCount,
            totalLessons: enrollment.course.lessons.length,
          }
        })
      )

      return NextResponse.json(enrichedEnrollments)
    }

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { userEmail, courseId } = body

    if (!userEmail || !courseId) {
      return NextResponse.json(
        { error: "User email and course ID are required" },
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
    }) as any

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "User is already enrolled in this course" },
        { status: 400 }
      )
    }

    // Create enrollment with course's access duration
    const enrolledAt = new Date()
    const expiresAt = new Date(enrolledAt)
    expiresAt.setMonth(expiresAt.getMonth() + (course.accessDurationMonths || 6))

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: courseId,
        enrolledAt,
        expiresAt,
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

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error("Error creating enrollment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
