import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, videoUrl, category, level, duration, price, isPaid, isPublished, accessDurationMonths } = body

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        videoUrl: videoUrl || null,
        category: category || null,
        level: level || null,
        duration: duration || null,
        price: isPaid ? price : 0,
        isPaid: isPaid || false,
        isPublished: isPublished !== undefined ? isPublished : true,
        accessDurationMonths: accessDurationMonths || 6,
      } as any,
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const courses = await prisma.course.findMany({
      include: {
        lessons: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}
