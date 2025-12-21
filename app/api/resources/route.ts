import { NextRequest, NextResponse } from "next/server"
import { getCachedResources, PerformanceMonitor } from "@/lib/performance"

export async function GET(request: NextRequest) {
  const monitor = PerformanceMonitor.getInstance()
  const endTimer = monitor.startTimer('resources-api')

  try {
    const { searchParams } = new URL(request.url)
    const types = searchParams.getAll("type")
    const category = searchParams.get("category") || undefined
    const isFree = searchParams.get("isFree") === "true" ? true : searchParams.get("isFree") === "false" ? false : undefined

    // Use cached version for better performance
    const resources = await getCachedResources(types, category, isFree)

    // Cache for 5 minutes with stale-while-revalidate
    const response = NextResponse.json(resources)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

    endTimer()
    return response
  } catch (error) {
    endTimer()
    console.error("Error fetching resources:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}