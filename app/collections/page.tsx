import fs from "fs"
import path from "path"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Folder } from "lucide-react"

interface CollectionFile {
  name: string
  path: string
  type: "file" | "folder"
}

interface Collection {
  name: string
  path: string
  isDirectory: boolean
  files?: CollectionFile[]
  subcollections?: Collection[]
}

async function getCollections(): Promise<Collection[]> {
  const resourcesDir = path.join(process.cwd(), "public", "resources")
  const collections: Collection[] = []

  try {
    const dirents = await fs.promises.readdir(resourcesDir, { withFileTypes: true })

    for (const dirent of dirents) {
      const collection: Collection = {
        name: dirent.name,
        path: dirent.name,
        isDirectory: dirent.isDirectory(),
      }

      // If it's a directory, get files and subcollections
      if (dirent.isDirectory()) {
        try {
          const subDirents = await fs.promises.readdir(path.join(resourcesDir, dirent.name), { withFileTypes: true })
          
          // Get files (PDFs, TXT, etc.)
          collection.files = subDirents
            .filter((d) => d.isFile())
            .map((d) => ({
              name: d.name,
              path: `${dirent.name}/${d.name}`,
              type: "file" as const,
            }))
            .sort((a, b) => a.name.localeCompare(b.name))

          // Get subcollections (directories)
          collection.subcollections = subDirents
            .filter((d) => d.isDirectory())
            .map((d) => ({
              name: d.name,
              path: `${dirent.name}/${d.name}`,
              isDirectory: true,
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
        } catch (e) {
          collection.files = []
          collection.subcollections = []
        }
      }

      collections.push(collection)
    }
  } catch (e) {
    // Handle error silently
  }

  return collections.sort((a, b) => a.name.localeCompare(b.name))
}

export default async function CollectionsPage() {
  const collections = await getCollections()

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-semibold">Collections</h1>
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground mb-8">Explore our organized resource collections and documents.</p>

      {collections.length === 0 ? (
        <p className="text-sm text-muted-foreground">No collections found. Add folders under `public/resources/`.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <div key={collection.path} className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold mb-4">{collection.name}</h2>

              {/* Display Subcollections */}
              {collection.isDirectory && collection.subcollections && collection.subcollections.length > 0 ? (
                <div className="mb-6 pb-4 border-b border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Subcategories</h3>
                  <div className="space-y-1">
                    {collection.subcollections.map((sub) => (
                      <Button key={sub.path} asChild variant="ghost" className="w-full justify-start text-sm h-8">
                        <Link href={`/collections/${encodeURIComponent(sub.path)}`}>
                          <Folder className="h-4 w-4 mr-2" />
                          {sub.name}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Display Files */}
              {collection.isDirectory && collection.files && collection.files.length > 0 ? (
                <div className="mb-6 pb-4 border-b border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Documents ({collection.files.length})</h3>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {collection.files.map((file) => (
                      <a
                        key={file.path}
                        href={`/resources/${file.path}`}
                        download
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline py-1"
                        title={file.name}
                      >
                        <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <Button asChild className="w-full">
                <Link href={`/collections/${encodeURIComponent(collection.path)}`}>
                  View Collection
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
