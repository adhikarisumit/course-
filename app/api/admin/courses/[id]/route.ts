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
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin" && session.user.role !== "super") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin" && session.user.role !== "super") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { 
      title, description, videoUrl, category, level, duration, price, isPaid, isPublished, accessDurationMonths,
      courseType, meetingLink, meetingPlatform, scheduledStartTime, scheduledEndTime, isRecurring, recurringSchedule,
      features, whatYouWillLearn, adCode, showAds
    } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Validate live course fields
    if (courseType === "live") {
      if (!meetingLink || !scheduledStartTime || !scheduledEndTime) {
        return NextResponse.json({ 
          error: "Meeting link and schedule are required for live courses" 
        }, { status: 400 })
      }
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        title,
        description: description || null,
        videoUrl: videoUrl || null,
        category: category || null,
        level: level || null,
        duration: duration || null,
        price: isPaid ? parseFloat(price) : 0,
        isPaid: isPaid || false,
        isPublished: isPublished !== undefined ? isPublished : true,
        accessDurationMonths: accessDurationMonths || 6,
        courseType: courseType || "recorded",
        meetingLink: meetingLink || null,
        meetingPlatform: meetingPlatform || null,
        scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : null,
        scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : null,
        isRecurring: isRecurring || false,
        recurringSchedule: recurringSchedule || null,
        features: features || null,
        whatYouWillLearn: whatYouWillLearn || null,
        adCode: adCode || null,
        showAds: showAds !== undefined ? showAds : true,
      } as any,
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error updating course:", error)
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}
