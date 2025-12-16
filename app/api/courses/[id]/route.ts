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

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
        enrollments: session?.user
          ? {
              where: { userId: session.user.id },
            }
          : false,
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check enrollment
    const isEnrolled = course.enrollments && course.enrollments.length > 0
    const enrollment = isEnrolled ? course.enrollments[0] : null

    // Get lesson progress if user is logged in
    const lessonProgress = session?.user
      ? await prisma.lessonProgress.findMany({
          where: {
            userId: session.user.id,
            lessonId: { in: course.lessons.map((l) => l.id) },
          },
        })
      : []

    // Add completion status to lessons
    const lessonsWithProgress = course.lessons.map((lesson) => ({
      ...lesson,
      isCompleted: lessonProgress.some(
        (p) => p.lessonId === lesson.id && p.completed
      ),
    }))

    return NextResponse.json({
      id: course.id,
      title: course.title,
      description: course.description,
      image: course.image,
      videoUrl: (course as any).videoUrl,
      price: course.price,
      isPaid: course.isPaid,
      isEnrolled,
      progress: enrollment?.progress || 0,
      lessons: lessonsWithProgress,
    })
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    )
  }
}
