"use client"

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Trash2, Copy, Check } from "lucide-react"
import dynamic from 'next/dynamic'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-sql'
import 'prismjs/themes/prism.css'
import { useTheme } from "next-themes"

const Header = dynamic(() => import('@/components/header').then(mod => ({ default: mod.Header })), { ssr: false })
const Footer = dynamic(() => import('@/components/footer').then(mod => ({ default: mod.Footer })), { ssr: false })

const CODE_TEMPLATES = {
  javascript: `// JavaScript Code
console.log("Hello, World!");

// Try some operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

// Function example
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("Proteclink"));`,

  python: `# Python Code
print("Hello, World!")

# Try some operations
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print("Doubled:", doubled)

# Function example
def greet(name):
    return f"Hello, {name}!"
print(greet("Proteclink"))`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Playground</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: #f0f0f0;
    }
    .container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: #17eb1e; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Proteclink!</h1>
    <p>Edit this HTML to see changes.</p>
    <button onclick="alert('Hello!')">Click Me</button>
  </div>
</body>
</html>`,

  css: `/* CSS Playground */
body {
  margin: 0;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  text-align: center;
}

h1 {
  color: #17eb1e;
  margin: 0 0 10px 0;
  font-size: 2.5em;
}

p {
  color: #666;
  font-size: 1.2em;
}`,

  sql: `-- SQL Queries (Display Only)
SELECT * FROM courses 
WHERE category = 'Programming'
ORDER BY rating DESC
LIMIT 10;

-- Join example
SELECT users.name, courses.title, enrollments.enrolled_date
FROM enrollments
JOIN users ON enrollments.user_id = users.id
JOIN courses ON enrollments.course_id = courses.id
WHERE enrollments.status = 'active';

-- Aggregate example
SELECT category, COUNT(*) as course_count, AVG(rating) as avg_rating
FROM courses
GROUP BY category
HAVING COUNT(*) > 5;`,
}

export default function PlaygroundPage() {
  const [language, setLanguage] = useState<keyof typeof CODE_TEMPLATES>("javascript")
  const [code, setCode] = useState(CODE_TEMPLATES.javascript)
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pyodideRef = useRef<any>(null)
  const [isPyodideLoading, setIsPyodideLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const editorRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Debounce auto-save
  useEffect(() => {
    if (!mounted) return
    const timer = setTimeout(() => {
      localStorage.setItem(`playground-code-\${language}`, code)
    }, 1000)
    return () => clearTimeout(timer)
  }, [code, language, mounted])

  // Load code from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCode = localStorage.getItem(`playground-code-${language}`)
      if (savedCode) {
        setCode(savedCode)
      }
    }
  }, [language])

  // Auto-save code to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && code !== CODE_TEMPLATES[language]) {
      const timer = setTimeout(() => {
        localStorage.setItem(`playground-code-${language}`, code)
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 2000)
      }, 1000) // Debounce for 1 second

      return () => clearTimeout(timer)
    }
  }, [code, language])

  // Load Pyodide for Python execution
  useEffect(() => {
    const loadPyodide = async () => {
      if (typeof window !== 'undefined' && !pyodideRef.current) {
        setIsPyodideLoading(true)
        try {
          // @ts-ignore
          const pyodide = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
          })
          pyodideRef.current = pyodide
        } catch (error) {
          console.error("Failed to load Pyodide:", error)
        } finally {
          setIsPyodideLoading(false)
        }
      }
    }
    loadPyodide()
  }, [])

  const handleLanguageChange = (newLang: keyof typeof CODE_TEMPLATES) => {
    setLanguage(newLang)
    // Load saved code or use template
    const savedCode = localStorage.getItem(`playground-code-${newLang}`)
    setCode(savedCode || CODE_TEMPLATES[newLang])
    setOutput("")
  }

  const runCode = async () => {
    setIsRunning(true)
    setOutput("")

    try {
      if (language === "javascript") {
        // Capture console.log output
        const logs: string[] = []
        const originalLog = console.log
        console.log = (...args) => {
          logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '))
        }

        try {
          // Execute the code
          // eslint-disable-next-line no-eval
          eval(code)
          setOutput(logs.join('\n') || "Code executed successfully (no output)")
        } catch (error) {
          setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`)
        } finally {
          console.log = originalLog
        }
      } else if (language === "python") {
        if (!pyodideRef.current) {
          setOutput(isPyodideLoading 
            ? "⏳ Loading Python runtime... Please wait a moment and try again."
            : "❌ Python runtime failed to load. Please refresh the page.")
          setIsRunning(false)
          return
        }

        try {
          // Redirect stdout to capture print statements
          pyodideRef.current.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
          `)
          
          // Run the user's code
          pyodideRef.current.runPython(code)
          
          // Get the captured output
          const stdout = pyodideRef.current.runPython(`
sys.stdout.getvalue()
          `)
          
          setOutput(stdout || "Code executed successfully (no output)")
        } catch (error) {
          setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`)
        }
      } else if (language === "html") {
        // Open HTML in new window
        const newWindow = window.open()
        if (newWindow) {
          newWindow.document.write(code)
          newWindow.document.close()
          setOutput("✓ HTML opened in new window")
        } else {
          setOutput("❌ Popup blocked. Please allow popups for this site.")
        }
      } else if (language === "css") {
        setOutput("💡 CSS Preview:\n\nTo see CSS in action:\n1. Combine it with HTML in the HTML tab\n2. Or copy it to your project's stylesheet\n\nCSS is ready to use!")
      } else if (language === "sql") {
        setOutput("⚠️ SQL execution requires a database connection.\nThis is a display-only editor for SQL queries.\n\nTo run SQL:\n1. Copy the query\n2. Use a database tool (MySQL Workbench, pgAdmin, etc.)\n3. Or run it in your application's database")
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsRunning(false)
    }
  }

  const clearCode = () => {
    setCode(CODE_TEMPLATES[language])
    setOutput("")
    // Clear saved code from localStorage
    localStorage.removeItem(`playground-code-${language}`)
  }

  const saveCode = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`playground-code-${language}`, code)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getLanguageForHighlighter = () => {
    const langMap: { [key: string]: string } = {
      javascript: 'javascript',
      python: 'python',
      html: 'markup',
      css: 'css',
      sql: 'sql'
    }
    return langMap[language] || 'javascript'
  }

  const highlightCode = useCallback((code: string) => {
    try {
      const lang = getLanguageForHighlighter()
      const highlighted = Prism.highlight(code, Prism.languages[lang] || Prism.languages.javascript, lang)
      // Wrap each line for line numbering
      return highlighted.split('\n').map((line) => `<span class="token-line">${line}</span>`).join('\n')
    } catch (e) {
      return code
    }
  }, [language])

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>) => {
    const textarea = e.target as HTMLTextAreaElement
    if (!textarea.selectionStart && textarea.selectionStart !== 0) return // Not a textarea
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = code

    // Auto-close pairs
    const pairs: { [key: string]: string } = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`'
    }

    // Check if typing a closing character that already exists
    const nextChar = value[start]
    if (e.key === nextChar && Object.values(pairs).includes(e.key)) {
      e.preventDefault()
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1
      }, 0)
      return
    }

    // Auto-close opening characters
    if (pairs[e.key]) {
      e.preventDefault()
      const newValue = value.substring(0, start) + e.key + pairs[e.key] + value.substring(end)
      setCode(newValue)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1
      }, 0)
      return
    }

    // Delete matching pairs on backspace
    if (e.key === 'Backspace' && start === end && start > 0) {
      const prevChar = value[start - 1]
      const nextCharBackspace = value[start]
      if (pairs[prevChar] === nextCharBackspace) {
        e.preventDefault()
        const newValue = value.substring(0, start - 1) + value.substring(start + 1)
        setCode(newValue)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 1
        }, 0)
        return
      }
    }

    // Smart Enter key
    if (e.key === 'Enter') {
      const currentLine = value.substring(0, start).split('\n').pop() || ''
      const indent = currentLine.match(/^\s*/)?.[0] || ''
      const lastChar = value[start - 1]
      
      e.preventDefault()
      let newValue = value.substring(0, start) + '\n' + indent
      
      // Add extra indent after opening brackets
      if (lastChar === '{' || lastChar === '[' || lastChar === '(' || lastChar === ':') {
        newValue += '  '
      }
      
      newValue += value.substring(end)
      setCode(newValue)
      setTimeout(() => {
        const newPos = start + 1 + indent.length + (lastChar === '{' || lastChar === '[' || lastChar === '(' || lastChar === ':' ? 2 : 0)
        textarea.selectionStart = textarea.selectionEnd = newPos
      }, 0)
      return
    }

    // Tab handling
    if (e.key === 'Tab') {
      e.preventDefault()
      if (start !== end) {
        // Indent/unindent selection
        const lines = value.substring(0, start).split('\n')
        const startLine = lines.length - 1
        const endLines = value.substring(0, end).split('\n')
        const endLine = endLines.length - 1
        
        const allLines = value.split('\n')
        let newLines = [...allLines]
        
        if (e.shiftKey) {
          // Unindent
          for (let i = startLine; i <= endLine; i++) {
            if (newLines[i].startsWith('  ')) {
              newLines[i] = newLines[i].substring(2)
            }
          }
        } else {
          // Indent
          for (let i = startLine; i <= endLine; i++) {
            newLines[i] = '  ' + newLines[i]
          }
        }
        
        setCode(newLines.join('\n'))
      } else {
        // Insert two spaces
        const newValue = value.substring(0, start) + '  ' + value.substring(end)
        setCode(newValue)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        }, 0)
      }
      return
    }

    // Comment toggle (Ctrl/Cmd + /)
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault()
      const commentChar = language === 'python' ? '#' : language === 'sql' ? '--' : '//'
      const lines = value.split('\n')
      const startLineNum = value.substring(0, start).split('\n').length - 1
      const line = lines[startLineNum]
      
      if (line.trim().startsWith(commentChar)) {
        lines[startLineNum] = line.replace(new RegExp(`^\\s*${commentChar.replace('/', '\\/')}\\s?`), '')
      } else {
        const indent = line.match(/^\s*/)?.[0] || ''
        lines[startLineNum] = indent + commentChar + ' ' + line.trim()
      }
      
      setCode(lines.join('\n'))
      return
    }

    // Duplicate line (Ctrl/Cmd + D)
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault()
      const lines = value.split('\n')
      const currentLineNum = value.substring(0, start).split('\n').length - 1
      const currentLine = lines[currentLineNum]
      lines.splice(currentLineNum + 1, 0, currentLine)
      setCode(lines.join('\n'))
      return
    }

    // Copy line up (Alt + Shift + Up)
    if (e.altKey && e.shiftKey && e.key === 'ArrowUp') {
      e.preventDefault()
      const lines = value.split('\n')
      const currentLineNum = value.substring(0, start).split('\n').length - 1
      if (currentLineNum > 0) {
        const currentLine = lines[currentLineNum]
        lines.splice(currentLineNum - 1, 0, currentLine)
        setCode(lines.join('\n'))
      }
      return
    }

    // Copy line down (Alt + Shift + Down)
    if (e.altKey && e.shiftKey && e.key === 'ArrowDown') {
      e.preventDefault()
      const lines = value.split('\n')
      const currentLineNum = value.substring(0, start).split('\n').length - 1
      const currentLine = lines[currentLineNum]
      lines.splice(currentLineNum + 2, 0, currentLine)
      setCode(lines.join('\n'))
      return
    }

    // Save and run (Ctrl/Cmd + S)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      saveCode()
      runCode()
      return
    }

    // Clear output (Ctrl/Cmd + K)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      setOutput('')
      return
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    // Auto-close brackets, quotes, and other pairs
    const pairs: { [key: string]: string } = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`',
    }
    
    if (pairs[e.key] && start === end) {
      e.preventDefault()
      const before = code.substring(0, start)
      const after = code.substring(end)
      const newText = before + e.key + pairs[e.key] + after
      setCode(newText)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1
      }, 0)
      return
    }
    
    // Skip closing bracket/quote if next character is the same
    if (e.key === ')' || e.key === ']' || e.key === '}' || e.key === '"' || e.key === "'" || e.key === '`') {
      if (code[start] === e.key) {
        e.preventDefault()
        textarea.selectionStart = textarea.selectionEnd = start + 1
        return
      }
    }
    
    // Auto-indent on Enter
    if (e.key === 'Enter') {
      e.preventDefault()
      const lineStart = code.lastIndexOf('\n', start - 1) + 1
      const currentLine = code.substring(lineStart, start)
      const indent = currentLine.match(/^\s*/)?.[0] || ''
      
      // Add extra indent if line ends with opening bracket or colon
      const extraIndent = /[{[(:]$/.test(currentLine.trim()) ? '  ' : ''
      
      const newText = code.substring(0, start) + '\n' + indent + extraIndent + code.substring(end)
      setCode(newText)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length + extraIndent.length
      }, 0)
      return
    }
    
    // Backspace - delete matching pair
    if (e.key === 'Backspace' && start === end && start > 0) {
      const prevChar = code[start - 1]
      const nextChar = code[start]
      if (pairs[prevChar] === nextChar) {
        e.preventDefault()
        const newText = code.substring(0, start - 1) + code.substring(start + 1)
        setCode(newText)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 1
        }, 0)
        return
      }
    }
    
    // Ctrl/Cmd + S - Save/Run code
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      saveCode()
      runCode()
      return
    }
    
    // Ctrl/Cmd + / - Toggle comment
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = code.substring(start, end)
      const beforeText = code.substring(0, start)
      const afterText = code.substring(end)
      
      const commentPrefix = language === 'python' ? '# ' : language === 'sql' ? '-- ' : '// '
      
      if (selectedText) {
        const lines = selectedText.split('\n')
        const allCommented = lines.every(line => line.trim().startsWith(commentPrefix.trim()))
        
        const newLines = allCommented
          ? lines.map(line => line.replace(new RegExp(`^\\s*${commentPrefix.trim()}\\s?`), ''))
          : lines.map(line => line ? commentPrefix + line : line)
        
        const newText = beforeText + newLines.join('\n') + afterText
        setCode(newText)
      } else {
        // Comment current line
        const lineStart = code.lastIndexOf('\n', start - 1) + 1
        const lineEnd = code.indexOf('\n', start)
        const currentLine = code.substring(lineStart, lineEnd === -1 ? code.length : lineEnd)
        
        const isCommented = currentLine.trim().startsWith(commentPrefix.trim())
        const newLine = isCommented
          ? currentLine.replace(new RegExp(`^\\s*${commentPrefix.trim()}\\s?`), '')
          : commentPrefix + currentLine
        
        const newText = code.substring(0, lineStart) + newLine + (lineEnd === -1 ? '' : code.substring(lineEnd))
        setCode(newText)
      }
    }
    
    // Tab - Insert spaces
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const spaces = '  ' // 2 spaces
      
      if (start === end) {
        // Insert spaces at cursor
        const newText = code.substring(0, start) + spaces + code.substring(end)
        setCode(newText)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + spaces.length
        }, 0)
      } else {
        // Indent selected lines
        const selectedText = code.substring(start, end)
        const beforeText = code.substring(0, start)
        const afterText = code.substring(end)
        
        if (e.shiftKey) {
          // Shift+Tab - Unindent
          const lines = selectedText.split('\n')
          const newLines = lines.map(line => line.replace(/^  /, ''))
          const newText = beforeText + newLines.join('\n') + afterText
          setCode(newText)
        } else {
          // Tab - Indent
          const lines = selectedText.split('\n')
          const newLines = lines.map(line => spaces + line)
          const newText = beforeText + newLines.join('\n') + afterText
          setCode(newText)
        }
      }
    }
    
    // Ctrl/Cmd + D - Duplicate line
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const lineStart = code.lastIndexOf('\n', start - 1) + 1
      const lineEnd = code.indexOf('\n', start)
      const currentLine = code.substring(lineStart, lineEnd === -1 ? code.length : lineEnd)
      
      const newText = code.substring(0, lineEnd === -1 ? code.length : lineEnd) + 
                      '\n' + currentLine + 
                      (lineEnd === -1 ? '' : code.substring(lineEnd))
      setCode(newText)
    }
    
    // Alt/Option + Shift + Up - Copy line up
    if (e.altKey && e.shiftKey && e.key === 'ArrowUp') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const lineStart = code.lastIndexOf('\n', start - 1) + 1
      const lineEnd = code.indexOf('\n', start)
      const currentLine = code.substring(lineStart, lineEnd === -1 ? code.length : lineEnd)
      
      const newText = code.substring(0, lineStart) + 
                      currentLine + '\n' + 
                      code.substring(lineStart)
      setCode(newText)
      
      // Move cursor to the copied line above
      setTimeout(() => {
        const newCursorPos = start
        textarea.selectionStart = textarea.selectionEnd = newCursorPos
        textarea.focus()
      }, 0)
    }
    
    // Alt/Option + Shift + Down - Copy line down
    if (e.altKey && e.shiftKey && e.key === 'ArrowDown') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const lineStart = code.lastIndexOf('\n', start - 1) + 1
      const lineEnd = code.indexOf('\n', start)
      const currentLine = code.substring(lineStart, lineEnd === -1 ? code.length : lineEnd)
      
      const newText = code.substring(0, lineEnd === -1 ? code.length : lineEnd) + 
                      '\n' + currentLine + 
                      (lineEnd === -1 ? '' : code.substring(lineEnd))
      setCode(newText)
      
      // Move cursor to the copied line below
      setTimeout(() => {
        const newCursorPos = start + currentLine.length + 1
        textarea.selectionStart = textarea.selectionEnd = newCursorPos
        textarea.focus()
      }, 0)
    }
    
    // Ctrl/Cmd + K - Clear output
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      setOutput("")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Code Playground</h1>
            <p className="text-muted-foreground">
              Write and run code in multiple programming languages
            </p>
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              <p>⌨️ <strong>Keyboard Shortcuts:</strong></p>
              <p>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl/Cmd + S</kbd> - Save & Run Code</p>
              <p>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl/Cmd + /</kbd> - Toggle Comment</p>
              <p>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Tab</kbd> / <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Shift + Tab</kbd> - Indent/Unindent</p>
              <p>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl/Cmd + D</kbd> - Duplicate Line</p>
              <p>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Alt/Opt + Shift + ↑/↓</kbd> - Copy Line Up/Down</p>
              <p>• <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl/Cmd + K</kbd> - Clear Output</p>
              <p className="text-green-600 dark:text-green-400">💾 Code auto-saves to local storage</p>
              <p className="text-blue-600 dark:text-blue-400">✨ Auto-complete: Brackets, quotes, and auto-indent</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Code Editor */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Code Editor</CardTitle>
                    <CardDescription>Write your code here</CardDescription>
                  </div>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden bg-white dark:bg-[#1e1e1e]">
                  {mounted ? (
                    <div className="relative overflow-auto" style={{ maxHeight: '800px' }}>
                      <div onKeyDown={handleEditorKeyDown}>
                        <Editor
                          ref={editorRef}
                          value={code}
                          onValueChange={setCode}
                          highlight={highlightCode}
                          padding={10}
                          className="playground-editor"
                          style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 14,
                            lineHeight: 1.5,
                            minHeight: '600px',
                          }}
                          textareaClassName="playground-textarea"
                        />
                      </div>
                      <style dangerouslySetInnerHTML={{__html: `
                        .playground-editor {
                          counter-reset: line;
                          background: ${theme === 'dark' ? '#1e1e1e' : '#ffffff'} !important;
                          color: ${theme === 'dark' ? '#d4d4d4' : '#24292e'} !important;
                        }
                        .playground-editor textarea,
                        .playground-editor pre {
                          padding-left: 60px !important;
                          white-space: pre !important;
                        }
                        .playground-textarea:focus {
                          outline: none !important;
                        }
                        .playground-editor pre {
                          position: relative;
                        }
                        .playground-editor pre::before {
                          content: '';
                          position: absolute;
                          left: 50px;
                          top: 0;
                          bottom: 0;
                          width: 1px;
                          background: ${theme === 'dark' ? '#3e3e3e' : '#e1e4e8'};
                        }
                        .playground-editor .token-line {
                          counter-increment: line;
                          position: relative;
                        }
                        .playground-editor .token-line::before {
                          content: counter(line) ".";
                          position: absolute;
                          left: -50px;
                          width: 40px;
                          text-align: right;
                          color: ${theme === 'dark' ? '#858585' : '#999'};
                          user-select: none;
                        }
                        ${theme === 'dark' ? `
                          .token.comment,
                          .token.prolog,
                          .token.doctype,
                          .token.cdata { color: #6a9955; }
                          .token.punctuation { color: #d4d4d4; }
                          .token.property,
                          .token.tag,
                          .token.boolean,
                          .token.number,
                          .token.constant,
                          .token.symbol,
                          .token.deleted { color: #b5cea8; }
                          .token.selector,
                          .token.attr-name,
                          .token.string,
                          .token.char,
                          .token.builtin,
                          .token.inserted { color: #ce9178; }
                          .token.operator,
                          .token.entity,
                          .token.url,
                          .language-css .token.string,
                          .style .token.string { color: #d4d4d4; }
                          .token.atrule,
                          .token.attr-value,
                          .token.keyword { color: #c586c0; }
                          .token.function,
                          .token.class-name { color: #dcdcaa; }
                          .token.regex,
                          .token.important,
                          .token.variable { color: #d16969; }
                        ` : ''}
                      `}} />
                    </div>
                  ) : (
                    <div className="font-mono text-sm min-h-[600px] p-3 bg-muted">
                      Loading editor...
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={runCode} disabled={isRunning} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    {isRunning ? "Running..." : "Run Code"}
                  </Button>
                  <Button onClick={saveCode} variant="outline" className="relative">
                    {isSaved ? <Check className="w-4 h-4 text-green-600" /> : "Save"}
                  </Button>
                  <Button onClick={copyCode} variant="outline">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button onClick={clearCode} variant="outline">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output */}
            <Card>
              <CardHeader>
                <CardTitle>Output</CardTitle>
                <CardDescription>See your code results here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg min-h-[400px] overflow-auto whitespace-pre-wrap">
                  {output || "Click 'Run Code' to see output..."}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Language Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Supported Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="javascript" className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="css">CSS</TabsTrigger>
                  <TabsTrigger value="sql">SQL</TabsTrigger>
                </TabsList>
                <TabsContent value="javascript" className="mt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">JavaScript</h3>
                    <p className="text-sm text-muted-foreground">
                      Runs directly in the browser. Full support for console.log, functions, arrays, objects, and ES6+ features.
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">✓ Fully executable</p>
                  </div>
                </TabsContent>
                <TabsContent value="python" className="mt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Python</h3>
                    <p className="text-sm text-muted-foreground">
                      Display-only editor. Python execution requires a backend server (Pyodide integration coming soon).
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">⚠️ Display only (for now)</p>
                  </div>
                </TabsContent>
                <TabsContent value="html" className="mt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">HTML</h3>
                    <p className="text-sm text-muted-foreground">
                      Opens in a new window. Supports full HTML with inline CSS and JavaScript.
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">✓ Fully executable</p>
                  </div>
                </TabsContent>
                <TabsContent value="css" className="mt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">CSS</h3>
                    <p className="text-sm text-muted-foreground">
                      Display-only editor. Combine with HTML tab to see CSS in action.
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">ℹ️ Display only</p>
                  </div>
                </TabsContent>
                <TabsContent value="sql" className="mt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">SQL</h3>
                    <p className="text-sm text-muted-foreground">
                      Display-only editor. SQL execution requires database connection.
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">⚠️ Display only</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
