"use client"

import { useState, useEffect, useRef } from "react"
import { X, Volume2, Copy, Check, Loader2, Pencil, Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface KanjiData {
  kanji: string
  meanings: string[]
  kunReadings: string[]
  onReadings: string[]
  strokeCount: number
  jlpt: number | null
  grade: number | null
  unicode: string
  codePoint: string
  strokeOrderSvgUrl: string | null
  strokeOrderGifUrl: string
  svgContent: string | null
  strokePaths: string[]
}

interface KanjiStrokeModalProps {
  kanji: string | null
  isOpen: boolean
  onClose: () => void
}

// JLPT level colors
const jlptColors: Record<number, string> = {
  5: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  4: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  3: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  2: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  1: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
}

// Grade level descriptions
const gradeDescriptions: Record<number, string> = {
  1: "Grade 1 (6-7 years)",
  2: "Grade 2 (7-8 years)",
  3: "Grade 3 (8-9 years)",
  4: "Grade 4 (9-10 years)",
  5: "Grade 5 (10-11 years)",
  6: "Grade 6 (11-12 years)",
  8: "Junior High",
  9: "Jinmeiyō (names)",
  10: "Jinmeiyō (names)",
}

export default function KanjiStrokeModal({ kanji, isOpen, onClose }: KanjiStrokeModalProps) {
  const [kanjiData, setKanjiData] = useState<KanjiData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"animation" | "step" | "static">("animation")
  const [gifLoaded, setGifLoaded] = useState(false)
  const [gifError, setGifError] = useState(false)
  const [currentStroke, setCurrentStroke] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && kanji) {
      fetchKanjiData(kanji)
    }
  }, [isOpen, kanji])

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setKanjiData(null)
      setError(null)
      setGifLoaded(false)
      setGifError(false)
      setViewMode("animation")
      setCurrentStroke(1)
      setIsPlaying(false)
    }
  }, [isOpen])

  // Auto-play stroke animation
  useEffect(() => {
    if (isPlaying && kanjiData && viewMode === "step") {
      const interval = setInterval(() => {
        setCurrentStroke((prev) => {
          if (prev >= kanjiData.strokeCount) {
            setIsPlaying(false)
            return kanjiData.strokeCount
          }
          return prev + 1
        })
      }, 800)
      return () => clearInterval(interval)
    }
  }, [isPlaying, kanjiData, viewMode])

  // Update SVG stroke visibility when currentStroke changes
  useEffect(() => {
    if (viewMode === "step" && svgContainerRef.current && kanjiData?.svgContent) {
      const svg = svgContainerRef.current.querySelector('svg')
      if (svg) {
        const paths = svg.querySelectorAll('path')
        paths.forEach((path, index) => {
          // Skip paths that are stroke numbers (usually have specific styling)
          const pathId = path.getAttribute('id') || ''
          if (pathId.includes('StrokeNumbers') || pathId.includes('number')) {
            path.style.display = 'none'
            return
          }
          
          if (index < currentStroke) {
            path.style.opacity = index === currentStroke - 1 ? '1' : '0.5'
            path.style.stroke = index === currentStroke - 1 ? '#ef4444' : '#000000'
            path.style.strokeWidth = index === currentStroke - 1 ? '5' : '3'
            path.style.display = ''
          } else {
            path.style.opacity = '0.1'
            path.style.stroke = '#cccccc'
            path.style.display = ''
          }
        })
      }
    }
  }, [currentStroke, viewMode, kanjiData])

  const fetchKanjiData = async (kanjiChar: string) => {
    setLoading(true)
    setError(null)
    setGifLoaded(false)
    setGifError(false)

    try {
      const response = await fetch(`/api/jisho/kanji?kanji=${encodeURIComponent(kanjiChar)}`)
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch kanji data")
      }

      const data = await response.json()
      setKanjiData(data)
      setCurrentStroke(1)
    } catch (err) {
      console.error("Failed to fetch kanji:", err)
      setError(err instanceof Error ? err.message : "Failed to load kanji information")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      toast({ description: "Copied to clipboard" })
      setTimeout(() => setCopiedText(null), 2000)
    } catch {
      toast({ variant: "destructive", description: "Failed to copy" })
    }
  }

  const speakJapanese = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "ja-JP"
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const handlePlayPause = () => {
    if (currentStroke >= (kanjiData?.strokeCount || 0)) {
      setCurrentStroke(1)
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setCurrentStroke(1)
    setIsPlaying(false)
  }

  const handlePrevStroke = () => {
    setIsPlaying(false)
    setCurrentStroke((prev) => Math.max(1, prev - 1))
  }

  const handleNextStroke = () => {
    setIsPlaying(false)
    setCurrentStroke((prev) => Math.min(kanjiData?.strokeCount || 1, prev + 1))
  }

  // Process SVG content to make it suitable for display
  const getProcessedSvg = () => {
    if (!kanjiData?.svgContent) return null
    
    let svg = kanjiData.svgContent
    // Remove XML declaration if present
    svg = svg.replace(/<\?xml[^>]*\?>/g, '')
    // Add viewBox if not present and set size
    if (!svg.includes('viewBox')) {
      svg = svg.replace('<svg', '<svg viewBox="0 0 109 109"')
    }
    // Remove fixed width/height to make it responsive
    svg = svg.replace(/width="[^"]*"/g, 'width="100%"')
    svg = svg.replace(/height="[^"]*"/g, 'height="100%"')
    
    return svg
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Kanji Stroke Order
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <Skeleton className="h-52 w-52" />
            </div>
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : kanjiData ? (
          <TooltipProvider>
            <div className="space-y-6">
              {/* View Mode Toggle */}
              <div className="flex justify-center gap-2">
                <Button
                  variant={viewMode === "animation" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("animation")}
                >
                  Animation
                </Button>
                <Button
                  variant={viewMode === "step" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setViewMode("step")
                    setCurrentStroke(1)
                  }}
                  disabled={!kanjiData.svgContent}
                >
                  Step by Step
                </Button>
                <Button
                  variant={viewMode === "static" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("static")}
                >
                  Static
                </Button>
              </div>

              {/* Kanji Display */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {viewMode === "animation" ? (
                    <div className="relative w-52 h-52 bg-white dark:bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/30">
                      {/* Practice grid */}
                      <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="w-full h-full grid grid-cols-2 grid-rows-2">
                          <div className="border-r border-b border-gray-400"></div>
                          <div className="border-b border-gray-400"></div>
                          <div className="border-r border-gray-400"></div>
                          <div></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-[1px] bg-gray-400"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-full w-[1px] bg-gray-400"></div>
                        </div>
                      </div>
                      
                      {!gifLoaded && !gifError && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      
                      {!gifError ? (
                        <img
                          key={kanjiData.strokeOrderGifUrl}
                          src={kanjiData.strokeOrderGifUrl}
                          alt={`Stroke order for ${kanjiData.kanji}`}
                          className={cn(
                            "w-full h-full object-contain p-2",
                            !gifLoaded && "opacity-0"
                          )}
                          onLoad={() => {
                            console.log("GIF loaded:", kanjiData.strokeOrderGifUrl)
                            setGifLoaded(true)
                          }}
                          onError={(e) => {
                            console.error("GIF failed to load:", kanjiData.strokeOrderGifUrl, e)
                            setGifError(true)
                          }}
                        />
                      ) : (
                        <span className="text-8xl font-serif text-black">{kanjiData.kanji}</span>
                      )}
                      
                      <div className="absolute bottom-2 right-2 bg-background/90 px-2 py-1 rounded text-xs font-medium">
                        {kanjiData.strokeCount} strokes
                      </div>
                    </div>
                  ) : viewMode === "step" && kanjiData.svgContent ? (
                    <div className="space-y-4">
                      <div className="relative w-52 h-52 bg-white dark:bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/30">
                        {/* Practice grid */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                          <div className="w-full h-full grid grid-cols-2 grid-rows-2">
                            <div className="border-r border-b border-gray-400"></div>
                            <div className="border-b border-gray-400"></div>
                            <div className="border-r border-gray-400"></div>
                            <div></div>
                          </div>
                        </div>
                        
                        {/* SVG with strokes */}
                        <div 
                          ref={svgContainerRef}
                          className="w-full h-full p-2 [&_svg]:w-full [&_svg]:h-full"
                          dangerouslySetInnerHTML={{ __html: getProcessedSvg() || '' }}
                        />
                        
                        {/* Current stroke number indicator */}
                        <div className="absolute top-2 left-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                          {currentStroke}
                        </div>
                        
                        {/* Progress indicator */}
                        <div className="absolute bottom-2 right-2 bg-background/90 px-2 py-1 rounded text-xs font-medium">
                          {currentStroke} / {kanjiData.strokeCount}
                        </div>
                      </div>

                      {/* Stroke Controls */}
                      <div className="flex items-center justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={handleReset}
                              disabled={currentStroke === 1 && !isPlaying}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reset</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={handlePrevStroke}
                              disabled={currentStroke === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Previous stroke</TooltipContent>
                        </Tooltip>

                        <Button
                          variant="default"
                          size="icon"
                          onClick={handlePlayPause}
                          className="w-12 h-10"
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={handleNextStroke}
                              disabled={currentStroke === kanjiData.strokeCount}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Next stroke</TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Stroke Progress Slider */}
                      <div className="px-4">
                        <Slider
                          value={[currentStroke]}
                          min={1}
                          max={kanjiData.strokeCount}
                          step={1}
                          onValueChange={(value) => {
                            setIsPlaying(false)
                            setCurrentStroke(value[0])
                          }}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Stroke 1</span>
                          <span>Stroke {kanjiData.strokeCount}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-52 h-52 bg-white dark:bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                      <span className="text-9xl font-serif text-black select-none">{kanjiData.kanji}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => speakJapanese(kanjiData.kanji)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Pronounce</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(kanjiData.kanji)}
                      >
                        {copiedText === kanjiData.kanji ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Kanji Info */}
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {kanjiData.strokeCount} strokes
                  </Badge>
                  {kanjiData.jlpt && (
                    <Badge
                      variant="outline"
                      className={cn("text-sm", jlptColors[kanjiData.jlpt])}
                    >
                      JLPT N{kanjiData.jlpt}
                    </Badge>
                  )}
                  {kanjiData.grade && gradeDescriptions[kanjiData.grade] && (
                    <Badge variant="outline" className="text-sm">
                      {gradeDescriptions[kanjiData.grade]}
                    </Badge>
                  )}
                </div>

                {/* Meanings */}
                {kanjiData.meanings.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                      Meanings
                    </h4>
                    <p className="text-center text-lg">
                      {kanjiData.meanings.join(", ")}
                    </p>
                  </div>
                )}

                {/* Readings */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Kun'yomi */}
                  {kanjiData.kunReadings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                        Kun&apos;yomi (Japanese)
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {kanjiData.kunReadings.map((reading, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-sm cursor-pointer hover:bg-primary/10"
                            onClick={() => copyToClipboard(reading)}
                          >
                            {reading}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* On'yomi */}
                  {kanjiData.onReadings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                        On&apos;yomi (Chinese)
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {kanjiData.onReadings.map((reading, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-sm cursor-pointer hover:bg-primary/10"
                            onClick={() => copyToClipboard(reading)}
                          >
                            {reading}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stroke Order Instructions */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Pencil className="h-4 w-4" />
                    Stroke Order Rules
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Top to bottom</strong> - Write upper strokes first</li>
                    <li>• <strong>Left to right</strong> - Write left strokes first</li>
                    <li>• <strong>Horizontal before vertical</strong> - When crossing</li>
                    <li>• <strong>Outside before inside</strong> - For enclosures</li>
                    <li>• <strong>Close frame last</strong> - Bottom stroke of boxes last</li>
                    <li>• <strong>Center before sides</strong> - For symmetrical kanji</li>
                  </ul>
                </div>
              </div>
            </div>
          </TooltipProvider>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
