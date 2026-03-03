import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

const COURSES_FILE = path.join(process.cwd(), "storage", "inquiry-courses.json")

// GET - Public endpoint to fetch inquiry course options
export async function GET() {
  try {
    const data = await readFile(COURSES_FILE, "utf-8")
    const courses = JSON.parse(data)
    return NextResponse.json({ courses })
  } catch {
    // File doesn't exist yet, return empty array
    return NextResponse.json({ courses: [] })
  }
}
