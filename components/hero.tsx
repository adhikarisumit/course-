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
    <section className="py-20 md:py-32 bg-gradient-to-b from-secondary to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Your Gateway to Quality Online Learning</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
            Discover curated courses, educational notes, and learning resources from the best platforms across the web.
            All in one place.<br></br><mark>Note:We're not course builders or course owner. We just guide and provide the course ,resources and ideas.</mark>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" onClick={scrollToCourses}>
              Explore Courses
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={scrollToResources}>
              Browse Resources
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

