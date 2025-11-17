import React from "react"
import Link from "next/link"

const files: { title: string; filename: string; description?: string }[] = [
  {
    title: "230新日本语能力考试 N2 ",
    filename: "230新日本语能力考试  N2  Luyen tap Tu vung - Chu Han (1).pdf",
  },
  {
    title: "試験 に 出る 文法 と 表現 1-2級",
    filename: "Shiken ni deru Bunpou to hyougen 1-2kyuu.pdf",
  },
  {
    title: "予想 問題数",
    filename: "Yosou mondaishuu.pdf",
  },
  {
    title: "JLPT 合格 できる N2",
    filename: "[studyjapanese.net]_JLPT_Goukaku_Dekiru_N2.pdf",
  },
  {
    title: "新日本语能力考试N2语法 练习篇",
    filename: "新日本语能力考试N2语法  练习篇_12470060.pdf",
  },
]

function fileUrl(filename: string) {
  // Build a safe URL relative to the public folder
  return `/resources/N2/${encodeURIComponent(filename)}`
}

export default function Page() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-4">JLPT N2 Collection</h1>
      <p className="text-muted-foreground mb-8">Downloadable practice materials and guides for JLPT N2.</p>

      <ul className="space-y-4">
        {files.map((f) => (
          <li key={f.filename} className="p-4 border rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium">{f.title}</h2>
                {f.description && <p className="text-sm text-muted-foreground">{f.description}</p>}
              </div>

              <div className="flex gap-2">
                <a
                  href={fileUrl(f.filename)}
                  className="px-4 py-2 bg-primary text-muted-foreground rounded-md hover:opacity-90"
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
                <Link
                  href={fileUrl(f.filename)}
                  className="px-4 py-2 border rounded-md text-sm text-muted-foreground hover:bg-muted"
                  target="_blank"
                >
                  Open
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
