import { Metadata } from "next"
import CodeEditor from "@/components/code-editor"
import { Code2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Code Playground",
  description: "Practice coding with our online code editor and compiler",
}

export default function PlaygroundPage() {
  return (
    <div className="container py-6 px-4 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Code Playground</h1>
            <p className="text-sm text-muted-foreground">
              Write, run, and test your code in multiple programming languages
            </p>
          </div>
        </div>
      </div>

      {/* Code Editor Component */}
      <CodeEditor />
    </div>
  )
}
