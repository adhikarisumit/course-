import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// GET - List all inquiry course options
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const options = await prisma.inquiryCourseOption.findMany({
      orderBy: { order: "asc" },
    })
    return NextResponse.json({ courses: options.map((o: { name: string }) => o.name) })
  } catch (error) {
    console.error("Error fetching inquiry courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

// POST - Add a new course option
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { course } = await req.json()
    if (!course || typeof course !== "string" || !course.trim()) {
      return NextResponse.json({ error: "Course name is required" }, { status: 400 })
    }

    const trimmed = course.trim()

    // Check if course already exists (case-insensitive)
    const existing = await prisma.inquiryCourseOption.findFirst({
      where: { name: { equals: trimmed, mode: "insensitive" } },
    })
    if (existing) {
      return NextResponse.json({ error: "Course already exists" }, { status: 409 })
    }

    // Get max order for new course
    const last = await prisma.inquiryCourseOption.findFirst({
      orderBy: { order: "desc" },
    })

    await prisma.inquiryCourseOption.create({
      data: { name: trimmed, order: (last?.order ?? -1) + 1 },
    })

    const all = await prisma.inquiryCourseOption.findMany({ orderBy: { order: "asc" } })
    return NextResponse.json({ courses: all.map((o: { name: string }) => o.name) }, { status: 201 })
  } catch (error) {
    console.error("Error adding inquiry course:", error)
    return NextResponse.json({ error: "Failed to add course" }, { status: 500 })
  }
}

// DELETE - Remove a course option
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { course } = await req.json()
    if (!course || typeof course !== "string") {
      return NextResponse.json({ error: "Course name is required" }, { status: 400 })
    }

    await prisma.inquiryCourseOption.deleteMany({
      where: { name: course },
    })

    const all = await prisma.inquiryCourseOption.findMany({ orderBy: { order: "asc" } })
    return NextResponse.json({ courses: all.map((o: { name: string }) => o.name) })
  } catch (error) {
    console.error("Error deleting inquiry course:", error)
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}

// PATCH - Reorder courses
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courses } = await req.json()
    if (!Array.isArray(courses)) {
      return NextResponse.json({ error: "Courses array is required" }, { status: 400 })
    }

    // Update order for each course
    await Promise.all(
      courses.map((name: string, index: number) =>
        prisma.inquiryCourseOption.updateMany({
          where: { name },
          data: { order: index },
        })
      )
    )

    const all = await prisma.inquiryCourseOption.findMany({ orderBy: { order: "asc" } })
    return NextResponse.json({ courses: all.map((o: { name: string }) => o.name) })
  } catch (error) {
    console.error("Error updating inquiry courses:", error)
    return NextResponse.json({ error: "Failed to update courses" }, { status: 500 })
  }
}
