import fs from "fs"
import path from "path"
import Link from "next/link"
import { notFound } from "next/navigation"

type Props = {
  params: { collection: string }
}

export default async function CollectionPage({ params }: Props) {
  const collection = params?.collection

  if (!collection) {
    notFound()
  }

  const decodedCollection = decodeURIComponent(collection)
  const dir = path.join(process.cwd() ?? "", "public", "resources", decodedCollection)

  let files: string[] = []
  try {
    files = await fs.promises.readdir(dir)
  } catch (e) {
    files = []
  }

  if (files.length === 0) {
    return (
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold mb-4">Collection: {collection}</h1>
        <p className="text-sm text-muted-foreground">No files found in this collection.</p>
        <p className="mt-4">
          <Link href="/collections" className="text-primary underline">
            Back to Collections
          </Link>
        </p>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-4">Collection: {collection}</h1>
      <p className="text-muted-foreground mb-8">Downloadable files in this collection.</p>

      <ul className="space-y-4">
        {files.map((filename) => (
          <li key={filename} className="p-4 border rounded-md flex items-center justify-between">
            <div>
              <h2 className="font-medium">{filename}</h2>
            </div>
            <div className="flex gap-2">
              <a
                href={`/resources/${encodeURIComponent(collection)}/${encodeURIComponent(filename)}`}
                className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90"
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>
              <Link href={`/resources/${encodeURIComponent(collection)}/${encodeURIComponent(filename)}`} target="_blank" className="px-4 py-2 border rounded-md text-sm text-muted-foreground">
                Open
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
