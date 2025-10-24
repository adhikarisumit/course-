"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"

const cheatSheets = [
  {
    name: "Python code ",
    description: "Don't copy all to all .Write your own syntax",
    url: "/resources/pythonCode.txt",
    topics: ["Nen hisab garne code "],
  },
  {
    name: "React Hooks Cheat Sheet",
    description: "Complete guide to React Hooks including useState, useEffect, useContext, and custom hooks",
    url: "/resources/react-hooks-cheatsheet.txt",
    topics: ["useState", "useEffect", "useContext", "useRef", "useMemo", "useCallback"],
  },
  {
    name: "SQL Query Reference",
    description: "Essential SQL commands for database operations, joins, and data manipulation",
    url: "/resources/sql-query-reference.txt",
    topics: ["SELECT", "JOIN", "INSERT", "UPDATE", "DELETE", "GROUP BY"],
  },
]

export default function CheatSheetsPage() {
  const handleDownload = (url: string, name: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cheat Sheets</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Quick reference guides and cheat sheets to help you learn faster. Download these handy resources for offline
            access.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cheatSheets.map((sheet) => (
            <Card key={sheet.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">{sheet.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{sheet.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Topics Covered:</h4>
                  <div className="flex flex-wrap gap-2">
                    {sheet.topics.map((topic) => (
                      <span key={topic} className="text-xs px-2 py-1 bg-secondary rounded-md">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <Button onClick={() => handleDownload(sheet.url, sheet.name)} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Cheat Sheet
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 bg-secondary/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Need More Resources?</h2>
          <p className="text-muted-foreground mb-4">
            Check out our complete collection of learning resources including video tutorials and documentation.
          </p>
          <Link href="/#resources">
            <Button variant="outline">View All Resources</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
