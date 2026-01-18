"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Editor, { OnMount } from "@monaco-editor/react"
import { loader } from "@monaco-editor/react"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  const [editorTheme, setEditorTheme] = useState("vs-dark")
  
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

  // Proteclink detection
  const containsProteclink = /proteclink/i.test(code)

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

  const handleEditorDidMount: OnMount = async (editor) => {
    editorRef.current = editor

    // Load Monaco Editor API
    const monaco = await loader.init()

    // Define custom themes
    defineCustomThemes(monaco)

    // Register custom completion providers for each language
    registerCompletionProviders(monaco)

    // Add Ctrl+S to save snippet (if editing)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, (e) => {
      e.preventDefault()
      if (currentSnippet) {
        handleSaveSnippet()
      }
    })
  }

  // Register completion providers for all languages
  const registerCompletionProviders = (monaco: any) => {
    // JavaScript/TypeScript completions
    const jsCompletions = [
      // Console methods
      { label: 'console.log', kind: monaco.languages.CompletionItemKind.Method, insertText: 'console.log(${1:message})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Log output to console', documentation: 'Outputs a message to the console' },
      { label: 'console.error', kind: monaco.languages.CompletionItemKind.Method, insertText: 'console.error(${1:error})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Log error to console', documentation: 'Outputs an error message to the console' },
      { label: 'console.warn', kind: monaco.languages.CompletionItemKind.Method, insertText: 'console.warn(${1:warning})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Log warning to console' },
      { label: 'console.table', kind: monaco.languages.CompletionItemKind.Method, insertText: 'console.table(${1:data})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Display data as table' },
      { label: 'console.time', kind: monaco.languages.CompletionItemKind.Method, insertText: 'console.time(\'${1:label}\')', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Start timer' },
      { label: 'console.timeEnd', kind: monaco.languages.CompletionItemKind.Method, insertText: 'console.timeEnd(\'${1:label}\')', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'End timer' },
      
      // Array methods
      { label: '.map', kind: monaco.languages.CompletionItemKind.Method, insertText: '.map((${1:item}) => ${2:item})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.map()', documentation: 'Creates a new array with the results of calling a function on every element' },
      { label: '.filter', kind: monaco.languages.CompletionItemKind.Method, insertText: '.filter((${1:item}) => ${2:condition})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.filter()', documentation: 'Creates a new array with elements that pass the test' },
      { label: '.reduce', kind: monaco.languages.CompletionItemKind.Method, insertText: '.reduce((${1:acc}, ${2:item}) => ${3:acc + item}, ${4:0})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.reduce()', documentation: 'Reduces array to a single value' },
      { label: '.forEach', kind: monaco.languages.CompletionItemKind.Method, insertText: '.forEach((${1:item}) => {\n\t${2}\n})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.forEach()', documentation: 'Executes a function for each array element' },
      { label: '.find', kind: monaco.languages.CompletionItemKind.Method, insertText: '.find((${1:item}) => ${2:condition})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.find()', documentation: 'Returns first element that passes the test' },
      { label: '.findIndex', kind: monaco.languages.CompletionItemKind.Method, insertText: '.findIndex((${1:item}) => ${2:condition})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.findIndex()' },
      { label: '.some', kind: monaco.languages.CompletionItemKind.Method, insertText: '.some((${1:item}) => ${2:condition})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.some()', documentation: 'Tests if at least one element passes' },
      { label: '.every', kind: monaco.languages.CompletionItemKind.Method, insertText: '.every((${1:item}) => ${2:condition})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.every()', documentation: 'Tests if all elements pass' },
      { label: '.includes', kind: monaco.languages.CompletionItemKind.Method, insertText: '.includes(${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.includes()' },
      { label: '.indexOf', kind: monaco.languages.CompletionItemKind.Method, insertText: '.indexOf(${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.indexOf()' },
      { label: '.push', kind: monaco.languages.CompletionItemKind.Method, insertText: '.push(${1:item})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.push()' },
      { label: '.pop', kind: monaco.languages.CompletionItemKind.Method, insertText: '.pop()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.pop()' },
      { label: '.shift', kind: monaco.languages.CompletionItemKind.Method, insertText: '.shift()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.shift()' },
      { label: '.unshift', kind: monaco.languages.CompletionItemKind.Method, insertText: '.unshift(${1:item})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.unshift()' },
      { label: '.slice', kind: monaco.languages.CompletionItemKind.Method, insertText: '.slice(${1:start}, ${2:end})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.slice()' },
      { label: '.splice', kind: monaco.languages.CompletionItemKind.Method, insertText: '.splice(${1:start}, ${2:deleteCount})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.splice()' },
      { label: '.concat', kind: monaco.languages.CompletionItemKind.Method, insertText: '.concat(${1:array})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.concat()' },
      { label: '.join', kind: monaco.languages.CompletionItemKind.Method, insertText: '.join(\'${1:,}\')', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.join()' },
      { label: '.reverse', kind: monaco.languages.CompletionItemKind.Method, insertText: '.reverse()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.reverse()' },
      { label: '.sort', kind: monaco.languages.CompletionItemKind.Method, insertText: '.sort((a, b) => ${1:a - b})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.sort()' },
      { label: '.flat', kind: monaco.languages.CompletionItemKind.Method, insertText: '.flat(${1:depth})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.flat()' },
      { label: '.flatMap', kind: monaco.languages.CompletionItemKind.Method, insertText: '.flatMap((${1:item}) => ${2:item})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Array.flatMap()' },
      
      // String methods
      { label: '.split', kind: monaco.languages.CompletionItemKind.Method, insertText: '.split(\'${1:delimiter}\')', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'String.split()' },
      { label: '.trim', kind: monaco.languages.CompletionItemKind.Method, insertText: '.trim()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'String.trim()' },
      { label: '.toLowerCase', kind: monaco.languages.CompletionItemKind.Method, insertText: '.toLowerCase()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'String.toLowerCase()' },
      { label: '.toUpperCase', kind: monaco.languages.CompletionItemKind.Method, insertText: '.toUpperCase()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'String.toUpperCase()' },
      { label: '.replace', kind: monaco.languages.CompletionItemKind.Method, insertText: '.replace(${1:search}, ${2:replacement})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'String.replace()' },
      { label: '.replaceAll', kind: monaco.languages.CompletionItemKind.Method, insertText: '.replaceAll(${1:search}, ${2:replacement})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'String.replaceAll()' },
      { label: '.substring', kind: monaco.languages.CompletionItemKind.Method, insertText: '.substring(${1:start}, ${2:end})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'String.substring()' },
      { label: '.charAt', kind: monaco.languages.CompletionItemKind.Method, insertText: '.charAt(${1:index})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'String.charAt()' },
      { label: '.startsWith', kind: monaco.languages.CompletionItemKind.Method, insertText: '.startsWith(\'${1:prefix}\')', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'String.startsWith()' },
      { label: '.endsWith', kind: monaco.languages.CompletionItemKind.Method, insertText: '.endsWith(\'${1:suffix}\')', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'String.endsWith()' },
      { label: '.padStart', kind: monaco.languages.CompletionItemKind.Method, insertText: '.padStart(${1:length}, \'${2:char}\')', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'String.padStart()' },
      { label: '.padEnd', kind: monaco.languages.CompletionItemKind.Method, insertText: '.padEnd(${1:length}, \'${2:char}\')', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'String.padEnd()' },
      { label: '.repeat', kind: monaco.languages.CompletionItemKind.Method, insertText: '.repeat(${1:count})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'String.repeat()' },
      { label: '.match', kind: monaco.languages.CompletionItemKind.Method, insertText: '.match(/${1:pattern}/g)', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'String.match()' },
      
      // Object methods
      { label: 'Object.keys', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Object.keys(${1:obj})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get object keys' },
      { label: 'Object.values', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Object.values(${1:obj})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get object values' },
      { label: 'Object.entries', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Object.entries(${1:obj})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get object entries' },
      { label: 'Object.assign', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Object.assign(${1:target}, ${2:source})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Copy object properties' },
      { label: 'Object.freeze', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Object.freeze(${1:obj})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Freeze object' },
      { label: 'Object.fromEntries', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Object.fromEntries(${1:entries})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Create object from entries' },
      
      // Math methods
      { label: 'Math.random', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Math.random()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Random number 0-1' },
      { label: 'Math.floor', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Math.floor(${1:number})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Round down' },
      { label: 'Math.ceil', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Math.ceil(${1:number})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Round up' },
      { label: 'Math.round', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Math.round(${1:number})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Round to nearest' },
      { label: 'Math.max', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Math.max(${1:a}, ${2:b})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Maximum value' },
      { label: 'Math.min', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Math.min(${1:a}, ${2:b})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Minimum value' },
      { label: 'Math.abs', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Math.abs(${1:number})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Absolute value' },
      { label: 'Math.pow', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Math.pow(${1:base}, ${2:exponent})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Power' },
      { label: 'Math.sqrt', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Math.sqrt(${1:number})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Square root' },
      
      // Promise/Async
      { label: 'Promise.all', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Promise.all([${1:promises}])', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Wait for all promises' },
      { label: 'Promise.race', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Promise.race([${1:promises}])', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Race promises' },
      { label: 'Promise.resolve', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Promise.resolve(${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Resolve promise' },
      { label: '.then', kind: monaco.languages.CompletionItemKind.Method, insertText: '.then((${1:result}) => {\n\t${2}\n})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Promise.then()' },
      { label: '.catch', kind: monaco.languages.CompletionItemKind.Method, insertText: '.catch((${1:error}) => {\n\t${2}\n})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Promise.catch()' },
      { label: '.finally', kind: monaco.languages.CompletionItemKind.Method, insertText: '.finally(() => {\n\t${1}\n})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Promise.finally()' },
      
      // JSON
      { label: 'JSON.stringify', kind: monaco.languages.CompletionItemKind.Method, insertText: 'JSON.stringify(${1:obj}, null, 2)', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Convert to JSON string' },
      { label: 'JSON.parse', kind: monaco.languages.CompletionItemKind.Method, insertText: 'JSON.parse(${1:json})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Parse JSON string' },
      
      // Fetch API
      { label: 'fetch', kind: monaco.languages.CompletionItemKind.Function, insertText: 'fetch(\'${1:url}\')\n\t.then(res => res.json())\n\t.then(data => {\n\t\t${2}\n\t})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Fetch API request' },
      { label: 'fetch-async', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'const response = await fetch(\'${1:url}\');\nconst data = await response.json();', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Async fetch request' },
      
      // Snippets
      { label: 'fn', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'function ${1:name}(${2:params}) {\n\t${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Function declaration' },
      { label: 'afn', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'const ${1:name} = (${2:params}) => {\n\t${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Arrow function' },
      { label: 'asyncfn', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'async function ${1:name}(${2:params}) {\n\t${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Async function' },
      { label: 'iife', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '(function() {\n\t${1}\n})();', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'IIFE' },
      { label: 'class', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'class ${1:ClassName} {\n\tconstructor(${2:params}) {\n\t\t${3}\n\t}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Class declaration' },
      { label: 'for', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'For loop' },
      { label: 'forof', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for (const ${1:item} of ${2:array}) {\n\t${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'For...of loop' },
      { label: 'forin', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for (const ${1:key} in ${2:object}) {\n\t${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'For...in loop' },
      { label: 'while', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'while (${1:condition}) {\n\t${2}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'While loop' },
      { label: 'dowhile', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'do {\n\t${1}\n} while (${2:condition});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Do...while loop' },
      { label: 'if', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if (${1:condition}) {\n\t${2}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'If statement' },
      { label: 'ifelse', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if (${1:condition}) {\n\t${2}\n} else {\n\t${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'If...else statement' },
      { label: 'ternary', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '${1:condition} ? ${2:trueValue} : ${3:falseValue}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Ternary operator' },
      { label: 'switch', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'switch (${1:expression}) {\n\tcase ${2:value}:\n\t\t${3}\n\t\tbreak;\n\tdefault:\n\t\t${4}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Switch statement' },
      { label: 'trycatch', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'try {\n\t${1}\n} catch (${2:error}) {\n\t${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Try...catch block' },
      { label: 'tryfinally', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'try {\n\t${1}\n} catch (${2:error}) {\n\t${3}\n} finally {\n\t${4}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Try...catch...finally' },
      { label: 'import', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'import { ${1:module} } from \'${2:package}\';', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'ES6 import' },
      { label: 'importdefault', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'import ${1:module} from \'${2:package}\';', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'ES6 default import' },
      { label: 'export', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'export { ${1:module} };', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'ES6 export' },
      { label: 'exportdefault', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'export default ${1:module};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'ES6 default export' },
      { label: 'destructure', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'const { ${1:prop} } = ${2:object};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Destructure object' },
      { label: 'destructurearr', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'const [${1:first}, ${2:second}] = ${3:array};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Destructure array' },
      { label: 'spread', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '...${1:array}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Spread operator' },
      { label: 'timeout', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'setTimeout(() => {\n\t${1}\n}, ${2:1000});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'setTimeout' },
      { label: 'interval', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'setInterval(() => {\n\t${1}\n}, ${2:1000});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'setInterval' },
    ]

    // Python completions
    const pythonCompletions = [
      // Print/Input
      { label: 'print', kind: monaco.languages.CompletionItemKind.Function, insertText: 'print(${1:message})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Print to console' },
      { label: 'printf', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'print(f"${1:message}")', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Print f-string' },
      { label: 'input', kind: monaco.languages.CompletionItemKind.Function, insertText: 'input(\'${1:prompt}\')', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get user input' },
      
      // List methods
      { label: '.append', kind: monaco.languages.CompletionItemKind.Method, insertText: '.append(${1:item})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Add item to list' },
      { label: '.extend', kind: monaco.languages.CompletionItemKind.Method, insertText: '.extend(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Extend list' },
      { label: '.insert', kind: monaco.languages.CompletionItemKind.Method, insertText: '.insert(${1:index}, ${2:item})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Insert at index' },
      { label: '.remove', kind: monaco.languages.CompletionItemKind.Method, insertText: '.remove(${1:item})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Remove item' },
      { label: '.pop', kind: monaco.languages.CompletionItemKind.Method, insertText: '.pop(${1:index})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Pop item at index' },
      { label: '.sort', kind: monaco.languages.CompletionItemKind.Method, insertText: '.sort(${1:key=None, reverse=False})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Sort list' },
      { label: '.reverse', kind: monaco.languages.CompletionItemKind.Method, insertText: '.reverse()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Reverse list' },
      { label: '.copy', kind: monaco.languages.CompletionItemKind.Method, insertText: '.copy()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Copy list' },
      { label: '.count', kind: monaco.languages.CompletionItemKind.Method, insertText: '.count(${1:item})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Count occurrences' },
      { label: '.index', kind: monaco.languages.CompletionItemKind.Method, insertText: '.index(${1:item})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Find index' },
      
      // String methods
      { label: '.split', kind: monaco.languages.CompletionItemKind.Method, insertText: '.split(\'${1:delimiter}\')', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Split string' },
      { label: '.join', kind: monaco.languages.CompletionItemKind.Method, insertText: '.join(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Join strings' },
      { label: '.strip', kind: monaco.languages.CompletionItemKind.Method, insertText: '.strip()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Strip whitespace' },
      { label: '.lower', kind: monaco.languages.CompletionItemKind.Method, insertText: '.lower()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Lowercase' },
      { label: '.upper', kind: monaco.languages.CompletionItemKind.Method, insertText: '.upper()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Uppercase' },
      { label: '.replace', kind: monaco.languages.CompletionItemKind.Method, insertText: '.replace(\'${1:old}\', \'${2:new}\')', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Replace substring' },
      { label: '.startswith', kind: monaco.languages.CompletionItemKind.Method, insertText: '.startswith(\'${1:prefix}\')', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Check prefix' },
      { label: '.endswith', kind: monaco.languages.CompletionItemKind.Method, insertText: '.endswith(\'${1:suffix}\')', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Check suffix' },
      { label: '.format', kind: monaco.languages.CompletionItemKind.Method, insertText: '.format(${1:args})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Format string' },
      { label: '.find', kind: monaco.languages.CompletionItemKind.Method, insertText: '.find(\'${1:substring}\')', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Find substring' },
      { label: '.isdigit', kind: monaco.languages.CompletionItemKind.Method, insertText: '.isdigit()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Check if digits' },
      { label: '.isalpha', kind: monaco.languages.CompletionItemKind.Method, insertText: '.isalpha()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Check if alpha' },
      
      // Dict methods
      { label: '.keys', kind: monaco.languages.CompletionItemKind.Method, insertText: '.keys()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get dict keys' },
      { label: '.values', kind: monaco.languages.CompletionItemKind.Method, insertText: '.values()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get dict values' },
      { label: '.items', kind: monaco.languages.CompletionItemKind.Method, insertText: '.items()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get dict items' },
      { label: '.get', kind: monaco.languages.CompletionItemKind.Method, insertText: '.get(\'${1:key}\', ${2:default})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get dict value' },
      { label: '.update', kind: monaco.languages.CompletionItemKind.Method, insertText: '.update(${1:dict})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Update dict' },
      { label: '.pop', kind: monaco.languages.CompletionItemKind.Method, insertText: '.pop(\'${1:key}\')', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Pop dict item' },
      
      // Built-in functions
      { label: 'len', kind: monaco.languages.CompletionItemKind.Function, insertText: 'len(${1:obj})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get length' },
      { label: 'range', kind: monaco.languages.CompletionItemKind.Function, insertText: 'range(${1:start}, ${2:stop}, ${3:step})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Generate range' },
      { label: 'enumerate', kind: monaco.languages.CompletionItemKind.Function, insertText: 'enumerate(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Enumerate iterable' },
      { label: 'zip', kind: monaco.languages.CompletionItemKind.Function, insertText: 'zip(${1:iter1}, ${2:iter2})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Zip iterables' },
      { label: 'map', kind: monaco.languages.CompletionItemKind.Function, insertText: 'map(${1:func}, ${2:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Map function' },
      { label: 'filter', kind: monaco.languages.CompletionItemKind.Function, insertText: 'filter(${1:func}, ${2:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Filter iterable' },
      { label: 'sorted', kind: monaco.languages.CompletionItemKind.Function, insertText: 'sorted(${1:iterable}, key=${2:None}, reverse=${3:False})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Sort iterable' },
      { label: 'reversed', kind: monaco.languages.CompletionItemKind.Function, insertText: 'reversed(${1:sequence})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Reverse sequence' },
      { label: 'sum', kind: monaco.languages.CompletionItemKind.Function, insertText: 'sum(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Sum values' },
      { label: 'max', kind: monaco.languages.CompletionItemKind.Function, insertText: 'max(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Maximum value' },
      { label: 'min', kind: monaco.languages.CompletionItemKind.Function, insertText: 'min(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Minimum value' },
      { label: 'abs', kind: monaco.languages.CompletionItemKind.Function, insertText: 'abs(${1:number})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Absolute value' },
      { label: 'round', kind: monaco.languages.CompletionItemKind.Function, insertText: 'round(${1:number}, ${2:digits})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Round number' },
      { label: 'int', kind: monaco.languages.CompletionItemKind.Function, insertText: 'int(${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Convert to int' },
      { label: 'float', kind: monaco.languages.CompletionItemKind.Function, insertText: 'float(${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Convert to float' },
      { label: 'str', kind: monaco.languages.CompletionItemKind.Function, insertText: 'str(${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Convert to string' },
      { label: 'list', kind: monaco.languages.CompletionItemKind.Function, insertText: 'list(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Convert to list' },
      { label: 'dict', kind: monaco.languages.CompletionItemKind.Function, insertText: 'dict(${1:mapping})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Create dict' },
      { label: 'set', kind: monaco.languages.CompletionItemKind.Function, insertText: 'set(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Create set' },
      { label: 'tuple', kind: monaco.languages.CompletionItemKind.Function, insertText: 'tuple(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Create tuple' },
      { label: 'type', kind: monaco.languages.CompletionItemKind.Function, insertText: 'type(${1:obj})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get type' },
      { label: 'isinstance', kind: monaco.languages.CompletionItemKind.Function, insertText: 'isinstance(${1:obj}, ${2:class})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Check instance' },
      { label: 'hasattr', kind: monaco.languages.CompletionItemKind.Function, insertText: 'hasattr(${1:obj}, \'${2:attr}\')', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Check attribute' },
      { label: 'getattr', kind: monaco.languages.CompletionItemKind.Function, insertText: 'getattr(${1:obj}, \'${2:attr}\', ${3:default})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get attribute' },
      { label: 'setattr', kind: monaco.languages.CompletionItemKind.Function, insertText: 'setattr(${1:obj}, \'${2:attr}\', ${3:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Set attribute' },
      
      // Snippets
      { label: 'def', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'def ${1:function_name}(${2:params}):\n\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Function definition' },
      { label: 'defmain', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'def main():\n\t${1:pass}\n\nif __name__ == "__main__":\n\tmain()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Main function' },
      { label: 'class', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'class ${1:ClassName}:\n\tdef __init__(self, ${2:params}):\n\t\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Class definition' },
      { label: 'classmethod', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '@classmethod\ndef ${1:method}(cls, ${2:params}):\n\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Class method' },
      { label: 'staticmethod', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '@staticmethod\ndef ${1:method}(${2:params}):\n\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Static method' },
      { label: 'property', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '@property\ndef ${1:name}(self):\n\treturn self._${1:name}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Property decorator' },
      { label: 'for', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for ${1:item} in ${2:iterable}:\n\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'For loop' },
      { label: 'forange', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for ${1:i} in range(${2:n}):\n\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'For range loop' },
      { label: 'forenum', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for ${1:index}, ${2:item} in enumerate(${3:iterable}):\n\t${4:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'For enumerate loop' },
      { label: 'while', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'while ${1:condition}:\n\t${2:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'While loop' },
      { label: 'if', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if ${1:condition}:\n\t${2:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'If statement' },
      { label: 'ifelse', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if ${1:condition}:\n\t${2:pass}\nelse:\n\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'If-else statement' },
      { label: 'ifelif', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if ${1:condition}:\n\t${2:pass}\nelif ${3:condition}:\n\t${4:pass}\nelse:\n\t${5:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'If-elif-else' },
      { label: 'try', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:e}:\n\t${4:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Try-except block' },
      { label: 'tryfinally', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:e}:\n\t${4:pass}\nfinally:\n\t${5:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Try-except-finally' },
      { label: 'with', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'with ${1:expression} as ${2:var}:\n\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'With statement' },
      { label: 'withopen', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'with open(\'${1:filename}\', \'${2:r}\') as ${3:f}:\n\t${4:content = f.read()}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Open file' },
      { label: 'lambda', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'lambda ${1:x}: ${2:x}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Lambda function' },
      { label: 'listcomp', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '[${1:expr} for ${2:item} in ${3:iterable}]', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'List comprehension' },
      { label: 'listcompif', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '[${1:expr} for ${2:item} in ${3:iterable} if ${4:condition}]', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'List comprehension with condition' },
      { label: 'dictcomp', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '{${1:key}: ${2:value} for ${3:item} in ${4:iterable}}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Dict comprehension' },
      { label: 'import', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'import ${1:module}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Import module' },
      { label: 'fromimport', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'from ${1:module} import ${2:name}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'From import' },
      { label: 'async', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'async def ${1:function_name}(${2:params}):\n\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Async function' },
      { label: 'await', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'await ${1:coroutine}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Await expression' },
    ]

    // Java completions
    const javaCompletions = [
      // Print
      { label: 'sout', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'System.out.println(${1:message});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Print line' },
      { label: 'souf', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'System.out.printf("${1:format}", ${2:args});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Print formatted' },
      { label: 'serr', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'System.err.println(${1:error});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Print error' },
      
      // Main method
      { label: 'main', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'public static void main(String[] args) {\n\t${1}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Main method' },
      { label: 'psvm', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'public static void main(String[] args) {\n\t${1}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Main method' },
      
      // Class/Method
      { label: 'class', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'public class ${1:ClassName} {\n\t${2}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Class declaration' },
      { label: 'method', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'public ${1:void} ${2:methodName}(${3:params}) {\n\t${4}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Method declaration' },
      { label: 'constructor', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'public ${1:ClassName}(${2:params}) {\n\t${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Constructor' },
      
      // Control flow
      { label: 'if', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if (${1:condition}) {\n\t${2}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'If statement' },
      { label: 'ifelse', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if (${1:condition}) {\n\t${2}\n} else {\n\t${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'If-else statement' },
      { label: 'for', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'For loop' },
      { label: 'foreach', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for (${1:Type} ${2:item} : ${3:collection}) {\n\t${4}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'For-each loop' },
      { label: 'while', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'while (${1:condition}) {\n\t${2}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'While loop' },
      { label: 'switch', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'switch (${1:expression}) {\n\tcase ${2:value}:\n\t\t${3}\n\t\tbreak;\n\tdefault:\n\t\t${4}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Switch statement' },
      { label: 'trycatch', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'try {\n\t${1}\n} catch (${2:Exception} ${3:e}) {\n\t${4}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Try-catch block' },
      
      // String methods
      { label: '.length', kind: monaco.languages.CompletionItemKind.Method, insertText: '.length()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'String length' },
      { label: '.charAt', kind: monaco.languages.CompletionItemKind.Method, insertText: '.charAt(${1:index})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get char at index' },
      { label: '.substring', kind: monaco.languages.CompletionItemKind.Method, insertText: '.substring(${1:start}, ${2:end})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get substring' },
      { label: '.equals', kind: monaco.languages.CompletionItemKind.Method, insertText: '.equals(${1:other})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Compare strings' },
      { label: '.equalsIgnoreCase', kind: monaco.languages.CompletionItemKind.Method, insertText: '.equalsIgnoreCase(${1:other})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Compare ignore case' },
      { label: '.contains', kind: monaco.languages.CompletionItemKind.Method, insertText: '.contains(${1:str})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Contains substring' },
      { label: '.split', kind: monaco.languages.CompletionItemKind.Method, insertText: '.split("${1:delimiter}")', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Split string' },
      { label: '.trim', kind: monaco.languages.CompletionItemKind.Method, insertText: '.trim()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Trim whitespace' },
      { label: '.toLowerCase', kind: monaco.languages.CompletionItemKind.Method, insertText: '.toLowerCase()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'To lowercase' },
      { label: '.toUpperCase', kind: monaco.languages.CompletionItemKind.Method, insertText: '.toUpperCase()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'To uppercase' },
      { label: '.replace', kind: monaco.languages.CompletionItemKind.Method, insertText: '.replace(${1:old}, ${2:new})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Replace substring' },
      
      // ArrayList methods
      { label: '.add', kind: monaco.languages.CompletionItemKind.Method, insertText: '.add(${1:element})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Add element' },
      { label: '.get', kind: monaco.languages.CompletionItemKind.Method, insertText: '.get(${1:index})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get element' },
      { label: '.set', kind: monaco.languages.CompletionItemKind.Method, insertText: '.set(${1:index}, ${2:element})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Set element' },
      { label: '.remove', kind: monaco.languages.CompletionItemKind.Method, insertText: '.remove(${1:index})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Remove element' },
      { label: '.size', kind: monaco.languages.CompletionItemKind.Method, insertText: '.size()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get size' },
      { label: '.isEmpty', kind: monaco.languages.CompletionItemKind.Method, insertText: '.isEmpty()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Check if empty' },
      { label: '.clear', kind: monaco.languages.CompletionItemKind.Method, insertText: '.clear()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Clear list' },
    ]

    // C++ completions
    const cppCompletions = [
      // I/O
      { label: 'cout', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'std::cout << ${1:message} << std::endl;', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Print to cout' },
      { label: 'cin', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'std::cin >> ${1:variable};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Read from cin' },
      { label: 'cerr', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'std::cerr << ${1:error} << std::endl;', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Print error' },
      
      // Main
      { label: 'main', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'int main() {\n\t${1}\n\treturn 0;\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Main function' },
      { label: 'mainargs', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'int main(int argc, char* argv[]) {\n\t${1}\n\treturn 0;\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Main with args' },
      
      // Includes
      { label: '#include', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '#include <${1:iostream}>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Include header' },
      { label: 'includeall', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Common includes' },
      
      // Control flow
      { label: 'for', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'For loop' },
      { label: 'foreach', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for (auto& ${1:item} : ${2:container}) {\n\t${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Range-based for' },
      { label: 'while', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'while (${1:condition}) {\n\t${2}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'While loop' },
      { label: 'if', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if (${1:condition}) {\n\t${2}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'If statement' },
      { label: 'ifelse', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if (${1:condition}) {\n\t${2}\n} else {\n\t${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'If-else' },
      { label: 'switch', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'switch (${1:expression}) {\n\tcase ${2:value}:\n\t\t${3}\n\t\tbreak;\n\tdefault:\n\t\t${4}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Switch statement' },
      
      // Class/Struct
      { label: 'class', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'class ${1:ClassName} {\npublic:\n\t${1:ClassName}() {}\n\t~${1:ClassName}() {}\nprivate:\n\t${2}\n};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Class declaration' },
      { label: 'struct', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'struct ${1:StructName} {\n\t${2}\n};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Struct declaration' },
      
      // Vector methods
      { label: '.push_back', kind: monaco.languages.CompletionItemKind.Method, insertText: '.push_back(${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Add to end' },
      { label: '.pop_back', kind: monaco.languages.CompletionItemKind.Method, insertText: '.pop_back()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Remove from end' },
      { label: '.size', kind: monaco.languages.CompletionItemKind.Method, insertText: '.size()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get size' },
      { label: '.empty', kind: monaco.languages.CompletionItemKind.Method, insertText: '.empty()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Check if empty' },
      { label: '.begin', kind: monaco.languages.CompletionItemKind.Method, insertText: '.begin()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Begin iterator' },
      { label: '.end', kind: monaco.languages.CompletionItemKind.Method, insertText: '.end()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'End iterator' },
      { label: '.front', kind: monaco.languages.CompletionItemKind.Method, insertText: '.front()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'First element' },
      { label: '.back', kind: monaco.languages.CompletionItemKind.Method, insertText: '.back()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Last element' },
      { label: '.clear', kind: monaco.languages.CompletionItemKind.Method, insertText: '.clear()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Clear container' },
      { label: '.erase', kind: monaco.languages.CompletionItemKind.Method, insertText: '.erase(${1:iterator})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Erase element' },
      { label: '.insert', kind: monaco.languages.CompletionItemKind.Method, insertText: '.insert(${1:position}, ${2:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Insert element' },
      { label: '.find', kind: monaco.languages.CompletionItemKind.Method, insertText: '.find(${1:value})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Find element' },
    ]

    // Register JavaScript completion provider
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }
        return {
          suggestions: jsCompletions.map((item: any) => ({ ...item, range }))
        }
      },
      triggerCharacters: ['.', '(', '"', "'"]
    })

    // Register TypeScript completion provider
    monaco.languages.registerCompletionItemProvider('typescript', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }
        return {
          suggestions: jsCompletions.map((item: any) => ({ ...item, range }))
        }
      },
      triggerCharacters: ['.', '(', '"', "'"]
    })

    // Register Python completion provider
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }
        return {
          suggestions: pythonCompletions.map((item: any) => ({ ...item, range }))
        }
      },
      triggerCharacters: ['.', '(', '"', "'"]
    })

    // Register Java completion provider
    monaco.languages.registerCompletionItemProvider('java', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }
        return {
          suggestions: javaCompletions.map((item: any) => ({ ...item, range }))
        }
      },
      triggerCharacters: ['.', '(', '"', "'"]
    })

    // Register C++ completion provider
    monaco.languages.registerCompletionItemProvider('cpp', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }
        return {
          suggestions: cppCompletions.map((item: any) => ({ ...item, range }))
        }
      },
      triggerCharacters: ['.', '(', '"', "'", '<', '#']
    })

    // Register C completion provider (use C++ completions)
    monaco.languages.registerCompletionItemProvider('c', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }
        return {
          suggestions: cppCompletions.map((item: any) => ({ ...item, range }))
        }
      },
      triggerCharacters: ['.', '(', '"', "'", '<', '#']
    })
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

  // Define custom themes
  const defineCustomThemes = (monaco: any) => {
    // GitHub Dark theme
    monaco.editor.defineTheme('github-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff7b72' },
        { token: 'string', foreground: 'a5d6ff' },
        { token: 'number', foreground: '79c0ff' },
        { token: 'type', foreground: 'ffa657' },
        { token: 'function', foreground: 'd2a8ff' },
        { token: 'variable', foreground: 'ffa657' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#c9d1d9',
        'editor.lineHighlightBackground': '#161b22',
        'editorLineNumber.foreground': '#484f58',
        'editorCursor.foreground': '#58a6ff',
        'editor.selectionBackground': '#264f78',
      }
    });

    // Dracula theme
    monaco.editor.defineTheme('dracula', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff79c6' },
        { token: 'string', foreground: 'f1fa8c' },
        { token: 'number', foreground: 'bd93f9' },
        { token: 'type', foreground: '8be9fd', fontStyle: 'italic' },
        { token: 'function', foreground: '50fa7b' },
        { token: 'variable', foreground: 'f8f8f2' },
      ],
      colors: {
        'editor.background': '#282a36',
        'editor.foreground': '#f8f8f2',
        'editor.lineHighlightBackground': '#44475a',
        'editorLineNumber.foreground': '#6272a4',
        'editorCursor.foreground': '#f8f8f0',
        'editor.selectionBackground': '#44475a',
      }
    });

    // One Dark Pro theme
    monaco.editor.defineTheme('one-dark-pro', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c678dd' },
        { token: 'string', foreground: '98c379' },
        { token: 'number', foreground: 'd19a66' },
        { token: 'type', foreground: 'e5c07b' },
        { token: 'function', foreground: '61afef' },
        { token: 'variable', foreground: 'e06c75' },
      ],
      colors: {
        'editor.background': '#282c34',
        'editor.foreground': '#abb2bf',
        'editor.lineHighlightBackground': '#2c313c',
        'editorLineNumber.foreground': '#4b5263',
        'editorCursor.foreground': '#528bff',
        'editor.selectionBackground': '#3e4451',
      }
    });

    // Monokai theme
    monaco.editor.defineTheme('monokai', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '88846f', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'f92672' },
        { token: 'string', foreground: 'e6db74' },
        { token: 'number', foreground: 'ae81ff' },
        { token: 'type', foreground: '66d9ef', fontStyle: 'italic' },
        { token: 'function', foreground: 'a6e22e' },
        { token: 'variable', foreground: 'f8f8f2' },
      ],
      colors: {
        'editor.background': '#272822',
        'editor.foreground': '#f8f8f2',
        'editor.lineHighlightBackground': '#3e3d32',
        'editorLineNumber.foreground': '#90908a',
        'editorCursor.foreground': '#f8f8f0',
        'editor.selectionBackground': '#49483e',
      }
    });

    // Nord theme
    monaco.editor.defineTheme('nord', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '616e88', fontStyle: 'italic' },
        { token: 'keyword', foreground: '81a1c1' },
        { token: 'string', foreground: 'a3be8c' },
        { token: 'number', foreground: 'b48ead' },
        { token: 'type', foreground: '8fbcbb' },
        { token: 'function', foreground: '88c0d0' },
        { token: 'variable', foreground: 'd8dee9' },
      ],
      colors: {
        'editor.background': '#2e3440',
        'editor.foreground': '#d8dee9',
        'editor.lineHighlightBackground': '#3b4252',
        'editorLineNumber.foreground': '#4c566a',
        'editorCursor.foreground': '#d8dee9',
        'editor.selectionBackground': '#434c5e',
      }
    });

    // Solarized Dark theme
    monaco.editor.defineTheme('solarized-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '586e75', fontStyle: 'italic' },
        { token: 'keyword', foreground: '859900' },
        { token: 'string', foreground: '2aa198' },
        { token: 'number', foreground: 'd33682' },
        { token: 'type', foreground: 'b58900' },
        { token: 'function', foreground: '268bd2' },
        { token: 'variable', foreground: '839496' },
      ],
      colors: {
        'editor.background': '#002b36',
        'editor.foreground': '#839496',
        'editor.lineHighlightBackground': '#073642',
        'editorLineNumber.foreground': '#586e75',
        'editorCursor.foreground': '#839496',
        'editor.selectionBackground': '#073642',
      }
    });

    // Solarized Light theme
    monaco.editor.defineTheme('solarized-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '93a1a1', fontStyle: 'italic' },
        { token: 'keyword', foreground: '859900' },
        { token: 'string', foreground: '2aa198' },
        { token: 'number', foreground: 'd33682' },
        { token: 'type', foreground: 'b58900' },
        { token: 'function', foreground: '268bd2' },
        { token: 'variable', foreground: '657b83' },
      ],
      colors: {
        'editor.background': '#fdf6e3',
        'editor.foreground': '#657b83',
        'editor.lineHighlightBackground': '#eee8d5',
        'editorLineNumber.foreground': '#93a1a1',
        'editorCursor.foreground': '#657b83',
        'editor.selectionBackground': '#eee8d5',
      }
    });

    // Night Owl theme
    monaco.editor.defineTheme('night-owl', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '637777', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c792ea' },
        { token: 'string', foreground: 'ecc48d' },
        { token: 'number', foreground: 'f78c6c' },
        { token: 'type', foreground: 'ffcb8b' },
        { token: 'function', foreground: '82aaff' },
        { token: 'variable', foreground: 'd6deeb' },
      ],
      colors: {
        'editor.background': '#011627',
        'editor.foreground': '#d6deeb',
        'editor.lineHighlightBackground': '#0b2942',
        'editorLineNumber.foreground': '#4b6479',
        'editorCursor.foreground': '#80a4c2',
        'editor.selectionBackground': '#1d3b53',
      }
    });

    // Material Theme
    monaco.editor.defineTheme('material-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '546e7a', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c792ea' },
        { token: 'string', foreground: 'c3e88d' },
        { token: 'number', foreground: 'f78c6c' },
        { token: 'type', foreground: 'ffcb6b' },
        { token: 'function', foreground: '82aaff' },
        { token: 'variable', foreground: 'eeffff' },
      ],
      colors: {
        'editor.background': '#263238',
        'editor.foreground': '#eeffff',
        'editor.lineHighlightBackground': '#00000050',
        'editorLineNumber.foreground': '#37474f',
        'editorCursor.foreground': '#ffcc00',
        'editor.selectionBackground': '#80cbc440',
      }
    });

    // Cobalt2 theme
    monaco.editor.defineTheme('cobalt2', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '0088ff', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff9d00' },
        { token: 'string', foreground: 'a5ff90' },
        { token: 'number', foreground: 'ff628c' },
        { token: 'type', foreground: '80ffbb' },
        { token: 'function', foreground: 'ffc600' },
        { token: 'variable', foreground: 'ffffff' },
      ],
      colors: {
        'editor.background': '#193549',
        'editor.foreground': '#ffffff',
        'editor.lineHighlightBackground': '#0d3a58',
        'editorLineNumber.foreground': '#0088ff',
        'editorCursor.foreground': '#ffc600',
        'editor.selectionBackground': '#0050a4',
      }
    });
  };

  // Available themes
  const EDITOR_THEMES = [
    { id: 'vs-dark', name: 'VS Dark', category: 'dark' },
    { id: 'vs', name: 'VS Light', category: 'light' },
    { id: 'hc-black', name: 'High Contrast', category: 'dark' },
    { id: 'github-dark', name: 'GitHub Dark', category: 'dark' },
    { id: 'dracula', name: 'Dracula', category: 'dark' },
    { id: 'one-dark-pro', name: 'One Dark Pro', category: 'dark' },
    { id: 'monokai', name: 'Monokai', category: 'dark' },
    { id: 'nord', name: 'Nord', category: 'dark' },
    { id: 'solarized-dark', name: 'Solarized Dark', category: 'dark' },
    { id: 'solarized-light', name: 'Solarized Light', category: 'light' },
    { id: 'night-owl', name: 'Night Owl', category: 'dark' },
    { id: 'material-dark', name: 'Material Dark', category: 'dark' },
    { id: 'cobalt2', name: 'Cobalt2', category: 'dark' },
  ];

  // Set default theme based on system preference
  useEffect(() => {
    if (resolvedTheme === 'light' && editorTheme === 'vs-dark') {
      setEditorTheme('vs');
    }
  }, [resolvedTheme, editorTheme]);

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
    <TooltipProvider>
      <div className={cn(
        "flex flex-col gap-4 transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 bg-background p-4"
      )}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={language.id} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[140px]">
              <Code2 className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <SelectValue placeholder="Language" />
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
            <SelectTrigger className="w-[85px]">
              <span className="flex items-center gap-1">
                <Settings className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                <span className="font-medium text-sm">{fontSize}px</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              {[12, 14, 16, 18, 20, 22, 24].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={editorTheme} onValueChange={setEditorTheme}>
            <SelectTrigger className="w-[130px]">
              <span className="flex items-center gap-1.5 overflow-hidden">
                <div className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  EDITOR_THEMES.find(t => t.id === editorTheme)?.category === 'dark' 
                    ? "bg-zinc-600" 
                    : "bg-amber-400"
                )} />
                <span className="truncate text-sm">{EDITOR_THEMES.find(t => t.id === editorTheme)?.name}</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Dark Themes</div>
              {EDITOR_THEMES.filter(t => t.category === 'dark').map((theme) => (
                <SelectItem key={theme.id} value={theme.id}>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-600 flex-shrink-0" />
                    {theme.name}
                  </span>
                </SelectItem>
              ))}
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">Light Themes</div>
              {EDITOR_THEMES.filter(t => t.category === 'light').map((theme) => (
                <SelectItem key={theme.id} value={theme.id}>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                    {theme.name}
                  </span>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNewSnippet}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>New</p></TooltipContent>
          </Tooltip>

          {/* Save Dialog */}
          <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={openSaveDialog}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Save</p></TooltipContent>
            </Tooltip>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      fetchSnippets()
                      setIsLoadDialogOpen(true)
                    }}
                  >
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Load</p></TooltipContent>
            </Tooltip>
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

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Copy</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Export</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Reset</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleRunCode}
                disabled={isRunning}
                size="icon"
                className="bg-green-600 hover:bg-green-700"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Run Code</p>
            </TooltipContent>
          </Tooltip>
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
          {containsProteclink && (
            <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 px-4 py-2 border-b border-yellow-300 dark:border-yellow-700 flex items-center gap-2">
              <span className="font-bold">Proteclink Detected:</span>
              <span>This code contains <span className="underline font-mono">proteclink</span> related content. Please review or handle accordingly.</span>
            </div>
          )}
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
                // IntelliSense and Code Suggestions
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: true
                },
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: "on",
                tabCompletion: "on",
                wordBasedSuggestions: "currentDocument",
                parameterHints: {
                  enabled: true
                },
                hover: {
                  enabled: true
                },
                contextmenu: true,
                mouseWheelZoom: true,
                // Enable semantic highlighting for better code understanding
                // semanticHighlighting: {
                //   enabled: true
                // },
                // Enable folding
                folding: true,
                foldingHighlight: true,
                unfoldOnClickAfterEndOfLine: true,
                // Enable bracket matching
                matchBrackets: "always",
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                // Enable code actions
                // lightbulb: {
                //   enabled: "on"
                // },
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
    </TooltipProvider>
  )
}
