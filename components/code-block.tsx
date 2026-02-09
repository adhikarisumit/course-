"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  WrapText,
  Hash,
  Code2,
  ChevronDown,
  Terminal,
  FileCode,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ─── Language definitions ──────────────────────────────────────────────────────

interface LanguageDef {
  id: string
  label: string
  aliases: string[]
  icon?: string
  category: "web" | "systems" | "scripting" | "data" | "shell" | "other"
}

const LANGUAGES: LanguageDef[] = [
  // Web
  { id: "javascript", label: "JavaScript", aliases: ["js"], category: "web" },
  { id: "typescript", label: "TypeScript", aliases: ["ts", "tsx"], category: "web" },
  { id: "jsx", label: "JSX", aliases: ["react"], category: "web" },
  { id: "tsx", label: "TSX", aliases: [], category: "web" },
  { id: "html", label: "HTML", aliases: ["markup", "xml", "svg"], category: "web" },
  { id: "css", label: "CSS", aliases: ["style"], category: "web" },
  { id: "scss", label: "SCSS", aliases: ["sass"], category: "web" },
  { id: "graphql", label: "GraphQL", aliases: ["gql"], category: "web" },

  // Systems
  { id: "c", label: "C", aliases: [], category: "systems" },
  { id: "cpp", label: "C++", aliases: ["c++"], category: "systems" },
  { id: "csharp", label: "C#", aliases: ["cs", "dotnet"], category: "systems" },
  { id: "java", label: "Java", aliases: [], category: "systems" },
  { id: "go", label: "Go", aliases: ["golang"], category: "systems" },
  { id: "rust", label: "Rust", aliases: ["rs"], category: "systems" },
  { id: "swift", label: "Swift", aliases: [], category: "systems" },
  { id: "kotlin", label: "Kotlin", aliases: ["kt"], category: "systems" },

  // Scripting
  { id: "python", label: "Python", aliases: ["py"], category: "scripting" },
  { id: "ruby", label: "Ruby", aliases: ["rb"], category: "scripting" },
  { id: "php", label: "PHP", aliases: [], category: "scripting" },
  { id: "perl", label: "Perl", aliases: ["pl"], category: "scripting" },
  { id: "lua", label: "Lua", aliases: [], category: "scripting" },
  { id: "r", label: "R", aliases: [], category: "scripting" },

  // Data & Config
  { id: "json", label: "JSON", aliases: [], category: "data" },
  { id: "yaml", label: "YAML", aliases: ["yml"], category: "data" },
  { id: "toml", label: "TOML", aliases: [], category: "data" },
  { id: "xml", label: "XML", aliases: [], category: "data" },
  { id: "sql", label: "SQL", aliases: ["mysql", "postgresql", "postgres"], category: "data" },
  { id: "markdown", label: "Markdown", aliases: ["md"], category: "data" },

  // Shell
  { id: "bash", label: "Bash", aliases: ["sh", "shell", "zsh"], category: "shell" },
  { id: "powershell", label: "PowerShell", aliases: ["ps1", "ps"], category: "shell" },
  { id: "docker", label: "Dockerfile", aliases: ["dockerfile"], category: "shell" },

  // Other
  { id: "dart", label: "Dart", aliases: [], category: "other" },
  { id: "elixir", label: "Elixir", aliases: ["ex"], category: "other" },
  { id: "haskell", label: "Haskell", aliases: ["hs"], category: "other" },
  { id: "scala", label: "Scala", aliases: [], category: "other" },
  { id: "text", label: "Plain Text", aliases: ["plaintext", "txt", "raw"], category: "other" },
]

const CATEGORY_LABELS: Record<string, string> = {
  web: "Web",
  systems: "Systems",
  scripting: "Scripting",
  data: "Data & Config",
  shell: "Shell & DevOps",
  other: "Other",
}

function resolveLanguage(raw: string): string {
  if (!raw) return "text"
  const lower = raw.toLowerCase().trim()
  const direct = LANGUAGES.find((l) => l.id === lower)
  if (direct) return direct.id
  const alias = LANGUAGES.find((l) => l.aliases.includes(lower))
  if (alias) return alias.id
  return lower
}

function getLanguageLabel(id: string): string {
  const lang = LANGUAGES.find((l) => l.id === id)
  return lang?.label ?? id.charAt(0).toUpperCase() + id.slice(1)
}

// ─── Component ─────────────────────────────────────────────────────────────────

export interface CodeBlockProps {
  /** The source code string */
  code: string
  /** Language identifier (e.g. "js", "python", "typescript") */
  language?: string
  /** Show the language selector dropdown – default true */
  showLanguageSelector?: boolean
  /** Optional filename to display */
  filename?: string
  /** Show line numbers – auto-detected from line count if not provided */
  showLineNumbers?: boolean
  /** Allow word-wrap toggle – default true */
  allowWrap?: boolean
  /** Allow full-screen expand – default true */
  allowExpand?: boolean
  /** Allow download – default false */
  allowDownload?: boolean
  /** Maximum height before scroll (px) – default 600 */
  maxHeight?: number
  /** Highlight specific lines (1-based) */
  highlightLines?: number[]
  /** Called when language changes (from selector) */
  onLanguageChange?: (lang: string) => void
  /** Additional className */
  className?: string
}

export default function CodeBlock({
  code,
  language: initialLanguage = "text",
  showLanguageSelector = true,
  filename,
  showLineNumbers: showLineNumbersProp,
  allowWrap = true,
  allowExpand = true,
  allowDownload = false,
  maxHeight = 600,
  highlightLines = [],
  onLanguageChange,
  className,
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const [language, setLanguage] = useState(() => resolveLanguage(initialLanguage))
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [wordWrap, setWordWrap] = useState(false)
  const [showNumbers, setShowNumbers] = useState(() =>
    showLineNumbersProp !== undefined ? showLineNumbersProp : code.split("\n").length > 3
  )

  const containerRef = useRef<HTMLDivElement>(null)

  const lineCount = code.split("\n").length

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [code])

  const handleDownload = useCallback(() => {
    const ext =
      LANGUAGES.find((l) => l.id === language)?.aliases[0] ?? language
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename ?? `snippet.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("File downloaded")
  }, [code, language, filename])

  const handleLanguageChange = useCallback(
    (val: string) => {
      setLanguage(val)
      onLanguageChange?.(val)
    },
    [onLanguageChange]
  )

  // ── Escape key to exit expand ──────────────────────────────────────────────

  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [expanded])

  // ── Highlight line callback ────────────────────────────────────────────────

  const lineProps = useCallback(
    (lineNumber: number) => {
      const style: React.CSSProperties = {}
      if (highlightLines.includes(lineNumber)) {
        style.backgroundColor = isDark
          ? "rgba(255, 255, 255, 0.07)"
          : "rgba(0, 0, 0, 0.05)"
        style.display = "block"
        style.borderLeft = `3px solid ${isDark ? "#58a6ff" : "#0969da"}`
        style.paddingLeft = "0.75rem"
        style.marginLeft = "-0.75rem"
      }
      return { style }
    },
    [highlightLines, isDark]
  )

  // ── Theme colours ──────────────────────────────────────────────────────────

  const headerBg = isDark ? "#161b22" : "#f6f8fa"
  const bodyBg = isDark ? "#0d1117" : "#ffffff"
  const borderColor = isDark ? "#30363d" : "#d1d9e0"
  const dotColors = isDark
    ? ["#f85149", "#d29922", "#3fb950"]
    : ["#ff5f56", "#ffbd2e", "#27c93f"]

  // ── Render ─────────────────────────────────────────────────────────────────

  const wrapperCn = cn(
    "rounded-xl overflow-hidden shadow-sm",
    "transition-all duration-200",
    expanded &&
      "fixed inset-4 z-50 rounded-xl shadow-2xl flex flex-col",
    className
  )

  return (
    <>
      {/* Backdrop for expanded mode */}
      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setExpanded(false)}
        />
      )}

      <div
        ref={containerRef}
        className={wrapperCn}
        style={{ border: `1px solid ${borderColor}` }}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{
            backgroundColor: headerBg,
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          {/* macOS traffic-light dots */}
          <div className="flex items-center gap-1.5 mr-2">
            {dotColors.map((c, i) => (
              <span
                key={i}
                className="block h-3 w-3 rounded-full"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Filename or language label */}
          {filename ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <FileCode className="h-3.5 w-3.5" />
              <span className="truncate max-w-[200px]">{filename}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
              <Badge
                variant="secondary"
                className="text-[10px] h-5 px-1.5 font-semibold uppercase tracking-wider"
              >
                {getLanguageLabel(language)}
              </Badge>
            </div>
          )}

          {/* Language selector */}
          {showLanguageSelector && (
            <div className="ml-auto">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger
                  className="h-7 w-[150px] text-xs border-none bg-transparent 
                    hover:bg-muted/60 focus:ring-0 focus:ring-offset-0
                    data-[state=open]:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Terminal className="h-3 w-3 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent
                  className="max-h-[320px]"
                  align="end"
                >
                  {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
                    const langs = LANGUAGES.filter((l) => l.category === cat)
                    if (!langs.length) return null
                    return (
                      <SelectGroup key={cat}>
                        <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold">
                          {label}
                        </SelectLabel>
                        {langs.map((l) => (
                          <SelectItem key={l.id} value={l.id} className="text-xs">
                            {l.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action buttons */}
          <div
            className={cn(
              "flex items-center gap-0.5",
              showLanguageSelector ? "" : "ml-auto"
            )}
          >
            <TooltipProvider delayDuration={300}>
              {/* Line numbers toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-7 w-7 text-muted-foreground hover:text-foreground transition-colors",
                      showNumbers && "text-foreground bg-muted/50"
                    )}
                    onClick={() => setShowNumbers((p) => !p)}
                  >
                    <Hash className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {showNumbers ? "Hide" : "Show"} line numbers
                </TooltipContent>
              </Tooltip>

              {/* Word wrap */}
              {allowWrap && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-7 w-7 text-muted-foreground hover:text-foreground transition-colors",
                        wordWrap && "text-foreground bg-muted/50"
                      )}
                      onClick={() => setWordWrap((p) => !p)}
                    >
                      <WrapText className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {wordWrap ? "Disable" : "Enable"} word wrap
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Copy */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {copied ? "Copied!" : "Copy code"}
                </TooltipContent>
              </Tooltip>

              {/* Download */}
              {allowDownload && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={handleDownload}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Download file
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Expand / Collapse */}
              {allowExpand && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setExpanded((p) => !p)}
                    >
                      {expanded ? (
                        <Minimize2 className="h-3.5 w-3.5" />
                      ) : (
                        <Maximize2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {expanded ? "Collapse (Esc)" : "Expand"}
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        </div>

        {/* ── Code body ───────────────────────────────────────────────────── */}
        <div
          className={cn(
            "overflow-auto",
            expanded ? "flex-1" : ""
          )}
          style={{
            maxHeight: expanded ? undefined : maxHeight,
            backgroundColor: bodyBg,
          }}
        >
          <SyntaxHighlighter
            language={language}
            style={isDark ? oneDark : oneLight}
            showLineNumbers={showNumbers}
            wrapLines={true}
            wrapLongLines={wordWrap}
            lineProps={highlightLines.length > 0 ? lineProps : undefined}
            customStyle={{
              margin: 0,
              padding: "1rem",
              background: "transparent",
              fontSize: "0.8125rem",
              lineHeight: "1.6",
              fontFamily:
                '"JetBrains Mono", "Fira Code", "Cascadia Code", "Source Code Pro", ui-monospace, monospace',
            }}
            lineNumberStyle={{
              minWidth: "3em",
              paddingRight: "1.25em",
              color: isDark ? "#484f58" : "#babbbd",
              userSelect: "none",
              fontSize: "0.75rem",
            }}
            codeTagProps={{
              style: {
                fontFamily: "inherit",
              },
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-1.5 text-[10px] text-muted-foreground/60"
          style={{
            backgroundColor: headerBg,
            borderTop: `1px solid ${borderColor}`,
          }}
        >
          <span>
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
          <span className="uppercase tracking-wider font-medium">
            {getLanguageLabel(language)}
          </span>
        </div>
      </div>
    </>
  )
}
