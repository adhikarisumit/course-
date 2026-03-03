import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Public endpoint to fetch inquiry course options
export async function GET() {
  try {
    const options = await prisma.inquiryCourseOption.findMany({
      orderBy: { order: "asc" },
    })
    return NextResponse.json({ courses: options.map((o: { name: string }) => o.name) })
  } catch {
    // Return empty array on error
    return NextResponse.json({ courses: [] })
  }
}
