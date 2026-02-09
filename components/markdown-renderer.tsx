"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import CodeBlock from "@/components/code-block"

interface MarkdownRendererProps {
  content: string
  className?: string
}

// Parse markdown content to structured elements
function parseMarkdown(markdown: string) {
  const lines = markdown.split('\n')
  const elements: Array<{
    type: 'heading' | 'paragraph' | 'code' | 'list' | 'blockquote' | 'hr' | 'image'
    content: string
    level?: number
    language?: string
    items?: string[]
    alt?: string
    src?: string
  }> = []

  let i = 0
  let inCodeBlock = false
  let codeContent = ''
  let codeLanguage = ''

  while (i < lines.length) {
    const line = lines[i]

    // Code block handling
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeLanguage = line.slice(3).trim() || 'text'
        codeContent = ''
      } else {
        inCodeBlock = false
        elements.push({
          type: 'code',
          content: codeContent.trim(),
          language: codeLanguage
        })
      }
      i++
      continue
    }

    if (inCodeBlock) {
      codeContent += (codeContent ? '\n' : '') + line
      i++
      continue
    }

    // Skip empty lines
    if (!line.trim()) {
      i++
      continue
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      elements.push({ type: 'hr', content: '' })
      i++
      continue
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      elements.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2]
      })
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('>')) {
      let quoteContent = line.slice(1).trim()
      i++
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteContent += '\n' + lines[i].slice(1).trim()
        i++
      }
      elements.push({ type: 'blockquote', content: quoteContent })
      continue
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*+]\s/, ''))
        i++
      }
      elements.push({ type: 'list', content: '', items })
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      elements.push({ type: 'list', content: '', items })
      continue
    }

    // Image
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imageMatch) {
      elements.push({
        type: 'image',
        content: '',
        alt: imageMatch[1],
        src: imageMatch[2]
      })
      i++
      continue
    }

    // Regular paragraph
    let paragraphContent = line
    i++
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].startsWith('```') && !lines[i].startsWith('>') && !/^[-*+]\s/.test(lines[i]) && !/^\d+\.\s/.test(lines[i])) {
      paragraphContent += ' ' + lines[i]
      i++
    }
    elements.push({ type: 'paragraph', content: paragraphContent })
  }

  return elements
}

// Format inline markdown (bold, italic, code, links)
function formatInlineMarkdown(text: string): React.ReactNode {
  // Process inline elements
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/^`([^`]+)`/)
    if (codeMatch) {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm">
          {codeMatch[1]}
        </code>
      )
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    // Bold
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/) || remaining.match(/^__([^_]+)__/)
    if (boldMatch) {
      parts.push(<strong key={key++}>{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    // Italic
    const italicMatch = remaining.match(/^\*([^*]+)\*/) || remaining.match(/^_([^_]+)_/)
    if (italicMatch) {
      parts.push(<em key={key++}>{italicMatch[1]}</em>)
      remaining = remaining.slice(italicMatch[0].length)
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

    // Regular text - find next special character
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

// CodeBlock is now imported from @/components/code-block

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`prose prose-gray dark:prose-invert max-w-none ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  const elements = parseMarkdown(content)

  // Helper function to render headings with proper level
  const renderHeading = (level: number | undefined, content: string, key: number) => {
    const formattedContent = formatInlineMarkdown(content)
    switch (level) {
      case 1: return <h1 key={key} className="scroll-mt-20">{formattedContent}</h1>
      case 2: return <h2 key={key} className="scroll-mt-20">{formattedContent}</h2>
      case 3: return <h3 key={key} className="scroll-mt-20">{formattedContent}</h3>
      case 4: return <h4 key={key} className="scroll-mt-20">{formattedContent}</h4>
      case 5: return <h5 key={key} className="scroll-mt-20">{formattedContent}</h5>
      case 6: return <h6 key={key} className="scroll-mt-20">{formattedContent}</h6>
      default: return <h2 key={key} className="scroll-mt-20">{formattedContent}</h2>
    }
  }

  return (
    <div className={`prose prose-gray dark:prose-invert max-w-none ${className}`}>
      {elements.map((element, index) => {
        switch (element.type) {
          case 'heading':
            return renderHeading(element.level, element.content, index)

          case 'paragraph':
            return (
              <p key={index}>
                {formatInlineMarkdown(element.content)}
              </p>
            )

          case 'code':
            return (
              <div key={index} className="not-prose my-4">
                <CodeBlock code={element.content} language={element.language || 'text'} showLanguageSelector={true} />
              </div>
            )

          case 'list':
            return (
              <ul key={index}>
                {element.items?.map((item, i) => (
                  <li key={i}>{formatInlineMarkdown(item)}</li>
                ))}
              </ul>
            )

          case 'blockquote':
            return (
              <blockquote key={index} className="border-l-4 border-primary pl-4 italic">
                {formatInlineMarkdown(element.content)}
              </blockquote>
            )

          case 'hr':
            return <hr key={index} className="my-8" />

          case 'image':
            return (
              <figure key={index} className="my-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={element.src}
                  alt={element.alt || ''}
                  className="rounded-lg max-w-full h-auto"
                />
                {element.alt && (
                  <figcaption className="text-center text-sm text-muted-foreground mt-2">
                    {element.alt}
                  </figcaption>
                )}
              </figure>
            )

          default:
            return null
        }
      })}
    </div>
  )
}

export default MarkdownRenderer
