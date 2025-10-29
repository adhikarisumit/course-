"use client"

import { BookOpen, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  const handleSearch = () => {
    const coursesSection = document.getElementById("courses")
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            <span className="text-xl font-semibold">Proteclink</span>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses, notes, resources..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                />
              </div>
              <Button onClick={handleSearch} size="default">
                Search
              </Button>
            </div>
          </div>

          <nav className="flex items-center gap-6">
            <a href="#courses" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              Courses
            </a>
            <a href="#resources" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
              Resources
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}

