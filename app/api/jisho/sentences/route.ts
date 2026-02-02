import { NextRequest, NextResponse } from "next/server"

// Tatoeba API for example sentences
// Jisho uses Tatoeba for their sentences, so we'll use it directly

interface TatoebaResult {
  id: number
  text: string
  lang: string
  transcriptions?: Array<{
    text: string
    script: string
  }>
  translations?: Array<Array<{
    id: number
    text: string
    lang: string
  }>>
}

interface TatoebaResponse {
  paging: {
    Sentences: {
      count: number
      current: number
    }
  }
  results: TatoebaResult[]
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const keyword = searchParams.get("keyword")
    const limit = searchParams.get("limit") || "5"

    if (!keyword) {
      return NextResponse.json(
        { error: "You must provide a keyword to search." },
        { status: 400 }
      )
    }

    // Use Tatoeba API to fetch Japanese sentences with English translations
    const tatoebaUrl = `https://tatoeba.org/en/api_v0/search?from=jpn&to=eng&query=${encodeURIComponent(keyword)}&limit=${limit}`

    const response = await fetch(tatoebaUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StudentPortal/1.0)",
        "Accept": "application/json",
      },
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    })

    if (!response.ok) {
      throw new Error(`Tatoeba API returned status: ${response.status}`)
    }

    const data: TatoebaResponse = await response.json()

    // Transform the data to a cleaner format
    const sentences = data.results.map((result) => {
      // Get the first English translation if available
      const englishTranslation = result.translations
        ?.flat()
        ?.find((t) => t.lang === "eng")

      // Get furigana/reading if available
      const reading = result.transcriptions?.find(
        (t) => t.script === "Hrkt" || t.script === "Hira"
      )

      return {
        id: result.id,
        japanese: result.text,
        reading: reading?.text || null,
        english: englishTranslation?.text || null,
        englishId: englishTranslation?.id || null,
      }
    }).filter((s) => s.english) // Only include sentences with English translations

    return NextResponse.json({
      keyword,
      count: sentences.length,
      sentences,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error fetching sentences:", error)
    return NextResponse.json(
      { error: "Failed to fetch example sentences." },
      { status: 500 }
    )
  }
}
