import { NextRequest, NextResponse } from "next/server"

// Types for Jisho API response
interface JishoJapanese {
  word?: string
  reading: string
}

interface JishoSense {
  english_definitions: string[]
  parts_of_speech: string[]
  tags: string[]
  restrictions: string[]
  see_also: string[]
  antonyms: string[]
  source: string[]
  info: string[]
}

interface JishoData {
  slug: string
  is_common: boolean
  tags: string[]
  jlpt: string[]
  japanese: JishoJapanese[]
  senses: JishoSense[]
  attribution: {
    jmdict: boolean
    jmnedict: boolean
    dbpedia: string | boolean
  }
}

interface JishoResponse {
  meta: {
    status: number
  }
  data: JishoData[]
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const keyword = searchParams.get("keyword")
    const page = searchParams.get("page") || "1"

    if (!keyword) {
      return NextResponse.json(
        { error: "You must provide a keyword to search." },
        { status: 400 }
      )
    }

    // Build the Jisho API URL
    const jishoUrl = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}&page=${page}`

    // Fetch data from Jisho API
    const response = await fetch(jishoUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StudentPortal/1.0)",
      },
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    })

    if (!response.ok) {
      throw new Error(`Jisho API returned status: ${response.status}`)
    }

    const data: JishoResponse = await response.json()

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error fetching from Jisho API:", error)
    return NextResponse.json(
      { error: "Failed to fetch data from Jisho dictionary." },
      { status: 500 }
    )
  }
}

// Handle kanji lookup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { kanji } = body

    if (!kanji) {
      return NextResponse.json(
        { error: "You must provide a kanji character." },
        { status: 400 }
      )
    }

    // For kanji-specific searches, we use a special query format
    const jishoUrl = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(`#kanji ${kanji}`)}`

    const response = await fetch(jishoUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StudentPortal/1.0)",
      },
    })

    if (!response.ok) {
      throw new Error(`Jisho API returned status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching kanji from Jisho API:", error)
    return NextResponse.json(
      { error: "Failed to fetch kanji data from Jisho dictionary." },
      { status: 500 }
    )
  }
}
