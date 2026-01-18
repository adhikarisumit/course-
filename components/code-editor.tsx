"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Editor, { OnMount } from "@monaco-editor/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  Loader2, 
  Terminal,
  Code2,
  Settings,
  Maximize2,
  Minimize2,
  Save,
  FolderOpen,
  FileCode,
  Trash2,
  Edit,
  MoreVertical,
  Clock,
  Plus,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface Language {
  id: string
  name: string
  extension: string
  monacoLanguage: string
  defaultCode: string
}

interface CodeSnippet {
  id: string
  title: string
  description: string | null
  code: string
  language: string
  createdAt: string
  updatedAt: string
}

const LANGUAGES: Language[] = [
  {
    id: "javascript",
    name: "JavaScript",
    extension: "js",
    monacoLanguage: "javascript",
    defaultCode: `// JavaScript Code
console.log("Hello, World!");

// Example: Array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);

// Example: Function
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(10):", fibonacci(10));`,
  },
  {
    id: "typescript",
    name: "TypeScript",
    extension: "ts",
    monacoLanguage: "typescript",
    defaultCode: `// TypeScript Code
console.log("Hello, World!");

// Example: Type annotations
interface Person {
  name: string;
  age: number;
}

const greet = (person: Person): string => {
  return \`Hello, \${person.name}! You are \${person.age} years old.\`;
};

const user: Person = { name: "Alice", age: 25 };
console.log(greet(user));`,
  },
  {
    id: "python",
    name: "Python",
    extension: "py",
    monacoLanguage: "python",
    defaultCode: `# Python Code
print("Hello, World!")

# Example: List comprehension
numbers = [1, 2, 3, 4, 5]
squared = [n ** 2 for n in numbers]
print(f"Squared: {squared}")

# Example: Function
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(f"Fibonacci(10): {fibonacci(10)}")`,
  },
  {
    id: "java",
    name: "Java",
    extension: "java",
    monacoLanguage: "java",
    defaultCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Example: Loop
        for (int i = 1; i <= 5; i++) {
            System.out.println("Count: " + i);
        }
        
        // Example: Method call
        System.out.println("Fibonacci(10): " + fibonacci(10));
    }
    
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}`,
  },
  {
    id: "cpp",
    name: "C++",
    extension: "cpp",
    monacoLanguage: "cpp",
    defaultCode: `#include <iostream>
#include <vector>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << "Hello, World!" << endl;
    
    // Example: Vector
    vector<int> numbers = {1, 2, 3, 4, 5};
    cout << "Numbers: ";
    for (int n : numbers) {
        cout << n << " ";
    }
    cout << endl;
    
    cout << "Fibonacci(10): " << fibonacci(10) << endl;
    
    return 0;
}`,
  },
  {
    id: "c",
    name: "C",
    extension: "c",
    monacoLanguage: "c",
    defaultCode: `#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    printf("Hello, World!\\n");
    
    // Example: Loop
    for (int i = 1; i <= 5; i++) {
        printf("Count: %d\\n", i);
    }
    
    printf("Fibonacci(10): %d\\n", fibonacci(10));
    
    return 0;
}`,
  },
  {
    id: "csharp",
    name: "C#",
    extension: "cs",
    monacoLanguage: "csharp",
    defaultCode: `using System;
using System.Collections.Generic;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
        
        // Example: List
        var numbers = new List<int> { 1, 2, 3, 4, 5 };
        Console.WriteLine("Numbers: " + string.Join(", ", numbers));
        
        Console.WriteLine("Fibonacci(10): " + Fibonacci(10));
    }
    
    static int Fibonacci(int n) {
        if (n <= 1) return n;
        return Fibonacci(n - 1) + Fibonacci(n - 2);
    }
}`,
  },
  {
    id: "go",
    name: "Go",
    extension: "go",
    monacoLanguage: "go",
    defaultCode: `package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    fmt.Println("Hello, World!")
    
    // Example: Slice
    numbers := []int{1, 2, 3, 4, 5}
    fmt.Println("Numbers:", numbers)
    
    fmt.Println("Fibonacci(10):", fibonacci(10))
}`,
  },
  {
    id: "rust",
    name: "Rust",
    extension: "rs",
    monacoLanguage: "rust",
    defaultCode: `fn fibonacci(n: u32) -> u32 {
    if n <= 1 {
        return n;
    }
    fibonacci(n - 1) + fibonacci(n - 2)
}

fn main() {
    println!("Hello, World!");
    
    // Example: Vector
    let numbers = vec![1, 2, 3, 4, 5];
    println!("Numbers: {:?}", numbers);
    
    println!("Fibonacci(10): {}", fibonacci(10));
}`,
  },
  {
    id: "php",
    name: "PHP",
    extension: "php",
    monacoLanguage: "php",
    defaultCode: `<?php
echo "Hello, World!\\n";

// Example: Array
$numbers = [1, 2, 3, 4, 5];
$squared = array_map(fn($n) => $n ** 2, $numbers);
echo "Squared: " . implode(", ", $squared) . "\\n";

// Example: Function
function fibonacci($n) {
    if ($n <= 1) return $n;
    return fibonacci($n - 1) + fibonacci($n - 2);
}

echo "Fibonacci(10): " . fibonacci(10) . "\\n";
?>`,
  },
  {
    id: "ruby",
    name: "Ruby",
    extension: "rb",
    monacoLanguage: "ruby",
    defaultCode: `# Ruby Code
puts "Hello, World!"

# Example: Array
numbers = [1, 2, 3, 4, 5]
squared = numbers.map { |n| n ** 2 }
puts "Squared: #{squared}"

# Example: Method
def fibonacci(n)
  return n if n <= 1
  fibonacci(n - 1) + fibonacci(n - 2)
end

puts "Fibonacci(10): #{fibonacci(10)}"`,
  },
  {
    id: "kotlin",
    name: "Kotlin",
    extension: "kt",
    monacoLanguage: "kotlin",
    defaultCode: `fun fibonacci(n: Int): Int {
    if (n <= 1) return n
    return fibonacci(n - 1) + fibonacci(n - 2)
}

fun main() {
    println("Hello, World!")
    
    // Example: List
    val numbers = listOf(1, 2, 3, 4, 5)
    val squared = numbers.map { it * it }
    println("Squared: $squared")
    
    println("Fibonacci(10): \${fibonacci(10)}")
}`,
  },
]

export default function CodeEditor() {
  const { resolvedTheme } = useTheme()
  const editorRef = useRef<any>(null)
  const [language, setLanguage] = useState<Language>(LANGUAGES[0])
  const [code, setCode] = useState(LANGUAGES[0].defaultCode)
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [stdin, setStdin] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState("output")
  const [fontSize, setFontSize] = useState(14)
  
  // Snippet management states
  const [snippets, setSnippets] = useState<CodeSnippet[]>([])
  const [isLoadingSnippets, setIsLoadingSnippets] = useState(false)
  const [currentSnippet, setCurrentSnippet] = useState<CodeSnippet | null>(null)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [snippetToDelete, setSnippetToDelete] = useState<CodeSnippet | null>(null)
  const [saveTitle, setSaveTitle] = useState("")
  const [saveDescription, setSaveDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Track unsaved changes
  useEffect(() => {
    if (currentSnippet) {
      setHasUnsavedChanges(code !== currentSnippet.code || language.id !== currentSnippet.language)
    } else {
      setHasUnsavedChanges(code !== language.defaultCode)
    }
  }, [code, language, currentSnippet])

  const fetchSnippets = useCallback(async () => {
    setIsLoadingSnippets(true)
    try {
      const response = await fetch("/api/code/snippets")
      if (response.ok) {
        const data = await response.json()
        setSnippets(data.snippets)
      }
    } catch (error) {
      console.error("Error fetching snippets:", error)
    } finally {
      setIsLoadingSnippets(false)
    }
  }, [])

  useEffect(() => {
    fetchSnippets()
  }, [fetchSnippets])

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  const handleLanguageChange = (langId: string) => {
    const newLang = LANGUAGES.find((l) => l.id === langId)
    if (newLang) {
      setLanguage(newLang)
      if (!currentSnippet) {
        setCode(newLang.defaultCode)
      }
      setOutput("")
    }
  }

  const handleRunCode = async () => {
    setIsRunning(true)
    setOutput("")
    setActiveTab("output")

    try {
      const response = await fetch("/api/code/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language: language.id,
          stdin,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setOutput(`Error: ${result.error || "Failed to execute code"}`)
        toast.error("Code execution failed")
        return
      }

      let outputText = ""
      if (result.output) {
        outputText = result.output
      }
      if (result.stderr) {
        outputText += (outputText ? "\n\n" : "") + "Stderr:\n" + result.stderr
      }
      if (result.exitCode !== 0) {
        outputText += `\n\nExit Code: ${result.exitCode}`
      }

      setOutput(outputText || "Program executed successfully with no output.")
      toast.success("Code executed successfully")
    } catch (error) {
      setOutput("Error: Failed to connect to the server")
      toast.error("Failed to execute code")
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    setCode(language.defaultCode)
    setOutput("")
    setStdin("")
    setCurrentSnippet(null)
    toast.info("Editor reset to default")
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success("Code copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy code")
    }
  }

  const handleExport = () => {
    const extension = language.extension
    const filename = currentSnippet 
      ? `${currentSnippet.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${extension}`
      : `code.${extension}`
    
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Exported as ${filename}`)
  }

  const handleNewSnippet = () => {
    setCurrentSnippet(null)
    setCode(language.defaultCode)
    setOutput("")
    setStdin("")
    toast.info("Started new snippet")
  }

  const handleSaveSnippet = async () => {
    if (!saveTitle.trim()) {
      toast.error("Please enter a title")
      return
    }

    setIsSaving(true)

    try {
      if (currentSnippet) {
        // Update existing snippet
        const response = await fetch(`/api/code/snippets/${currentSnippet.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: saveTitle,
            description: saveDescription,
            code,
            language: language.id,
          }),
        })

        if (!response.ok) throw new Error("Failed to update snippet")

        const data = await response.json()
        setCurrentSnippet(data.snippet)
        toast.success("Snippet updated successfully")
      } else {
        // Create new snippet
        const response = await fetch("/api/code/snippets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: saveTitle,
            description: saveDescription,
            code,
            language: language.id,
          }),
        })

        if (!response.ok) throw new Error("Failed to save snippet")

        const data = await response.json()
        setCurrentSnippet(data.snippet)
        toast.success("Snippet saved successfully")
      }

      setIsSaveDialogOpen(false)
      fetchSnippets()
    } catch (error) {
      toast.error("Failed to save snippet")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadSnippet = (snippet: CodeSnippet) => {
    const lang = LANGUAGES.find((l) => l.id === snippet.language) || LANGUAGES[0]
    setLanguage(lang)
    setCode(snippet.code)
    setCurrentSnippet(snippet)
    setIsLoadDialogOpen(false)
    setOutput("")
    setStdin("")
    toast.success(`Loaded "${snippet.title}"`)
  }

  const handleDeleteSnippet = async () => {
    if (!snippetToDelete) return

    try {
      const response = await fetch(`/api/code/snippets/${snippetToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete snippet")

      if (currentSnippet?.id === snippetToDelete.id) {
        setCurrentSnippet(null)
        setCode(language.defaultCode)
      }

      toast.success("Snippet deleted successfully")
      fetchSnippets()
    } catch (error) {
      toast.error("Failed to delete snippet")
    } finally {
      setIsDeleteDialogOpen(false)
      setSnippetToDelete(null)
    }
  }

  const openSaveDialog = () => {
    setSaveTitle(currentSnippet?.title || "")
    setSaveDescription(currentSnippet?.description || "")
    setIsSaveDialogOpen(true)
  }

  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "light"

  const getLanguageBadgeColor = (langId: string) => {
    const colors: Record<string, string> = {
      javascript: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
      typescript: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
      python: "bg-green-500/20 text-green-600 dark:text-green-400",
      java: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
      cpp: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
      c: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
      csharp: "bg-violet-500/20 text-violet-600 dark:text-violet-400",
      go: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
      rust: "bg-red-500/20 text-red-600 dark:text-red-400",
      php: "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
      ruby: "bg-rose-500/20 text-rose-600 dark:text-rose-400",
      kotlin: "bg-pink-500/20 text-pink-600 dark:text-pink-400",
    }
    return colors[langId] || "bg-gray-500/20 text-gray-600"
  }

  return (
    <div className={cn(
      "flex flex-col gap-4 transition-all duration-300",
      isFullscreen && "fixed inset-0 z-50 bg-background p-4"
    )}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={language.id} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <Code2 className="h-4 w-4 mr-2 flex-shrink-0" />
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={fontSize.toString()} onValueChange={(v) => setFontSize(parseInt(v))}>
            <SelectTrigger className="w-[120px]">
              <Settings className="h-4 w-4 mr-2 flex-shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[12, 14, 16, 18, 20].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {currentSnippet && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
              <FileCode className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate max-w-[150px]">
                {currentSnippet.title}
              </span>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-xs">
                  Unsaved
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* New Snippet */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewSnippet}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New</span>
          </Button>

          {/* Save Dialog */}
          <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={openSaveDialog}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentSnippet ? "Update Snippet" : "Save Snippet"}
                </DialogTitle>
                <DialogDescription>
                  {currentSnippet
                    ? "Update your saved code snippet"
                    : "Save your code to access it later"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="My awesome code"
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What does this code do?"
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Code2 className="h-4 w-4" />
                  <span>Language: {language.name}</span>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsSaveDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveSnippet} disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {currentSnippet ? "Update" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Load Dialog */}
          <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchSnippets()
                  setIsLoadDialogOpen(true)
                }}
                className="gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Load</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Your Saved Snippets</DialogTitle>
                <DialogDescription>
                  Load a previously saved code snippet
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[400px] pr-4">
                {isLoadingSnippets ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : snippets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <FileCode className="h-10 w-10 mb-2 opacity-50" />
                    <p>No saved snippets yet</p>
                    <p className="text-sm">Save your first snippet to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {snippets.map((snippet) => (
                      <div
                        key={snippet.id}
                        className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                      >
                        <button
                          className="flex-1 text-left"
                          onClick={() => handleLoadSnippet(snippet)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{snippet.title}</span>
                            <Badge className={cn("text-xs", getLanguageBadgeColor(snippet.language))}>
                              {LANGUAGES.find((l) => l.id === snippet.language)?.name || snippet.language}
                            </Badge>
                          </div>
                          {snippet.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {snippet.description}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(snippet.updatedAt), { addSuffix: true })}
                          </div>
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleLoadSnippet(snippet)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Open & Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSnippetToDelete(snippet)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <div className="w-px h-6 bg-border hidden sm:block" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="hidden sm:inline">Copy</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Reset</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="gap-2"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          <Button
            onClick={handleRunCode}
            disabled={isRunning}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run Code
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className={cn(
        "grid gap-4",
        isFullscreen ? "grid-cols-1 lg:grid-cols-2 flex-1" : "grid-cols-1 lg:grid-cols-2"
      )}>
        {/* Code Editor */}
        <Card className={cn("overflow-hidden", isFullscreen && "h-full")}>
          <CardHeader className="py-3 px-4 border-b bg-muted/30">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              {language.name} Editor
              <span className="text-xs text-muted-foreground ml-auto">
                .{language.extension}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Editor
              height={isFullscreen ? "calc(100vh - 200px)" : "500px"}
              language={language.monacoLanguage}
              value={code}
              theme={editorTheme}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorDidMount}
              options={{
                fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                padding: { top: 16, bottom: 16 },
                lineNumbers: "on",
                renderLineHighlight: "all",
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
                fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                fontLigatures: true,
              }}
            />
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className={cn("overflow-hidden flex flex-col", isFullscreen && "h-full")}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <CardHeader className="py-0 px-4 border-b bg-muted/30">
              <TabsList className="h-12 bg-transparent p-0 gap-6">
                <TabsTrigger 
                  value="output" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 gap-2"
                >
                  <Terminal className="h-4 w-4 flex-shrink-0" />
                  <span>Output</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="input"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 gap-2"
                >
                  <Code2 className="h-4 w-4 flex-shrink-0" />
                  <span>Input (stdin)</span>
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-0 flex-1">
              <TabsContent value="output" className="h-full m-0">
                <div 
                  className={cn(
                    "font-mono text-sm p-4 overflow-auto bg-zinc-950 text-zinc-100",
                    isFullscreen ? "h-[calc(100vh-250px)]" : "h-[452px]"
                  )}
                >
                  {isRunning ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Running code...
                    </div>
                  ) : output ? (
                    <pre className="whitespace-pre-wrap break-words">{output}</pre>
                  ) : (
                    <span className="text-muted-foreground">
                      Click &quot;Run Code&quot; to see the output here...
                    </span>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="input" className="h-full m-0">
                <div className="p-4 h-full">
                  <Textarea
                    placeholder="Enter input for your program (stdin)..."
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    className={cn(
                      "font-mono text-sm resize-none",
                      isFullscreen ? "h-[calc(100vh-280px)]" : "h-[420px]"
                    )}
                  />
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Info Footer */}
      <div className="text-xs text-muted-foreground text-center">
        Powered by Piston API • Supports {LANGUAGES.length} programming languages • 
        Code runs in a sandboxed environment
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Snippet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{snippetToDelete?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSnippet}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
