import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const completed = searchParams.get("completed") === "true"

    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: id,
        ...(completed && { completed: true })
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { enrolledAt: "desc" }
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }
}