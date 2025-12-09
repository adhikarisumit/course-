"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  const scrollToCourses = () => {
    document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToResources = () => {
    document.getElementById("resources")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Programming keyboard background image - very visible */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-75 dark:opacity-55"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1629654297299-c8506221ca97?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.0.3')`,
        }}
      ></div>
      
      {/* Minimal gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-background/30 to-background/50"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/40"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Your Gateway to Quality Online Learning
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
            Discover curated courses, educational notes, and learning resources from the best platforms across the web.
            All in one place.<br></br>
            <mark className="bg-yellow-300 dark:bg-yellow-400 text-gray-900 dark:text-gray-900 px-3 py-1.5 rounded font-medium">
              Note: We're not course builders or course owner. We just guide and provide the course, resources and ideas.
            </mark>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" onClick={scrollToCourses}>
              Explore Courses
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 hover:bg-accent/50 transition-all" onClick={scrollToResources}>
              Browse Resources
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

