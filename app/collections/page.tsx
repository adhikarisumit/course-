import fs from "fs"
import path from "path"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function CollectionsPage() {
  const resourcesDir = path.join(process.cwd(), "public", "resources")
  let entries: string[] = []

  try {
    const dirents = await fs.promises.readdir(resourcesDir, { withFileTypes: true })
    entries = dirents.filter((d) => d.isDirectory()).map((d) => d.name)
  } catch (e) {
    entries = []
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-4">Collections</h1>
      <p className="text-muted-foreground mb-8">Grouped downloadable resource collections.</p>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No collections found. Add folders under `public/resources/`.</p>
      ) : (
        <ul className="space-y-4">
          {entries.map((id) => (
            <li key={id} className="p-4 border rounded-md flex items-center justify-between">
              <div>
                <h2 className="font-medium">{id}</h2>
                <p className="text-sm text-muted-foreground">Resources in the `{id}` collection.</p>
              </div>
              <div>
                <Button asChild>
                  <Link href={`/collections/${encodeURIComponent(id)}`}>Open</Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
