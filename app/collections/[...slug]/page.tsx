import fs from "fs"
import path from "path"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"

type Props = {
  params: { slug: string[] }
}

function joinUrlSegments(segments: string[]) {
  return segments.map(encodeURIComponent).join("/")
}

export default async function CollectionPage({ params }: Props) {
  const segments = params?.slug || []

  if (segments.length === 0) {
    notFound()
  }

  // decode each segment and construct a safe directory path
  const decodedSegments = segments.map((s) => decodeURIComponent(s))
  const dir = path.join(process.cwd() ?? "", "public", "resources", ...decodedSegments)

  let dirents: fs.Dirent[] = []
  try {
    dirents = await fs.promises.readdir(dir, { withFileTypes: true })
  } catch (e) {
    notFound()
  }

  const folders = dirents.filter((d) => d.isDirectory()).map((d) => d.name)
  const files = dirents.filter((d) => d.isFile()).map((d) => d.name)

  // Build breadcrumb segments
  const crumbs = [
    { name: "Collections", href: "/collections" },
    ...decodedSegments.map((name, i) => ({
      name,
      href: `/collections/${joinUrlSegments(decodedSegments.slice(0, i + 1))}`,
    })),
  ]

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-4">
        <nav className="text-sm">
        {crumbs.map((c, i) => (
          <span key={c.href}>
            <Link href={c.href} className="text-primary hover:underline">
              {c.name}
            </Link>
            {i < crumbs.length - 1 && <span className="mx-2">/</span>}
          </span>
        ))}
        </nav>

        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>

      <h1 className="text-3xl font-semibold mb-4">{decodedSegments.join(" / ")}</h1>
      <p className="text-muted-foreground mb-8">Folders and files in this collection.</p>

      {folders.length > 0 && (
        <section className="mb-8">
          <h2 className="font-medium mb-2">Sub-collections</h2>
          <ul className="space-y-2">
            {folders.map((f) => (
              <li key={f} className="p-3 border rounded-md flex items-center justify-between">
                <div>
                  <Link href={`/collections/${joinUrlSegments([...decodedSegments, f])}`} className="font-medium">
                    {f}
                  </Link>
                </div>
                <div>
                  <Link href={`/collections/${joinUrlSegments([...decodedSegments, f])}`} className="px-3 py-1 border rounded-md text-sm">
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {files.length > 0 ? (
        <section>
          <h2 className="font-medium mb-2">Files</h2>
          <ul className="space-y-4">
            {files.map((filename) => (
              <li key={filename} className="p-4 border rounded-md flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{filename}</h3>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" asChild>
                    <a
                      href={`/resources/${joinUrlSegments(decodedSegments)}/${encodeURIComponent(filename)}`}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </Button>

                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/resources/${joinUrlSegments(decodedSegments)}/${encodeURIComponent(filename)}`} target="_blank">
                      Open
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">No files in this folder.</p>
      )}
    </main>
  )
}
