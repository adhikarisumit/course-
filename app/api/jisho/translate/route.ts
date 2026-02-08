import { NextRequest, NextResponse } from "next/server"

// Simple in-memory cache to avoid repeated API calls
const translationCache = new Map<string, { text: string; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

function getCached(key: string): string | null {
  const entry = translationCache.get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.text
  }
  if (entry) translationCache.delete(key)
  return null
}

function setCache(key: string, text: string) {
  // Limit cache size to prevent memory leaks
  if (translationCache.size > 5000) {
    // Remove oldest 1000 entries
    const entries = [...translationCache.entries()]
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
    for (let i = 0; i < 1000; i++) {
      translationCache.delete(entries[i][0])
    }
  }
  translationCache.set(key, { text, timestamp: Date.now() })
}

// Google Translate API (primary - best quality for Nepali & Vietnamese)
async function googleTranslate(text: string, from: string, to: string): Promise<string | null> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (data && data[0]) {
        const translated = data[0]
          .filter((item: unknown[]) => item && item[0])
          .map((item: unknown[]) => item[0])
          .join("")
        if (translated && translated.trim()) {
          return translated.trim()
        }
      }
    }
  } catch (error) {
    console.error("Google Translate failed:", error)
  }
  return null
}

// Fallback: MyMemory API (free, no key needed)
async function myMemoryTranslate(text: string, from: string, to: string): Promise<string | null> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        const translated = data.responseData.translatedText
        if (translated && translated.toLowerCase() !== text.toLowerCase()) {
          return translated.trim()
        }
      }
    }
  } catch (error) {
    console.error("MyMemory translation failed:", error)
  }
  return null
}

// Main translation function: Google first, MyMemory fallback
async function translateText(text: string, from: string, to: string): Promise<string | null> {
  const cacheKey = `${from}:${to}:${text}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  // Try Google Translate first (best quality)
  let result = await googleTranslate(text, from, to)

  // Fallback to MyMemory if Google fails
  if (!result) {
    result = await myMemoryTranslate(text, from, to)
  }

  if (result) {
    setCache(cacheKey, result)
  }

  return result
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

    // Limit text length to prevent abuse
    if (text.length > 1000) {
      return NextResponse.json(
        { error: "Text too long. Maximum 1000 characters." },
        { status: 400 }
      )
    }

    const translated = await translateText(text, from, to)

    if (translated) {
      return NextResponse.json(
        { translated, from, to },
        {
          headers: {
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
          },
        }
      )
    }

    return NextResponse.json(
      { error: "Translation failed", translated: null },
      { status: 200 }
    )
  } catch (error) {
    console.error("Translation API error:", error)
    return NextResponse.json(
      { error: "Translation service unavailable" },
      { status: 500 }
    )
  }
}
