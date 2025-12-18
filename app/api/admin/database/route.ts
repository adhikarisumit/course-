import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { promises as fs } from "fs"
import path from "path"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get database file size
    const dbPath = path.join(process.cwd(), "prisma", "dev.db")
    let dbSize = 0
    try {
      const stats = await fs.stat(dbPath)
      dbSize = stats.size
    } catch (error) {
      console.log("Database file not found or inaccessible")
    }

    // Get table counts
    const [userCount, courseCount, lessonCount, enrollmentCount, paymentCount, mentorCount] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.lesson.count(),
      prisma.enrollment.count(),
      prisma.payment.count(),
      prisma.mentor.count(),
    ])

    return NextResponse.json({
      dbSize: dbSize,
      dbSizeMB: (dbSize / (1024 * 1024)).toFixed(2),
      tables: {
        users: userCount,
        courses: courseCount,
        lessons: lessonCount,
        enrollments: enrollmentCount,
        payments: paymentCount,
        mentors: mentorCount,
      },
      totalRecords: userCount + courseCount + lessonCount + enrollmentCount + paymentCount + mentorCount,
    })
  } catch (error) {
    console.error("Error fetching database stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch database stats" },
      { status: 500 }
    )
  }
}
