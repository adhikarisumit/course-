import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

// Language to file extension mapping
const LANGUAGE_EXTENSIONS: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  java: "java",
  cpp: "cpp",
  c: "c",
  csharp: "cs",
  go: "go",
  rust: "rs",
  php: "php",
  ruby: "rb",
  kotlin: "kt",
}

// Helper function to sanitize filename
function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50)
}

// Helper function to save code as file
async function saveCodeFile(
  userId: string,
  snippetId: string,
  title: string,
  code: string,
  language: string
): Promise<string> {
  const extension = LANGUAGE_EXTENSIONS[language] || "txt"
  const sanitizedTitle = sanitizeFilename(title)
  const filename = `${sanitizedTitle}-${snippetId.substring(0, 8)}.${extension}`
  
  // Create user's snippets directory
  const userDir = path.join(process.cwd(), "storage", "snippets", userId)
  await mkdir(userDir, { recursive: true })
  
  // Save the file
  const filePath = path.join(userDir, filename)
  await writeFile(filePath, code, "utf-8")
  
  return filename
}

// GET - List all snippets for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(req.url)
    const language = searchParams.get("language")

    const snippets = await prisma.codeSnippet.findMany({
      where: {
        userId: user.id,
        ...(language && { language }),
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ snippets })
  } catch (error) {
    console.error("Error fetching snippets:", error)
    return NextResponse.json(
      { error: "Failed to fetch snippets" },
      { status: 500 }
    )
  }
}

// POST - Create a new snippet
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const { title, description, code, language } = await req.json()

    if (!title || !code || !language) {
      return NextResponse.json(
        { error: "Title, code, and language are required" },
        { status: 400 }
      )
    }

    const snippet = await prisma.codeSnippet.create({
      data: {
        title,
        description: description || null,
        code,
        language,
        userId: user.id,
      },
    })

    // Save code as file
    try {
      const filename = await saveCodeFile(user.id, snippet.id, title, code, language)
      console.log(`Code saved to file: ${filename}`)
    } catch (fileError) {
      console.error("Error saving code file:", fileError)
      // Don't fail the request if file saving fails - database record is created
    }

    return NextResponse.json({ snippet }, { status: 201 })
  } catch (error) {
    console.error("Error creating snippet:", error)
    return NextResponse.json(
      { error: "Failed to create snippet" },
      { status: 500 }
    )
  }
}
