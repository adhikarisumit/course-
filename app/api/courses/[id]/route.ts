export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || (session.user.role !== "admin" && session.user.role !== "super")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Hard delete: remove course and all related data from database
    // Delete lessons first
    await prisma.lesson.deleteMany({
      where: { courseId: id },
    });

    // Delete enrollments
    await prisma.enrollment.deleteMany({
      where: { courseId: id },
    });

    // Delete lesson progress
    await prisma.lessonProgress.deleteMany({
      where: {
        lesson: {
          courseId: id,
        },
      },
    });

    // Finally delete the course
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
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

    // @ts-ignore: isDeleted may not be in generated types, but exists in DB
    const course = await prisma.course.findFirst({
      where: {
        id,
        // @ts-ignore
        isDeleted: false,
      },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
        enrollments: session?.user
          ? {
              where: { userId: session.user.id },
            }
          : undefined,
      },
    }) as any;

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
            lessonId: { in: course.lessons.map((l: any) => l.id) },
          },
        })
      : []

    // Add completion status to lessons
    const lessonsWithProgress = course.lessons.map((lesson: any) => ({
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
      courseType: (course as any).courseType,
      meetingLink: (course as any).meetingLink,
      meetingPlatform: (course as any).meetingPlatform,
      scheduledStartTime: (course as any).scheduledStartTime,
      scheduledEndTime: (course as any).scheduledEndTime,
      isRecurring: (course as any).isRecurring,
      recurringSchedule: (course as any).recurringSchedule,
      features: (course as any).features,
      accessDurationMonths: (course as any).accessDurationMonths,
    })
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    )
  }
}
