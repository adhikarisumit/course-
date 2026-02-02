"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Search, Volume2, Book, Star, Copy, Check, Loader2, ChevronDown, ChevronUp, BookOpen, Languages, Tag, ExternalLink, History, X, Bookmark, BookmarkCheck, MessageSquareText, Pencil, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import KanjiStrokeModal from "@/components/kanji-stroke-modal"

// Types for Jisho API response
interface JishoJapanese {
  word?: string
  reading: string
}

// Types for example sentences
interface ExampleSentence {
  id: number
  japanese: string
  reading: string | null
  english: string | null
  englishId: number | null
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

interface SearchHistoryItem {
  keyword: string
  timestamp: number
}

interface BookmarkedWord {
  slug: string
  word: string
  reading: string
  meaning: string
  timestamp: number
}

// JLPT level colors
const jlptColors: Record<string, string> = {
  "jlpt-n5": "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  "jlpt-n4": "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  "jlpt-n3": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  "jlpt-n2": "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  "jlpt-n1": "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
}

// Part of speech colors
const posColors: Record<string, string> = {
  "Noun": "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  "Verb": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "Adjective": "bg-green-500/10 text-green-700 dark:text-green-400",
  "Adverb": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  "Expression": "bg-pink-500/10 text-pink-700 dark:text-pink-400",
}

// Helper to check if a character is kanji
function isKanji(char: string): boolean {
  const code = char.charCodeAt(0)
  // CJK Unified Ideographs range
  return (code >= 0x4E00 && code <= 0x9FAF) || 
         (code >= 0x3400 && code <= 0x4DBF) ||
         (code >= 0x20000 && code <= 0x2A6DF)
}

export default function JishoDictionary() {
  const [keyword, setKeyword] = useState("")
  const [results, setResults] = useState<JishoData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [bookmarks, setBookmarks] = useState<BookmarkedWord[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState("search")
  const [selectedKanji, setSelectedKanji] = useState<string | null>(null)
  const [kanjiModalOpen, setKanjiModalOpen] = useState(false)
  const [showNepali, setShowNepali] = useState(true)
  const [showVietnamese, setShowVietnamese] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Open kanji stroke order modal
  const openKanjiModal = useCallback((kanji: string) => {
    setSelectedKanji(kanji)
    setKanjiModalOpen(true)
  }, [])

  // Load search history and bookmarks from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("jisho-search-history")
    const savedBookmarks = localStorage.getItem("jisho-bookmarks")
    const savedNepaliPref = localStorage.getItem("jisho-show-nepali")
    const savedVietnamesePref = localStorage.getItem("jisho-show-vietnamese")
    
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Failed to load search history:", e)
      }
    }
    
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks))
      } catch (e) {
        console.error("Failed to load bookmarks:", e)
      }
    }

    if (savedNepaliPref !== null) {
      setShowNepali(savedNepaliPref === "true")
    }

    if (savedVietnamesePref !== null) {
      setShowVietnamese(savedVietnamesePref === "true")
    }
  }, [])

  // Save search history to localStorage
  const addToHistory = useCallback((searchKeyword: string) => {
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.keyword !== searchKeyword)
      const newHistory = [{ keyword: searchKeyword, timestamp: Date.now() }, ...filtered].slice(0, 20)
      localStorage.setItem("jisho-search-history", JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  // Toggle bookmark
  const toggleBookmark = useCallback((word: JishoData) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.slug === word.slug)
      let newBookmarks: BookmarkedWord[]
      
      if (exists) {
        newBookmarks = prev.filter((b) => b.slug !== word.slug)
        toast({
          description: "Removed from bookmarks",
        })
      } else {
        const newBookmark: BookmarkedWord = {
          slug: word.slug,
          word: word.japanese[0]?.word || word.japanese[0]?.reading || "",
          reading: word.japanese[0]?.reading || "",
          meaning: word.senses[0]?.english_definitions.join(", ") || "",
          timestamp: Date.now(),
        }
        newBookmarks = [newBookmark, ...prev]
        toast({
          description: "Added to bookmarks",
        })
      }
      
      localStorage.setItem("jisho-bookmarks", JSON.stringify(newBookmarks))
      return newBookmarks
    })
  }, [toast])

  // Check if word is bookmarked
  const isBookmarked = useCallback((slug: string) => {
    return bookmarks.some((b) => b.slug === slug)
  }, [bookmarks])

  // Search function
  const searchJisho = useCallback(async (searchKeyword: string) => {
    if (!searchKeyword.trim()) {
      setError("Please enter a word to search.")
      return
    }

    setLoading(true)
    setError(null)
    setShowHistory(false)

    try {
      const response = await fetch(`/api/jisho?keyword=${encodeURIComponent(searchKeyword.trim())}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch results")
      }

      const data: JishoResponse = await response.json()
      
      if (data.data && data.data.length > 0) {
        setResults(data.data)
        addToHistory(searchKeyword.trim())
      } else {
        setResults([])
        setError("No results found. Try a different search term.")
      }
    } catch (err) {
      console.error("Search error:", err)
      setError("Failed to search. Please try again.")
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [addToHistory])

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchJisho(keyword)
  }

  // Handle history item click
  const handleHistoryClick = (historyKeyword: string) => {
    setKeyword(historyKeyword)
    searchJisho(historyKeyword)
  }

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem("jisho-search-history")
    toast({
      description: "Search history cleared",
    })
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      toast({
        description: "Copied to clipboard",
      })
      setTimeout(() => setCopiedText(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
      toast({
        variant: "destructive",
        description: "Failed to copy text",
      })
    }
  }

  // Text-to-speech for Japanese
  const speakJapanese = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "ja-JP"
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    } else {
      toast({
        variant: "destructive",
        description: "Text-to-speech is not supported in your browser",
      })
    }
  }

  // Toggle card expansion
  const toggleExpanded = (slug: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(slug)) {
        newSet.delete(slug)
      } else {
        newSet.add(slug)
      }
      return newSet
    })
  }

  // Get JLPT level display
  const getJlptDisplay = (jlpt: string[]) => {
    if (!jlpt || jlpt.length === 0) return null
    return jlpt.map((level) => (
      <Badge
        key={level}
        variant="outline"
        className={cn("text-xs font-medium", jlptColors[level] || "bg-gray-500/10")}
      >
        {level.replace("jlpt-", "JLPT ").toUpperCase()}
      </Badge>
    ))
  }

  // Get part of speech color
  const getPosColor = (pos: string) => {
    for (const [key, color] of Object.entries(posColors)) {
      if (pos.toLowerCase().includes(key.toLowerCase())) {
        return color
      }
    }
    return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
  }

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`
    return date.toLocaleDateString()
  }

  // Toggle Nepali translations
  const toggleNepali = () => {
    const newValue = !showNepali
    setShowNepali(newValue)
    localStorage.setItem("jisho-show-nepali", String(newValue))
    toast({
      description: newValue ? "Nepali translations enabled" : "Nepali translations disabled",
    })
  }

  // Toggle Vietnamese translations
  const toggleVietnamese = () => {
    const newValue = !showVietnamese
    setShowVietnamese(newValue)
    localStorage.setItem("jisho-show-vietnamese", String(newValue))
    toast({
      description: newValue ? "Vietnamese translations enabled" : "Vietnamese translations disabled",
    })
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Kanji Stroke Order Modal */}
        <KanjiStrokeModal
          kanji={selectedKanji}
          isOpen={kanjiModalOpen}
          onClose={() => setKanjiModalOpen(false)}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="search" className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
              {searchHistory.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {searchHistory.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Saved
              {bookmarks.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {bookmarks.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Search Form */}
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search in Japanese or English..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onFocus={() => setShowHistory(true)}
                      className="pl-10 pr-4 h-12 text-lg"
                      autoComplete="off"
                    />
                    {keyword && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => {
                          setKeyword("")
                          searchInputRef.current?.focus()
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Quick search history dropdown */}
                  {showHistory && searchHistory.length > 0 && !keyword && (
                    <Card className="absolute z-10 w-full max-w-xl mt-1 shadow-lg">
                      <CardContent className="p-2">
                        <div className="flex items-center justify-between px-2 py-1 mb-1">
                          <span className="text-xs text-muted-foreground">Recent searches</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={clearHistory}
                          >
                            Clear
                          </Button>
                        </div>
                        {searchHistory.slice(0, 5).map((item) => (
                          <button
                            key={item.timestamp}
                            type="button"
                            className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-muted rounded-md transition-colors"
                            onClick={() => handleHistoryClick(item.keyword)}
                          >
                            <History className="h-3 w-3 text-muted-foreground" />
                            <span>{item.keyword}</span>
                          </button>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 h-11" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Search Dictionary
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Search tips */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Search tips:</p>
                  <div className="flex flex-wrap gap-2">
                    {["猫", "食べる", "#jlpt-n5", "#common", "house"].map((tip) => (
                      <Badge
                        key={tip}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => {
                          setKeyword(tip)
                          searchJisho(tip)
                        }}
                      >
                        {tip}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="pt-6">
                  <p className="text-destructive text-center">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm text-muted-foreground">
                    Found {results.length} result{results.length > 1 ? "s" : ""}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="nepali-toggle" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1.5">
                        <Globe className="h-4 w-4" />
                        नेपाली
                      </Label>
                      <Switch
                        id="nepali-toggle"
                        checked={showNepali}
                        onCheckedChange={toggleNepali}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="vietnamese-toggle" className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1.5">
                        <Globe className="h-4 w-4" />
                        Tiếng Việt
                      </Label>
                      <Switch
                        id="vietnamese-toggle"
                        checked={showVietnamese}
                        onCheckedChange={toggleVietnamese}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {results.map((word, index) => (
                    <WordCard
                      key={`${word.slug}-${index}`}
                      word={word}
                      isExpanded={expandedCards.has(word.slug)}
                      onToggleExpanded={() => toggleExpanded(word.slug)}
                      onCopy={copyToClipboard}
                      onSpeak={speakJapanese}
                      copiedText={copiedText}
                      isBookmarked={isBookmarked(word.slug)}
                      onToggleBookmark={() => toggleBookmark(word)}
                      getJlptDisplay={getJlptDisplay}
                      getPosColor={getPosColor}
                      onKanjiClick={openKanjiModal}
                      showNepali={showNepali}
                      showVietnamese={showVietnamese}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Search History</CardTitle>
                    <CardDescription>Your recent searches</CardDescription>
                  </div>
                  {searchHistory.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearHistory}>
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {searchHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No search history yet</p>
                    <p className="text-sm">Your searches will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchHistory.map((item) => (
                      <div
                        key={item.timestamp}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setActiveTab("search")
                          handleHistoryClick(item.keyword)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.keyword}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Saved Words</CardTitle>
                    <CardDescription>Words you&apos;ve bookmarked for later</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {bookmarks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No saved words yet</p>
                    <p className="text-sm">Click the bookmark icon on any word to save it</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookmarks.map((item) => (
                      <div
                        key={item.slug}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            setActiveTab("search")
                            setKeyword(item.word || item.reading)
                            searchJisho(item.word || item.reading)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold">{item.word || item.reading}</span>
                            {item.word && (
                              <span className="text-muted-foreground">【{item.reading}】</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{item.meaning}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => speakJapanese(item.word || item.reading)}
                              >
                                <Volume2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Pronounce</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => copyToClipboard(item.word || item.reading)}
                              >
                                {copiedText === (item.word || item.reading) ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary"
                                onClick={() => {
                                  setBookmarks((prev) => {
                                    const newBookmarks = prev.filter((b) => b.slug !== item.slug)
                                    localStorage.setItem("jisho-bookmarks", JSON.stringify(newBookmarks))
                                    return newBookmarks
                                  })
                                  toast({ description: "Removed from bookmarks" })
                                }}
                              >
                                <BookmarkCheck className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove bookmark</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}

// Separate Word Card component
interface WordCardProps {
  word: JishoData
  isExpanded: boolean
  onToggleExpanded: () => void
  onCopy: (text: string) => void
  onSpeak: (text: string) => void
  copiedText: string | null
  isBookmarked: boolean
  onToggleBookmark: () => void
  getJlptDisplay: (jlpt: string[]) => React.ReactNode
  getPosColor: (pos: string) => string
  onKanjiClick: (kanji: string) => void
  showNepali: boolean
  showVietnamese: boolean
}

function WordCard({
  word,
  isExpanded,
  onToggleExpanded,
  onCopy,
  onSpeak,
  copiedText,
  isBookmarked,
  onToggleBookmark,
  getJlptDisplay,
  getPosColor,
  onKanjiClick,
  showNepali,
  showVietnamese,
}: WordCardProps) {
  const mainWord = word.japanese[0]?.word || word.japanese[0]?.reading || ""
  const reading = word.japanese[0]?.reading || ""
  const [sentences, setSentences] = useState<ExampleSentence[]>([])
  const [loadingSentences, setLoadingSentences] = useState(false)
  const [sentencesLoaded, setSentencesLoaded] = useState(false)
  const [nepaliTranslations, setNepaliTranslations] = useState<Record<number, string>>({})
  const [loadingNepali, setLoadingNepali] = useState<Record<number, boolean>>({})
  const [vietnameseTranslations, setVietnameseTranslations] = useState<Record<number, string>>({})
  const [loadingVietnamese, setLoadingVietnamese] = useState<Record<number, boolean>>({})

  // Fetch Nepali translation for a meaning
  const fetchNepaliTranslation = useCallback(async (text: string, index: number) => {
    if (nepaliTranslations[index] || loadingNepali[index]) return
    
    setLoadingNepali(prev => ({ ...prev, [index]: true }))
    try {
      const response = await fetch(`/api/jisho/translate?text=${encodeURIComponent(text)}&from=en&to=ne`)
      if (response.ok) {
        const data = await response.json()
        if (data.translated) {
          setNepaliTranslations(prev => ({ ...prev, [index]: data.translated }))
        }
      }
    } catch (error) {
      console.error("Failed to fetch Nepali translation:", error)
    } finally {
      setLoadingNepali(prev => ({ ...prev, [index]: false }))
    }
  }, [nepaliTranslations, loadingNepali])

  // Fetch Vietnamese translation for a meaning
  const fetchVietnameseTranslation = useCallback(async (text: string, index: number) => {
    if (vietnameseTranslations[index] || loadingVietnamese[index]) return
    
    setLoadingVietnamese(prev => ({ ...prev, [index]: true }))
    try {
      const response = await fetch(`/api/jisho/translate?text=${encodeURIComponent(text)}&from=en&to=vi`)
      if (response.ok) {
        const data = await response.json()
        if (data.translated) {
          setVietnameseTranslations(prev => ({ ...prev, [index]: data.translated }))
        }
      }
    } catch (error) {
      console.error("Failed to fetch Vietnamese translation:", error)
    } finally {
      setLoadingVietnamese(prev => ({ ...prev, [index]: false }))
    }
  }, [vietnameseTranslations, loadingVietnamese])

  // Fetch Nepali translations when showNepali is enabled
  useEffect(() => {
    if (showNepali && word.senses.length > 0) {
      // Fetch translation for the first meaning immediately
      const primaryMeaning = word.senses[0]?.english_definitions.join("; ")
      if (primaryMeaning && !nepaliTranslations[0]) {
        fetchNepaliTranslation(primaryMeaning, 0)
      }
    }
  }, [showNepali, word.senses, fetchNepaliTranslation, nepaliTranslations])

  // Fetch Vietnamese translations when showVietnamese is enabled
  useEffect(() => {
    if (showVietnamese && word.senses.length > 0) {
      // Fetch translation for the first meaning immediately
      const primaryMeaning = word.senses[0]?.english_definitions.join("; ")
      if (primaryMeaning && !vietnameseTranslations[0]) {
        fetchVietnameseTranslation(primaryMeaning, 0)
      }
    }
  }, [showVietnamese, word.senses, fetchVietnameseTranslation, vietnameseTranslations])

  // Fetch all translations when expanded
  useEffect(() => {
    if (isExpanded && showNepali) {
      word.senses.forEach((sense, idx) => {
        const meaning = sense.english_definitions.join("; ")
        if (meaning && !nepaliTranslations[idx]) {
          fetchNepaliTranslation(meaning, idx)
        }
      })
    }
    if (isExpanded && showVietnamese) {
      word.senses.forEach((sense, idx) => {
        const meaning = sense.english_definitions.join("; ")
        if (meaning && !vietnameseTranslations[idx]) {
          fetchVietnameseTranslation(meaning, idx)
        }
      })
    }
  }, [isExpanded, showNepali, showVietnamese, word.senses, fetchNepaliTranslation, fetchVietnameseTranslation, nepaliTranslations, vietnameseTranslations])

  // Fetch example sentences when expanded
  useEffect(() => {
    if (isExpanded && !sentencesLoaded && mainWord) {
      const fetchSentences = async () => {
        setLoadingSentences(true)
        try {
          const response = await fetch(`/api/jisho/sentences?keyword=${encodeURIComponent(mainWord)}&limit=5`)
          if (response.ok) {
            const data = await response.json()
            setSentences(data.sentences || [])
          }
        } catch (error) {
          console.error("Failed to fetch sentences:", error)
        } finally {
          setLoadingSentences(false)
          setSentencesLoaded(true)
        }
      }
      fetchSentences()
    }
  }, [isExpanded, sentencesLoaded, mainWord])

  // Render word with clickable kanji
  const renderClickableKanji = (text: string) => {
    return text.split("").map((char, idx) => {
      if (isKanji(char)) {
        return (
          <Tooltip key={idx}>
            <TooltipTrigger asChild>
              <span
                className="cursor-pointer hover:text-primary hover:underline decoration-dotted underline-offset-4 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  onKanjiClick(char)
                }}
              >
                {char}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <span className="flex items-center gap-1">
                <Pencil className="h-3 w-3" />
                Click for stroke order
              </span>
            </TooltipContent>
          </Tooltip>
        )
      }
      return <span key={idx}>{char}</span>
    })
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        <div className="p-4">
          {/* Header with word and badges */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-2xl font-bold tracking-tight">
                  {renderClickableKanji(mainWord)}
                </h3>
                {word.japanese[0]?.word && (
                  <span className="text-lg text-muted-foreground">【{reading}】</span>
                )}
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {word.is_common && (
                  <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                    <Star className="h-3 w-3 mr-1" />
                    Common
                  </Badge>
                )}
                {getJlptDisplay(word.jlpt)}
                {word.tags?.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => onSpeak(mainWord)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Pronounce</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => onCopy(mainWord)}
                  >
                    {copiedText === mainWord ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-9 w-9", isBookmarked && "text-primary")}
                    onClick={onToggleBookmark}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="h-4 w-4" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isBookmarked ? "Remove bookmark" : "Bookmark"}</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Primary meaning */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {word.senses[0]?.parts_of_speech.map((pos, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className={cn("text-xs", getPosColor(pos))}
                >
                  {pos}
                </Badge>
              ))}
            </div>
            <p className="text-lg">
              {word.senses[0]?.english_definitions.join("; ")}
            </p>
            {/* Nepali Translation */}
            {showNepali && (nepaliTranslations[0] || loadingNepali[0]) && (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20">
                  नेपाली
                </Badge>
                {loadingNepali[0] ? (
                  <span className="text-sm text-muted-foreground animate-pulse">अनुवाद हुँदैछ...</span>
                ) : nepaliTranslations[0] ? (
                  <span className="text-base text-muted-foreground">{nepaliTranslations[0]}</span>
                ) : null}
              </div>
            )}
            {/* Vietnamese Translation */}
            {showVietnamese && (vietnameseTranslations[0] || loadingVietnamese[0]) && (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
                  Tiếng Việt
                </Badge>
                {loadingVietnamese[0] ? (
                  <span className="text-sm text-muted-foreground animate-pulse">Đang dịch...</span>
                ) : vietnameseTranslations[0] ? (
                  <span className="text-base text-muted-foreground">{vietnameseTranslations[0]}</span>
                ) : null}
              </div>
            )}
          </div>

          {/* Expand button if more senses */}
          {word.senses.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full"
              onClick={onToggleExpanded}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show {word.senses.length - 1} more meaning{word.senses.length > 2 ? "s" : ""}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="border-t bg-muted/30 p-4 space-y-4">
            {/* All meanings */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4" />
                All Meanings
              </h4>
              <div className="space-y-3">
                {word.senses.map((sense, idx) => (
                  <div key={idx} className="pl-4 border-l-2 border-primary/20">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {sense.parts_of_speech.map((pos, posIdx) => (
                        <Badge
                          key={posIdx}
                          variant="secondary"
                          className={cn("text-xs", getPosColor(pos))}
                        >
                          {pos}
                        </Badge>
                      ))}
                    </div>
                    <p className="font-medium">
                      {idx + 1}. {sense.english_definitions.join("; ")}
                    </p>
                    {/* Nepali Translation for each meaning */}
                    {/* Nepali Translation for each meaning */}
                    {showNepali && (nepaliTranslations[idx] || loadingNepali[idx]) && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">नेपाली:</span>
                        {loadingNepali[idx] ? (
                          <span className="text-sm text-muted-foreground animate-pulse">अनुवाद हुँदैछ...</span>
                        ) : nepaliTranslations[idx] ? (
                          <span className="text-sm text-muted-foreground">{nepaliTranslations[idx]}</span>
                        ) : null}
                      </div>
                    )}
                    {/* Vietnamese Translation for each meaning */}
                    {showVietnamese && (vietnameseTranslations[idx] || loadingVietnamese[idx]) && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">Tiếng Việt:</span>
                        {loadingVietnamese[idx] ? (
                          <span className="text-sm text-muted-foreground animate-pulse">Đang dịch...</span>
                        ) : vietnameseTranslations[idx] ? (
                          <span className="text-sm text-muted-foreground">{vietnameseTranslations[idx]}</span>
                        ) : null}
                      </div>
                    )}
                    {sense.info.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        ℹ️ {sense.info.join("; ")}
                      </p>
                    )}
                    {sense.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sense.tags.map((tag, tagIdx) => (
                          <Badge key={tagIdx} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {sense.see_also.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        See also: {sense.see_also.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Other forms */}
            {word.japanese.length > 1 && (
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <Languages className="h-4 w-4" />
                  Other Forms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {word.japanese.slice(1).map((form, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-base py-1 px-3 cursor-pointer hover:bg-primary/10"
                      onClick={() => onCopy(form.word || form.reading)}
                    >
                      {form.word || form.reading}
                      {form.word && form.reading && (
                        <span className="text-muted-foreground ml-1">({form.reading})</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Example Sentences */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <MessageSquareText className="h-4 w-4" />
                Example Sentences
              </h4>
              {loadingSentences ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="pl-4 border-l-2 border-primary/20 space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : sentences.length > 0 ? (
                <div className="space-y-3">
                  {sentences.map((sentence, idx) => (
                    <div 
                      key={sentence.id || idx} 
                      className="pl-4 border-l-2 border-primary/20 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <p className="text-base font-medium leading-relaxed">
                            {highlightWord(sentence.japanese, mainWord)}
                          </p>
                          {sentence.reading && (
                            <p className="text-sm text-muted-foreground">
                              {sentence.reading}
                            </p>
                          )}
                          {sentence.english && (
                            <p className="text-sm text-muted-foreground">
                              {sentence.english}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onSpeak(sentence.japanese)}
                              >
                                <Volume2 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Pronounce sentence</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onCopy(sentence.japanese)}
                              >
                                {copiedText === sentence.japanese ? (
                                  <Check className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy sentence</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground pl-4">
                  No example sentences found for this word.
                </p>
              )}
              
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function to highlight the searched word in a sentence
function highlightWord(sentence: string, word: string): React.ReactNode {
  if (!word || !sentence.includes(word)) {
    return sentence
  }
  
  const parts = sentence.split(word)
  return parts.map((part, idx) => (
    <span key={idx}>
      {part}
      {idx < parts.length - 1 && (
        <span className="bg-yellow-200 dark:bg-yellow-800/50 px-0.5 rounded">
          {word}
        </span>
      )}
    </span>
  ))
}
