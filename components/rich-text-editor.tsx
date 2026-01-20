"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Link,
  Image,
  Minus,
  Eye,
  Edit,
  Copy,
  Check,
  Table,
} from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash/Shell" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
]

// Parse content to render preview
function parseContent(content: string) {
  const elements: Array<{ type: string; content: string; language?: string }> = []
  const lines = content.split('\n')
  let i = 0
  let inCodeBlock = false
  let codeContent = ''
  let codeLanguage = ''

  while (i < lines.length) {
    const line = lines[i]

    // Code block detection
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeLanguage = line.slice(3).trim() || 'text'
        codeContent = ''
      } else {
        inCodeBlock = false
        elements.push({ type: 'code', content: codeContent.trim(), language: codeLanguage })
      }
      i++
      continue
    }

    if (inCodeBlock) {
      codeContent += (codeContent ? '\n' : '') + line
      i++
      continue
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push({ type: 'h3', content: line.slice(4) })
      i++
      continue
    }
    if (line.startsWith('## ')) {
      elements.push({ type: 'h2', content: line.slice(3) })
      i++
      continue
    }
    if (line.startsWith('# ')) {
      elements.push({ type: 'h1', content: line.slice(2) })
      i++
      continue
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      elements.push({ type: 'hr', content: '' })
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push({ type: 'blockquote', content: line.slice(2) })
      i++
      continue
    }

    // Unordered list
    if (/^[-*]\s/.test(line)) {
      elements.push({ type: 'li', content: line.slice(2) })
      i++
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      elements.push({ type: 'oli', content: line.replace(/^\d+\.\s/, '') })
      i++
      continue
    }

    // Table detection (markdown table)
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableRows: string[][] = []
      let hasHeader = false
      
      // Collect all table rows
      while (i < lines.length && lines[i].startsWith('|') && lines[i].endsWith('|')) {
        const row = lines[i]
        // Check if this is a separator row
        if (/^\|[\s\-:|]+\|$/.test(row)) {
          hasHeader = true
          i++
          continue
        }
        // Parse cells
        const cells = row.slice(1, -1).split('|').map(cell => cell.trim())
        tableRows.push(cells)
        i++
      }
      
      if (tableRows.length > 0) {
        elements.push({ 
          type: 'table', 
          content: JSON.stringify({ rows: tableRows, hasHeader }),
        })
      }
      continue
    }

    // Empty line
    if (!line.trim()) {
      elements.push({ type: 'br', content: '' })
      i++
      continue
    }

    // Regular paragraph
    elements.push({ type: 'p', content: line })
    i++
  }

  return elements
}

// Format inline text (bold, italic, code, links)
function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/^`([^`]+)`/)
    if (codeMatch) {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm text-primary">
          {codeMatch[1]}
        </code>
      )
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    // Bold
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/)
    if (boldMatch) {
      parts.push(<strong key={key++}>{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    // Italic
    const italicMatch = remaining.match(/^\*([^*]+)\*/)
    if (italicMatch) {
      parts.push(<em key={key++}>{italicMatch[1]}</em>)
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    // Underline (custom: __text__)
    const underlineMatch = remaining.match(/^__([^_]+)__/)
    if (underlineMatch) {
      parts.push(<u key={key++}>{underlineMatch[1]}</u>)
      remaining = remaining.slice(underlineMatch[0].length)
      continue
    }

    // Link
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      parts.push(
        <a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
          {linkMatch[1]}
        </a>
      )
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    // Regular text
    const nextSpecial = remaining.search(/[`*_\[]/)
    if (nextSpecial === -1) {
      parts.push(remaining)
      break
    } else if (nextSpecial === 0) {
      parts.push(remaining[0])
      remaining = remaining.slice(1)
    } else {
      parts.push(remaining.slice(0, nextSpecial))
      remaining = remaining.slice(nextSpecial)
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>
}

// Code block with copy button
function CodeBlockPreview({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-lg overflow-hidden border bg-[#282c34] my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-[#21252b]">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-gray-400 hover:text-white"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.875rem',
        }}
        showLineNumbers={code.split('\n').length > 2}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = "300px" }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [codeDialogOpen, setCodeDialogOpen] = useState(false)
  const [codeLanguage, setCodeLanguage] = useState("javascript")
  const [codeContent, setCodeContent] = useState("")
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkText, setLinkText] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [tableDialogOpen, setTableDialogOpen] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  // Excel-like table data: 2D array where row 0 is headers
  const [tableData, setTableData] = useState<string[][]>([
    ["Column 1", "Column 2", "Column 3"],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ])

  const insertAtCursor = useCallback((before: string, after: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange(newText)
    
    // Set cursor position after insert
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + before.length + selectedText.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }, [value, onChange])

  const wrapSelection = useCallback((wrapper: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    if (selectedText) {
      const newText = value.substring(0, start) + wrapper + selectedText + wrapper + value.substring(end)
      onChange(newText)
    }
  }, [value, onChange])

  const insertHeading = (level: number) => {
    const prefix = '#'.repeat(level) + ' '
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const newText = value.substring(0, lineStart) + prefix + value.substring(lineStart)
    onChange(newText)
  }

  const insertCodeBlock = () => {
    if (!codeContent.trim()) return
    
    const codeBlock = `\n\`\`\`${codeLanguage}\n${codeContent}\n\`\`\`\n`
    insertAtCursor(codeBlock)
    setCodeDialogOpen(false)
    setCodeContent("")
  }

  const insertLink = () => {
    if (!linkText || !linkUrl) return
    insertAtCursor(`[${linkText}](${linkUrl})`)
    setLinkDialogOpen(false)
    setLinkText("")
    setLinkUrl("")
  }

  const insertList = (ordered: boolean) => {
    const prefix = ordered ? "1. " : "- "
    insertAtCursor("\n" + prefix)
  }

  // Update table dimensions
  const updateTableSize = (newRows: number, newCols: number) => {
    const newData: string[][] = []
    for (let r = 0; r <= newRows; r++) { // +1 for header row
      const row: string[] = []
      for (let c = 0; c < newCols; c++) {
        row.push(tableData[r]?.[c] || (r === 0 ? `Column ${c + 1}` : ""))
      }
      newData.push(row)
    }
    setTableData(newData)
    setTableRows(newRows)
    setTableCols(newCols)
  }

  // Update a specific cell
  const updateCell = (row: number, col: number, value: string) => {
    const newData = tableData.map((r, ri) => 
      ri === row ? r.map((c, ci) => ci === col ? value : c) : [...r]
    )
    setTableData(newData)
  }

  // Add a row
  const addRow = () => {
    const newRow = Array(tableCols).fill("")
    setTableData([...tableData, newRow])
    setTableRows(tableRows + 1)
  }

  // Add a column
  const addColumn = () => {
    const newData = tableData.map((row, i) => [...row, i === 0 ? `Column ${tableCols + 1}` : ""])
    setTableData(newData)
    setTableCols(tableCols + 1)
  }

  // Delete a row (not header)
  const deleteRow = (rowIndex: number) => {
    if (rowIndex === 0 || tableRows <= 1) return
    const newData = tableData.filter((_, i) => i !== rowIndex)
    setTableData(newData)
    setTableRows(tableRows - 1)
  }

  // Delete a column
  const deleteColumn = (colIndex: number) => {
    if (tableCols <= 1) return
    const newData = tableData.map(row => row.filter((_, i) => i !== colIndex))
    setTableData(newData)
    setTableCols(tableCols - 1)
  }

  const insertTable = () => {
    // Build markdown table from tableData
    const headers = tableData[0]
    const dataRows = tableData.slice(1)
    
    // Calculate max width for each column
    const colWidths = headers.map((h, colIndex) => {
      const maxDataWidth = Math.max(...dataRows.map(row => (row[colIndex] || "").length))
      return Math.max(h.length, maxDataWidth, 10)
    })
    
    // Build header row
    const headerRow = "| " + headers.map((h, i) => (h || `Column ${i+1}`).padEnd(colWidths[i])).join(" | ") + " |"
    
    // Build separator
    const separatorRow = "| " + colWidths.map(w => "-".repeat(w)).join(" | ") + " |"
    
    // Build data rows
    const dataRowsStr = dataRows.map(row => 
      "| " + row.map((cell, i) => (cell || "").padEnd(colWidths[i])).join(" | ") + " |"
    ).join("\n")
    
    const tableMarkdown = `\n${headerRow}\n${separatorRow}\n${dataRowsStr}\n`
    insertAtCursor(tableMarkdown)
    setTableDialogOpen(false)
    
    // Reset table
    setTableRows(3)
    setTableCols(3)
    setTableData([
      ["Column 1", "Column 2", "Column 3"],
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ])
  }

  const renderPreview = () => {
    const elements = parseContent(value)
    let oliCounter = 0  // Track ordered list numbering
    
    return (
      <div className="prose prose-gray dark:prose-invert max-w-none p-4">
        {elements.map((el, i) => {
          // Reset counter when we hit a non-oli element after oli items
          if (el.type !== 'oli' && oliCounter > 0) {
            oliCounter = 0
          }
          
          switch (el.type) {
            case 'h1':
              return <h1 key={i} className="text-3xl font-bold mt-6 mb-4">{formatInline(el.content)}</h1>
            case 'h2':
              return <h2 key={i} className="text-2xl font-bold mt-5 mb-3">{formatInline(el.content)}</h2>
            case 'h3':
              return <h3 key={i} className="text-xl font-semibold mt-4 mb-2">{formatInline(el.content)}</h3>
            case 'p':
              return <p key={i} className="mb-3 leading-relaxed">{formatInline(el.content)}</p>
            case 'code':
              return <CodeBlockPreview key={i} code={el.content} language={el.language || 'text'} />
            case 'blockquote':
              return <blockquote key={i} className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">{formatInline(el.content)}</blockquote>
            case 'li':
              return <div key={i} className="flex items-start gap-2 mb-1"><span className="text-primary">•</span><span>{formatInline(el.content)}</span></div>
            case 'oli':
              oliCounter++
              return <div key={i} className="flex items-start gap-2 mb-1"><span className="text-primary font-medium min-w-[1.5rem]">{oliCounter}.</span><span>{formatInline(el.content)}</span></div>
            case 'hr':
              return <hr key={i} className="my-6 border-border" />
            case 'br':
              return <div key={i} className="h-4" />
            case 'table':
              try {
                const tableData = JSON.parse(el.content)
                const rows = tableData.rows as string[][]
                const hasHeader = tableData.hasHeader
                return (
                  <div key={i} className="my-4 overflow-x-auto">
                    <table className="min-w-full border-collapse border border-border">
                      {hasHeader && rows.length > 0 && (
                        <thead>
                          <tr className="bg-muted/50">
                            {rows[0].map((cell, j) => (
                              <th key={j} className="border border-border px-4 py-2 text-left font-semibold">
                                {formatInline(cell)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                      )}
                      <tbody>
                        {rows.slice(hasHeader ? 1 : 0).map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-muted/30">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="border border-border px-4 py-2">
                                {formatInline(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              } catch {
                return null
              }
            default:
              return <p key={i}>{el.content}</p>
          }
        })}
        {elements.length === 0 && (
          <p className="text-muted-foreground italic">No content to preview</p>
        )}
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
        {/* Text formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => wrapSelection("**")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => wrapSelection("*")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => wrapSelection("__")}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertHeading(1)}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertHeading(2)}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertHeading(3)}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertList(false)}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertList(true)}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Quote */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertAtCursor("\n> ")}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        {/* Horizontal rule */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertAtCursor("\n---\n")}
          title="Horizontal Line"
        >
          <Minus className="h-4 w-4" />
        </Button>

        {/* Table Dialog - Excel-like Editor */}
        <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 gap-1"
              title="Insert Table"
            >
              <Table className="h-4 w-4" />
              <span className="text-xs">Table</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Create Table</DialogTitle>
              <DialogDescription>
                Click on any cell to edit. First row is the header.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-auto py-4">
              {/* Table Controls */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Columns:</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => tableCols > 1 && updateTableSize(tableRows, tableCols - 1)}
                      disabled={tableCols <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{tableCols}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => tableCols < 10 && updateTableSize(tableRows, tableCols + 1)}
                      disabled={tableCols >= 10}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Rows:</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => tableRows > 1 && updateTableSize(tableRows - 1, tableCols)}
                      disabled={tableRows <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{tableRows}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => tableRows < 20 && updateTableSize(tableRows + 1, tableCols)}
                      disabled={tableRows >= 20}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Excel-like Table Grid */}
              <div className="border rounded-lg overflow-x-auto bg-background">
                <table className="w-full border-collapse">
                  {/* Column Letters Header (like Excel A, B, C...) */}
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="w-10 min-w-[40px] border-r border-b px-2 py-1.5 text-xs text-muted-foreground font-normal">
                        #
                      </th>
                      {Array.from({ length: tableCols }).map((_, colIndex) => (
                        <th key={colIndex} className="min-w-[120px] border-r border-b px-2 py-1.5 text-xs text-muted-foreground font-medium">
                          {String.fromCharCode(65 + colIndex)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Header Row (Row 0) */}
                    <tr className="bg-blue-500/10">
                      <td className="border-r border-b px-2 py-1 text-xs text-center text-muted-foreground font-medium bg-muted/50">
                        H
                      </td>
                      {tableData[0]?.map((cell, colIndex) => (
                        <td key={colIndex} className="border-r border-b p-0">
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => updateCell(0, colIndex, e.target.value)}
                            className="w-full px-2 py-1.5 text-sm font-semibold bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset"
                            placeholder={`Header ${colIndex + 1}`}
                          />
                        </td>
                      ))}
                    </tr>
                    {/* Data Rows */}
                    {tableData.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-muted/30">
                        <td className="border-r border-b px-2 py-1 text-xs text-center text-muted-foreground bg-muted/50">
                          {rowIndex + 1}
                        </td>
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border-r border-b p-0">
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => updateCell(rowIndex + 1, colIndex, e.target.value)}
                              className="w-full px-2 py-1.5 text-sm bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset"
                              placeholder=""
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quick Tips */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Tips:</span> Row "H" is the header row (shown in bold). 
                  Click any cell to type. Use +/- buttons to add or remove rows and columns.
                </p>
              </div>
            </div>

            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setTableDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={insertTable}>
                Insert Table
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Code Block Dialog */}
        <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 gap-1"
              title="Insert Code Block"
            >
              <Code className="h-4 w-4" />
              <span className="text-xs">Code</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Insert Code Block</DialogTitle>
              <DialogDescription>
                Add a code snippet with syntax highlighting
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  placeholder="Paste or type your code here..."
                  className="font-mono text-sm min-h-[200px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCodeDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={insertCodeBlock}>
                Insert Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Inline code */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => wrapSelection("`")}
          title="Inline Code"
        >
          <code className="text-xs font-mono">{`<>`}</code>
        </Button>

        {/* Link Dialog */}
        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Insert Link"
            >
              <Link className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Link Text</Label>
                <Input
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Display text"
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={insertLink}>
                Insert Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Preview toggle */}
        <Button
          type="button"
          variant={isPreview ? "secondary" : "ghost"}
          size="sm"
          className="h-8 px-3 gap-1"
          onClick={() => setIsPreview(!isPreview)}
        >
          {isPreview ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="text-xs">{isPreview ? "Edit" : "Preview"}</span>
        </Button>
      </div>

      {/* Editor / Preview */}
      {isPreview ? (
        <div 
          className="overflow-auto bg-card"
          style={{ minHeight }}
        >
          {renderPreview()}
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Start writing your content...\n\nUse the toolbar to format text, add headings, lists, code blocks, and more."}
          className="border-0 rounded-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-sm"
          style={{ minHeight }}
        />
      )}

      {/* Help text */}
      <div className="px-3 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
        <span className="font-medium">Tip:</span> Select text and click formatting buttons, or use the Code button to add syntax-highlighted code blocks.
      </div>
    </div>
  )
}

export default RichTextEditor
