import { NextRequest, NextResponse } from "next/server"

// Translation API for translating English text to Nepali
// Using MyMemory Translation API (free, no API key required)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const text = searchParams.get("text")
    const from = searchParams.get("from") || "en"
    const to = searchParams.get("to") || "ne"

    if (!text) {
      return NextResponse.json(
        { error: "Text parameter is required" },
        { status: 400 }
      )
    }

    // Limit text length to avoid API limits
    const trimmedText = text.slice(0, 500)

    // MyMemory Translation API
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmedText)}&langpair=${from}|${to}`

    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
      },
      next: {
        revalidate: 86400, // Cache translations for 24 hours
      },
    })

    if (!response.ok) {
      throw new Error(`Translation API returned status: ${response.status}`)
    }

    const data = await response.json()

    if (data.responseStatus !== 200) {
      throw new Error(data.responseDetails || "Translation failed")
    }

    // Get the translated text
    let translatedText = data.responseData?.translatedText || ""

    // Check if translation failed (API returns original text or similar when it can't translate)
    // Normalize both strings for comparison (lowercase, remove extra spaces)
    const normalizedOriginal = trimmedText.toLowerCase().trim()
    const normalizedTranslated = translatedText.toLowerCase().trim()
    
    // If translated text is too similar to original (likely not translated)
    // This happens when the API doesn't have a translation
    if (
      normalizedTranslated === normalizedOriginal ||
      // Check if it's mostly English characters when translating to non-Latin languages
      (to === "ne" || to === "vi") && /^[a-zA-Z0-9\s.,;:?!'"-]+$/.test(translatedText)
    ) {
      // Try to get a better translation from matches
      if (data.matches && Array.isArray(data.matches)) {
        for (const match of data.matches) {
          if (match.translation && match.match >= 0.5) {
            const matchNormalized = match.translation.toLowerCase().trim()
            // Check if this match is actually translated (not English)
            if (matchNormalized !== normalizedOriginal && 
                !(/^[a-zA-Z0-9\s.,;:?!'"-]+$/.test(match.translation))) {
              translatedText = match.translation
              break
            }
          }
        }
      }
      
      // If still no good translation, return empty
      if (normalizedTranslated === translatedText.toLowerCase().trim() ||
          /^[a-zA-Z0-9\s.,;:?!'"-]+$/.test(translatedText)) {
        translatedText = ""
      }
    }

    // Get alternative translations from matches (if available)
    const alternatives: string[] = []
    if (data.matches && Array.isArray(data.matches)) {
      for (const match of data.matches.slice(0, 5)) {
        if (match.translation && match.translation !== translatedText && !alternatives.includes(match.translation)) {
          // Only include non-English alternatives for non-Latin target languages
          if ((to === "ne" || to === "vi") && /^[a-zA-Z0-9\s.,;:?!'"-]+$/.test(match.translation)) {
            continue
          }
          alternatives.push(match.translation)
        }
      }
    }

    return NextResponse.json({
      original: trimmedText,
      translated: translatedText,
      from,
      to,
      alternatives: alternatives.slice(0, 3),
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    })
  } catch (error) {
    console.error("Translation error:", error)
    return NextResponse.json(
      { error: "Failed to translate text" },
      { status: 500 }
    )
  }
}
