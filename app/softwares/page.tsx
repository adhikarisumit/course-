"use client"

import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const softwareLinks = [
  {
    name: "VS Code",
    description: "Popular code editor with great extension support",
    url: "https://code.visualstudio.com/download",
    category: "Development",
  },
  {
    name: "Git",
    description: "Version control system for tracking changes in code",
    url: "https://git-scm.com/downloads",
    category: "Development",
  },
  {
    name: "Node.js",
    description: "JavaScript runtime built on Chrome's V8 JavaScript engine",
    url: "https://nodejs.org/",
    category: "Development",
  },
  {
    name: "PostgreSQL",
    description: "Powerful, open source object-relational database system",
    url: "https://www.postgresql.org/download/",
    category: "Database",
  },
  {
    name: "MongoDB",
    description: "Document-oriented NoSQL database",
    url: "https://www.mongodb.com/try/download/community",
    category: "Database",
  }
]

export default function SoftwaresPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Softwares & Links</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Essential software downloads and useful links for development and learning.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {softwareLinks.map((item) => (
            <Card key={item.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2">
                      {item.category}
                    </Badge>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <Button className="w-full gap-2" variant="outline" asChild>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    Download / Visit
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}