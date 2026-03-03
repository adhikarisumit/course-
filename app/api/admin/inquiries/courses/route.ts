import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { readFile, writeFile, mkdir } from "fs/promises"
import path from "path"

const COURSES_FILE = path.join(process.cwd(), "storage", "inquiry-courses.json")

async function ensureFile() {
  try {
    await mkdir(path.join(process.cwd(), "storage"), { recursive: true })
    await readFile(COURSES_FILE, "utf-8")
  } catch {
    await writeFile(COURSES_FILE, JSON.stringify([]), "utf-8")
  }
}

async function getCourses(): Promise<string[]> {
  await ensureFile()
  const data = await readFile(COURSES_FILE, "utf-8")
  return JSON.parse(data)
}

async function saveCourses(courses: string[]) {
  await ensureFile()
  await writeFile(COURSES_FILE, JSON.stringify(courses, null, 2), "utf-8")
}

// GET - List all inquiry course options
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const courses = await getCourses()
    return NextResponse.json({ courses })
  } catch (error) {
    console.error("Error fetching inquiry courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

// POST - Add a new course option
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { course } = await req.json()
    if (!course || typeof course !== "string" || !course.trim()) {
      return NextResponse.json({ error: "Course name is required" }, { status: 400 })
    }

    const courses = await getCourses()
    const trimmed = course.trim()

    if (courses.some((c: string) => c.toLowerCase() === trimmed.toLowerCase())) {
      return NextResponse.json({ error: "Course already exists" }, { status: 409 })
    }

    courses.push(trimmed)
    await saveCourses(courses)

    return NextResponse.json({ courses }, { status: 201 })
  } catch (error) {
    console.error("Error adding inquiry course:", error)
    return NextResponse.json({ error: "Failed to add course" }, { status: 500 })
  }
}

// DELETE - Remove a course option
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { course } = await req.json()
    if (!course || typeof course !== "string") {
      return NextResponse.json({ error: "Course name is required" }, { status: 400 })
    }

    const courses = await getCourses()
    const filtered = courses.filter((c: string) => c !== course)
    await saveCourses(filtered)

    return NextResponse.json({ courses: filtered })
  } catch (error) {
    console.error("Error deleting inquiry course:", error)
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}

// PATCH - Reorder courses
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courses } = await req.json()
    if (!Array.isArray(courses)) {
      return NextResponse.json({ error: "Courses array is required" }, { status: 400 })
    }

    await saveCourses(courses)
    return NextResponse.json({ courses })
  } catch (error) {
    console.error("Error updating inquiry courses:", error)
    return NextResponse.json({ error: "Failed to update courses" }, { status: 500 })
  }
}
