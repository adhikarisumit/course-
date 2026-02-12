"use client"

import { useState } from "react"
import CodeBlock from "@/components/code-block"

interface ContentRendererProps {
  content: string
  className?: string
}

// Format inline text (bold, italic, code, links, underline)
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
      parts.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>)
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

    // Underline
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
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:no-underline"
        >
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

// Parse content to structured elements
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
        elements.push({ type: 'code', content: codeContent, language: codeLanguage })
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
      i++
      continue
    }

    // Regular paragraph
    elements.push({ type: 'p', content: line })
    i++
  }

  return elements
}

export function ContentRenderer({ content, className = "" }: ContentRendererProps) {
  if (!content) return null

  const elements = parseContent(content)
  let listIndex = 0

  return (
    <div className={`prose prose-gray dark:prose-invert max-w-none ${className}`}>
      {elements.map((el, i) => {
        // Reset list index for non-list items
        if (el.type !== 'oli') listIndex = 0
        if (el.type === 'oli') listIndex++

        switch (el.type) {
          case 'h1':
            return (
              <h1 key={i} className="text-3xl font-bold mt-8 mb-4 first:mt-0">
                {formatInline(el.content)}
              </h1>
            )
          case 'h2':
            return (
              <h2 key={i} className="text-2xl font-bold mt-6 mb-3">
                {formatInline(el.content)}
              </h2>
            )
          case 'h3':
            return (
              <h3 key={i} className="text-xl font-semibold mt-5 mb-2">
                {formatInline(el.content)}
              </h3>
            )
          case 'p':
            return (
              <p key={i} className="mb-4 leading-relaxed">
                {formatInline(el.content)}
              </p>
            )
          case 'code':
            return <CodeBlock key={i} code={el.content} language={el.language || 'text'} showLanguageSelector={false} className="my-4" />
          case 'blockquote':
            return (
              <blockquote key={i} className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">
                {formatInline(el.content)}
              </blockquote>
            )
          case 'li':
            return (
              <div key={i} className="flex items-start gap-3 mb-2">
                <span className="text-primary mt-1.5 text-lg leading-none">•</span>
                <span className="flex-1">{formatInline(el.content)}</span>
              </div>
            )
          case 'oli':
            return (
              <div key={i} className="flex items-start gap-3 mb-2">
                <span className="text-primary font-semibold min-w-[1.5rem]">{listIndex}.</span>
                <span className="flex-1">{formatInline(el.content)}</span>
              </div>
            )
          case 'hr':
            return <hr key={i} className="my-8 border-border" />
          case 'table':
            try {
              const tableData = JSON.parse(el.content)
              const rows = tableData.rows as string[][]
              const hasHeader = tableData.hasHeader
              return (
                <div key={i} className="my-6 overflow-x-auto">
                  <table className="min-w-full border-collapse border border-border rounded-lg">
                    {hasHeader && rows.length > 0 && (
                      <thead>
                        <tr className="bg-muted/50">
                          {rows[0].map((cell, j) => (
                            <th key={j} className="border border-border px-4 py-3 text-left font-semibold">
                              {formatInline(cell)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody>
                      {rows.slice(hasHeader ? 1 : 0).map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-muted/30 transition-colors">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="border border-border px-4 py-3">
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
    </div>
  )
}

export default ContentRenderer
