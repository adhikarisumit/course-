import { readdirSync, statSync } from "fs"
import path from "path"

interface Collection {
  name: string
  path: string
}

export async function GET() {
  try {
    const resourcesPath = path.join(process.cwd(), "public/resources")
    const entries = readdirSync(resourcesPath)

    const collections: Collection[] = []

    for (const entry of entries) {
      const fullPath = path.join(resourcesPath, entry)
      const stat = statSync(fullPath)

      // Only include directories (collections)
      if (stat.isDirectory()) {
        collections.push({
          name: entry.charAt(0).toUpperCase() + entry.slice(1).replace(/-/g, " "),
          path: entry,
        })
      }
    }

    // Sort collections alphabetically
    collections.sort((a, b) => a.name.localeCompare(b.name))

    return Response.json(collections)
  } catch (error) {
    console.error("Error fetching collections:", error)
    return Response.json([], { status: 200 })
  }
}
