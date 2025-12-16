"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gray-900">
      {/* Programming keyboard background image - very visible */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-75"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1629654297299-c8506221ca97?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.0.3')`,
        }}
      ></div>
      
      {/* Dark overlay for both light and dark modes */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 via-gray-900/50 to-gray-900/70"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-gray-900/60"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance bg-gradient-to-br from-white to-gray-200 bg-clip-text text-transparent">
            Transform Your Career with Expert-Curated Learning
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-4 text-pretty">
            Access premium courses, comprehensive resources, and structured learning paths designed by educational experts. 
            Start your journey to success today.
          </p>
          <div className="mb-8 inline-block">
            <mark className="bg-yellow-300 dark:bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-medium text-sm md:text-base">
              ✨ We curate and guide—connecting you with the best learning resources worldwide
            </mark>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all cursor-pointer">
              <a href="/courses">
                Explore Courses
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white/80 hover:border-white text-black dark:text-white hover:text-white dark:hover:text-black hover:bg-white/10 dark:hover:bg-white transition-all cursor-pointer">
              <a href="#mentor">
                Meet Your Mentor
              </a>
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-1">50+</div>
              <div className="text-sm text-gray-400">Quality Courses</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-sm text-gray-400">Active Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">4.9/5</div>
              <div className="text-sm text-gray-400">Student Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

