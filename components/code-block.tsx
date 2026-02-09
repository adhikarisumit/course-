"use client"

import { useState, useCallback } from "react"
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
} from "@/components/ui/select"
import { Copy, Check, Code2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ─── Language definitions ──────────────────────────────────────────────────────

interface LanguageDef {
  id: string
  label: string
  aliases: string[]
  category: "web" | "systems" | "scripting" | "data" | "shell" | "other"
}

const LANGUAGES: LanguageDef[] = [
  { id: "javascript", label: "JavaScript", aliases: ["js"], category: "web" },
  { id: "typescript", label: "TypeScript", aliases: ["ts", "tsx"], category: "web" },
  { id: "jsx", label: "JSX", aliases: ["react"], category: "web" },
  { id: "tsx", label: "TSX", aliases: [], category: "web" },
  { id: "html", label: "HTML", aliases: ["markup", "xml", "svg"], category: "web" },
  { id: "css", label: "CSS", aliases: ["style"], category: "web" },
  { id: "scss", label: "SCSS", aliases: ["sass"], category: "web" },
  { id: "graphql", label: "GraphQL", aliases: ["gql"], category: "web" },
  { id: "c", label: "C", aliases: [], category: "systems" },
  { id: "cpp", label: "C++", aliases: ["c++"], category: "systems" },
  { id: "csharp", label: "C#", aliases: ["cs", "dotnet"], category: "systems" },
  { id: "java", label: "Java", aliases: [], category: "systems" },
  { id: "go", label: "Go", aliases: ["golang"], category: "systems" },
  { id: "rust", label: "Rust", aliases: ["rs"], category: "systems" },
  { id: "swift", label: "Swift", aliases: [], category: "systems" },
  { id: "kotlin", label: "Kotlin", aliases: ["kt"], category: "systems" },
  { id: "python", label: "Python", aliases: ["py"], category: "scripting" },
  { id: "ruby", label: "Ruby", aliases: ["rb"], category: "scripting" },
  { id: "php", label: "PHP", aliases: [], category: "scripting" },
  { id: "perl", label: "Perl", aliases: ["pl"], category: "scripting" },
  { id: "lua", label: "Lua", aliases: [], category: "scripting" },
  { id: "r", label: "R", aliases: [], category: "scripting" },
  { id: "json", label: "JSON", aliases: [], category: "data" },
  { id: "yaml", label: "YAML", aliases: ["yml"], category: "data" },
  { id: "toml", label: "TOML", aliases: [], category: "data" },
  { id: "xml", label: "XML", aliases: [], category: "data" },
  { id: "sql", label: "SQL", aliases: ["mysql", "postgresql", "postgres"], category: "data" },
  { id: "markdown", label: "Markdown", aliases: ["md"], category: "data" },
  { id: "bash", label: "Bash", aliases: ["sh", "shell", "zsh"], category: "shell" },
  { id: "powershell", label: "PowerShell", aliases: ["ps1", "ps"], category: "shell" },
  { id: "docker", label: "Dockerfile", aliases: ["dockerfile"], category: "shell" },
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
  code: string
  language?: string
  showLanguageSelector?: boolean
  onLanguageChange?: (lang: string) => void
  className?: string
}

export default function CodeBlock({
  code,
  language: initialLanguage = "text",
  showLanguageSelector = true,
  onLanguageChange,
  className,
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const [language, setLanguage] = useState(() => resolveLanguage(initialLanguage))
  const [copied, setCopied] = useState(false)

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

  const handleLanguageChange = useCallback(
    (val: string) => {
      setLanguage(val)
      onLanguageChange?.(val)
    },
    [onLanguageChange]
  )

  const headerBg = isDark ? "#161b22" : "#f6f8fa"
  const bodyBg = isDark ? "#0d1117" : "#ffffff"
  const borderColor = isDark ? "#30363d" : "#d1d9e0"

  return (
    <div
      className={cn("rounded-lg overflow-hidden my-4", className)}
      style={{ border: `1px solid ${borderColor}` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{
          backgroundColor: headerBg,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        {/* Language selector or label */}
        {showLanguageSelector ? (
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger
              className="h-6 w-auto gap-1.5 text-[11px] font-medium border-none bg-transparent
                px-1.5 hover:bg-muted/60 focus:ring-0 focus:ring-offset-0
                data-[state=open]:bg-muted/60 transition-colors text-muted-foreground"
            >
              <Code2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{getLanguageLabel(language)}</span>
            </SelectTrigger>
            <SelectContent className="max-h-[320px]" align="start">
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
        ) : (
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            {getLanguageLabel(language)}
          </span>
        )}

        {/* Copy button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground transition-colors"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-500" />
              <span className="text-green-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Code body */}
      <div className="overflow-auto" style={{ maxHeight: 600, backgroundColor: bodyBg }}>
        <SyntaxHighlighter
          language={language}
          style={isDark ? oneDark : oneLight}
          showLineNumbers={code.split("\n").length > 3}
          wrapLines={true}
          wrapLongLines={false}
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
            minWidth: "2.5em",
            paddingRight: "1em",
            color: isDark ? "#484f58" : "#babbbd",
            userSelect: "none",
            fontSize: "0.75rem",
          }}
          codeTagProps={{ style: { fontFamily: "inherit" } }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
