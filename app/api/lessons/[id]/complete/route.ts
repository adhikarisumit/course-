import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: lessonId } = await params
    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Get lesson details
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    })

    if (!lesson || lesson.courseId !== courseId) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    // Check if user is enrolled (or course is free)
    if (lesson.course.isPaid) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: session.user.id,
          courseId: courseId,
        },
      })

      if (!enrollment) {
        return NextResponse.json({ error: "Not enrolled in course" }, { status: 403 })
      }
    }

    // Mark lesson as complete
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId,
        },
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        lessonId: lessonId,
        completed: true,
        completedAt: new Date(),
      },
    })

    // Calculate course progress
    const totalLessons = lesson.course.lessons.length
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        userId: session.user.id,
        lessonId: { in: lesson.course.lessons.map((l) => l.id) },
        completed: true,
      },
    })

    const progress = Math.round((completedLessons / totalLessons) * 100)
    const isCompleted = progress === 100

    // Update enrollment progress (create if doesn't exist for free courses)
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
      update: {
        progress,
        completed: isCompleted,
      },
      create: {
        userId: session.user.id,
        courseId: courseId,
        progress,
        completed: isCompleted,
      },
    })

    return NextResponse.json({
      success: true,
      lessonCompleted: true,
      enrollmentProgress: progress,
      courseCompleted: isCompleted,
    })
  } catch (error) {
    console.error("Error marking lesson complete:", error)
    return NextResponse.json(
      { error: "Failed to mark lesson complete" },
      { status: 500 }
    )
  }
}
