import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const mentors = await prisma.mentor.findMany({
      orderBy: { displayOrder: "asc" },
    })

    return NextResponse.json(mentors)
  } catch (error) {
    console.error("Error fetching mentors:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    const mentor = await prisma.mentor.create({
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
        isActive: data.isActive ?? true,
        displayOrder: data.displayOrder || 0,
        totalStudents: data.totalStudents || 0,
        totalCourses: data.totalCourses || 0,
        rating: data.rating || 5.0,
      },
    })

    return NextResponse.json(mentor, { status: 201 })
  } catch (error) {
    console.error("Error creating mentor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
