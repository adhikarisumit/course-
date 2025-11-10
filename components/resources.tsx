"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Video, BookOpen, Download, ExternalLink } from "lucide-react"

const resources = [
  {
    icon: FileText,
    title: "Study Notes",
    description: "Comprehensive notes on various topics",
    items: [
      { name: "JavaScript ES6+ Features", type: "PDF", url: "/resources/javascript-es6-features.txt" },
      { name: "React Hooks Cheat Sheet", type: "PDF", url: "/resources/react-hooks-cheatsheet.txt" },
      { name: "SQL Query Reference", type: "PDF", url: "/resources/sql-query-reference.txt" },
    ],
  },
  {
    icon: Video,
    title: "Video Tutorials",
    description: "Curated video content from YouTube",
    items: [
      { name: "Gen AI Intensive Course with Google Day 1", type: "Video", url: "https://www.youtube.com/live/ZaUcqznlhv8?si=wkKloy5m5boKdoZH" },
      { name: "Git & GitHub Crash Course", type: "Video", url: "https://www.youtube.com/watch?v=RGOj5yH7evk" },
      { name: "CSS Grid & Flexbox Guide", type: "Video", url: "https://www.youtube.com/watch?v=3elGSZSWTbM" },
      { name: "API Development Tutorial", type: "Video", url: "https://www.youtube.com/watch?v=0oXYLzuucwE" },
      { name: "Office install Mac", type: "Video", url: "https://www.tiktok.com/@noob_programmer4u/video/7563520469438156048?is_from_webapp=1&sender_device=pc&web_id=7511665166490420744" },
      { name: "Office install windows", type: "Video", url: "https://www.tiktok.com/@noob_programmer4u/video/7560573368672505089?is_from_webapp=1&sender_device=pc&web_id=7511665166490420744" },
    ],
  },
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Links to official documentation",
    items: [
      { name: "React Official Docs", type: "Link", url: "https://react.dev" },
      { name: "MDN Web Docs", type: "Link", url: "https://developer.mozilla.org" },
      { name: "Python Documentation", type: "Link", url: "https://docs.python.org" },
    ],
  },
]

export function Resources() {
  const handleResourceClick = (item: { name: string; type: string; url: string }) => {
    if (item.type === "PDF") {
      const link = document.createElement("a")
      link.href = item.url
      link.download = item.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      window.open(item.url, "_blank")
    }
  }

  return (
    <section className="py-16 md:py-24" id="resources">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Learning Resources</h2>
          <p className="text-muted-foreground text-lg">Additional materials to support your learning journey</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource.title}>
              <CardHeader>
                <resource.icon className="h-10 w-10 mb-3 text-primary" />
                <h3 className="font-semibold text-xl">{resource.title}</h3>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {resource.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <span className="text-sm flex-1">{item.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleResourceClick(item)}
                      >
                        {item.type === "PDF" ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

