import { NextRequest, NextResponse } from "next/server"

// Kanji API for detailed kanji information including stroke order
// Using kanjiapi.dev which is free and provides stroke order data

interface KanjiData {
  kanji: string
  grade: number | null
  stroke_count: number
  meanings: string[]
  kun_readings: string[]
  on_readings: string[]
  name_readings: string[]
  jlpt: number | null
  unicode: string
  heisig_en: string | null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const kanji = searchParams.get("kanji")

    if (!kanji) {
      return NextResponse.json(
        { error: "You must provide a kanji character." },
        { status: 400 }
      )
    }

    // Fetch kanji data from kanjiapi.dev
    const kanjiApiUrl = `https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`
    
    const response = await fetch(kanjiApiUrl, {
      headers: {
        "Accept": "application/json",
      },
      next: {
        revalidate: 86400, // Cache for 24 hours
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Kanji not found. Make sure you're searching for a valid kanji character." },
          { status: 404 }
        )
      }
      throw new Error(`Kanji API returned status: ${response.status}`)
    }

    const kanjiData: KanjiData = await response.json()

    // Get the unicode code point for SVG lookup (5-digit padded for KanjiVG)
    const codePoint = kanji.codePointAt(0)?.toString(16).padStart(5, '0')
    
    // Get the unicode code point for GIF lookup (no padding, lowercase for mistval/kanji_images)
    const gifCodePoint = kanji.codePointAt(0)?.toString(16).toLowerCase()

    // KanjiVG SVG URL for stroke order (this contains all stroke paths)
    const strokeOrderSvgUrl = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${codePoint}.svg`

    // Fetch the SVG to extract stroke data
    let svgContent = null
    let strokePaths: string[] = []
    
    try {
      const svgResponse = await fetch(strokeOrderSvgUrl)
      if (svgResponse.ok) {
        svgContent = await svgResponse.text()
        
        // Extract stroke paths from SVG
        // KanjiVG SVGs have paths with ids like "kvg:StrokeNumbers_..."
        const pathRegex = /<path[^>]*d="([^"]+)"[^>]*>/g
        let match
        while ((match = pathRegex.exec(svgContent)) !== null) {
          // Only get actual stroke paths, not stroke number paths
          if (!match[0].includes('kvg:StrokeNumbers')) {
            strokePaths.push(match[1])
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch SVG:", e)
    }

    // Stroke order GIF URL (animated) - uses non-padded hex code
    const strokeOrderGifUrl = `https://raw.githubusercontent.com/mistval/kanji_images/master/gifs/${gifCodePoint}.gif`

    return NextResponse.json({
      kanji: kanjiData.kanji,
      meanings: kanjiData.meanings,
      kunReadings: kanjiData.kun_readings,
      onReadings: kanjiData.on_readings,
      strokeCount: kanjiData.stroke_count,
      jlpt: kanjiData.jlpt,
      grade: kanjiData.grade,
      unicode: kanjiData.unicode,
      codePoint,
      strokeOrderSvgUrl,
      strokeOrderGifUrl,
      svgContent,
      strokePaths,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    })
  } catch (error) {
    console.error("Error fetching kanji data:", error)
    return NextResponse.json(
      { error: "Failed to fetch kanji information." },
      { status: 500 }
    )
  }
}
