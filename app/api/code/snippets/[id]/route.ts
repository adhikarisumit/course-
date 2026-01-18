import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { writeFile, mkdir, unlink, readdir } from "fs/promises"
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

// Helper function to delete old snippet files
async function deleteSnippetFiles(userId: string, snippetId: string): Promise<void> {
  const userDir = path.join(process.cwd(), "storage", "snippets", userId)
  try {
    const files = await readdir(userDir)
    const snippetPrefix = snippetId.substring(0, 8)
    for (const file of files) {
      if (file.includes(`-${snippetPrefix}.`)) {
        await unlink(path.join(userDir, file))
      }
    }
  } catch {
    // Directory might not exist, ignore
  }
}

// GET - Get a single snippet
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const snippet = await prisma.codeSnippet.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!snippet) {
      return NextResponse.json(
        { error: "Snippet not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ snippet })
  } catch (error) {
    console.error("Error fetching snippet:", error)
    return NextResponse.json(
      { error: "Failed to fetch snippet" },
      { status: 500 }
    )
  }
}

// PUT - Update a snippet
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const { title, description, code, language } = await req.json()

    // Verify ownership
    const existingSnippet = await prisma.codeSnippet.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingSnippet) {
      return NextResponse.json(
        { error: "Snippet not found" },
        { status: 404 }
      )
    }

    // Check if language is changing
    const isLanguageChanging = language && language !== existingSnippet.language

    const snippet = await prisma.codeSnippet.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(code && { code }),
        ...(language && { language }),
      },
    })

    // Update the code file
    try {
      if (isLanguageChanging) {
        // Language changed - keep old file, create new one with new extension
        const filename = await saveCodeFile(
          user.id,
          snippet.id,
          snippet.title,
          snippet.code,
          snippet.language
        )
        console.log(`New language file created: ${filename} (old file preserved)`)
      } else {
        // Same language - delete old file and create updated one
        await deleteSnippetFiles(user.id, id)
        const filename = await saveCodeFile(
          user.id,
          snippet.id,
          snippet.title,
          snippet.code,
          snippet.language
        )
        console.log(`Code file updated: ${filename}`)
      }
    } catch (fileError) {
      console.error("Error updating code file:", fileError)
    }

    return NextResponse.json({ snippet })
  } catch (error) {
    console.error("Error updating snippet:", error)
    return NextResponse.json(
      { error: "Failed to update snippet" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a snippet
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Verify ownership
    const existingSnippet = await prisma.codeSnippet.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingSnippet) {
      return NextResponse.json(
        { error: "Snippet not found" },
        { status: 404 }
      )
    }

    await prisma.codeSnippet.delete({
      where: { id },
    })

    // Delete the code file
    try {
      await deleteSnippetFiles(user.id, id)
      console.log(`Code file deleted for snippet: ${id}`)
    } catch (fileError) {
      console.error("Error deleting code file:", fileError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting snippet:", error)
    return NextResponse.json(
      { error: "Failed to delete snippet" },
      { status: 500 }
    )
  }
}
