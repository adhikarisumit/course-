import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

// Language configurations for Piston API
const LANGUAGE_CONFIG: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "cpp", version: "10.2.0" },
  c: { language: "c", version: "10.2.0" },
  csharp: { language: "csharp", version: "6.12.0" },
  go: { language: "go", version: "1.16.2" },
  rust: { language: "rust", version: "1.68.2" },
  php: { language: "php", version: "8.2.3" },
  ruby: { language: "ruby", version: "3.0.1" },
  swift: { language: "swift", version: "5.3.3" },
  kotlin: { language: "kotlin", version: "1.8.20" },
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { code, language, stdin } = await req.json()

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      )
    }

    const config = LANGUAGE_CONFIG[language]
    if (!config) {
      return NextResponse.json(
        { error: "Unsupported language" },
        { status: 400 }
      )
    }

    // Use Piston API for code execution
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: config.language,
        version: config.version,
        files: [
          {
            content: code,
          },
        ],
        stdin: stdin || "",
        args: [],
        compile_timeout: 10000,
        run_timeout: 5000,
        compile_memory_limit: -1,
        run_memory_limit: -1,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Piston API error:", errorText)
      return NextResponse.json(
        { error: "Code execution failed. Please try again." },
        { status: 500 }
      )
    }

    const result = await response.json()

    // Format the response
    const output = result.run?.output || result.compile?.output || ""
    const stderr = result.run?.stderr || result.compile?.stderr || ""
    const exitCode = result.run?.code ?? result.compile?.code ?? 0

    return NextResponse.json({
      success: true,
      output: output.trim(),
      stderr: stderr.trim(),
      exitCode,
      language: config.language,
      version: config.version,
    })
  } catch (error) {
    console.error("Code execution error:", error)
    return NextResponse.json(
      { error: "An error occurred while executing the code" },
      { status: 500 }
    )
  }
}
