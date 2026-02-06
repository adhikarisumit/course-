import { NextRequest, NextResponse } from "next/server"

// Translation API for translating text between languages
// Primary: Lingva Translate (better quality for Nepali/Vietnamese)
// Fallback: MyMemory Translation API

// Lingva Translate instances to try (decentralized, some may be down)
const LINGVA_INSTANCES = [
  "https://lingva.ml",
  "https://translate.plausibility.cloud",
  "https://lingva.garuber.com",
]

// Try translation with Lingva Translate
async function translateWithLingva(text: string, from: string, to: string): Promise<string | null> {
  for (const instance of LINGVA_INSTANCES) {
    try {
      const apiUrl = `${instance}/api/v1/${from}/${to}/${encodeURIComponent(text)}`
      
      const response = await fetch(apiUrl, {
        headers: {
          "Accept": "application/json",
        },
        signal: AbortSignal.timeout(8000), // 8 second timeout per instance
      })

      if (response.ok) {
        const data = await response.json()
        if (data.translation && data.translation.trim()) {
          return data.translation
        }
      }
    } catch (error) {
      console.log(`Lingva instance ${instance} failed, trying next...`)
      continue
    }
  }
  return null
}

// Fallback to MyMemory Translation API
async function translateWithMyMemory(text: string, from: string, to: string): Promise<{ translated: string; alternatives: string[] }> {
  const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`

  const response = await fetch(apiUrl, {
    headers: {
      "Accept": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`MyMemory API returned status: ${response.status}`)
  }

  const data = await response.json()

  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails || "Translation failed")
  }

  let translatedText = data.responseData?.translatedText || ""
  const normalizedOriginal = text.toLowerCase().trim()
  const normalizedTranslated = translatedText.toLowerCase().trim()
  
  // Check if translation actually happened
  if (
    normalizedTranslated === normalizedOriginal ||
    ((to === "ne" || to === "vi") && /^[a-zA-Z0-9\s.,;:?!'"-]+$/.test(translatedText))
  ) {
    // Try to find a better match
    if (data.matches && Array.isArray(data.matches)) {
      for (const match of data.matches) {
        if (match.translation && match.match >= 0.5) {
          const matchNormalized = match.translation.toLowerCase().trim()
          if (matchNormalized !== normalizedOriginal && 
              !(/^[a-zA-Z0-9\s.,;:?!'"-]+$/.test(match.translation))) {
            translatedText = match.translation
            break
          }
        }
      }
    }
    
    // If still no good translation
    if (normalizedTranslated === translatedText.toLowerCase().trim() ||
        /^[a-zA-Z0-9\s.,;:?!'"-]+$/.test(translatedText)) {
      translatedText = ""
    }
  }

  // Get alternatives
  const alternatives: string[] = []
  if (data.matches && Array.isArray(data.matches)) {
    for (const match of data.matches.slice(0, 5)) {
      if (match.translation && match.translation !== translatedText && !alternatives.includes(match.translation)) {
        if ((to === "ne" || to === "vi") && /^[a-zA-Z0-9\s.,;:?!'"-]+$/.test(match.translation)) {
          continue
        }
        alternatives.push(match.translation)
      }
    }
  }

  return { translated: translatedText, alternatives: alternatives.slice(0, 3) }
}

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

    let translatedText = ""
    let alternatives: string[] = []

    // Try Lingva first (better quality for Nepali)
    translatedText = await translateWithLingva(trimmedText, from, to) || ""

    // Fallback to MyMemory if Lingva fails
    if (!translatedText) {
      try {
        const myMemoryResult = await translateWithMyMemory(trimmedText, from, to)
        translatedText = myMemoryResult.translated
        alternatives = myMemoryResult.alternatives
      } catch (error) {
        console.error("MyMemory fallback failed:", error)
      }
    }

    return NextResponse.json({
      original: trimmedText,
      translated: translatedText,
      from,
      to,
      alternatives,
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
