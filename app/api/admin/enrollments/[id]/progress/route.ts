import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get enrollment with course and lessons
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    // Get lesson progress for all lessons in the course
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        userId: enrollment.user.id,
        lessonId: {
          in: enrollment.course.lessons.map((l) => l.id),
        },
      },
    })

    // Create a map for quick lookup
    const progressMap = new Map(
      lessonProgress.map((p) => [p.lessonId, p])
    )

    // Combine lesson info with progress
    const lessonDetails = enrollment.course.lessons.map((lesson) => {
      const progress = progressMap.get(lesson.id)
      return {
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        completed: progress?.completed || false,
        completedAt: progress?.completedAt || null,
      }
    })

    return NextResponse.json({
      enrollment: {
        id: enrollment.id,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt,
      },
      user: enrollment.user,
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
      },
      lessonProgress: lessonDetails,
      stats: {
        total: lessonDetails.length,
        completed: lessonDetails.filter((l) => l.completed).length,
        remaining: lessonDetails.filter((l) => !l.completed).length,
      },
    })
  } catch (error) {
    console.error("Error fetching enrollment progress:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
