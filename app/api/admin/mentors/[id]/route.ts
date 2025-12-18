import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const mentor = await prisma.mentor.findUnique({
      where: { id },
    })

    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 })
    }

    return NextResponse.json(mentor)
  } catch (error) {
    console.error("Error fetching mentor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const data = await req.json()

    const mentor = await prisma.mentor.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        company: data.company || null,
        bio: data.bio,
        image: data.image || null,
        expertise: data.expertise,
        experience: data.experience || null,
        achievements: data.achievements || null,
        socialLinks: data.socialLinks || null,
        isActive: data.isActive,
        displayOrder: data.displayOrder,
        totalStudents: data.totalStudents,
        totalCourses: data.totalCourses,
        rating: data.rating,
      },
    })

    return NextResponse.json(mentor)
  } catch (error) {
    console.error("Error updating mentor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.mentor.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting mentor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
