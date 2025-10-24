"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Categories } from "@/components/categories"
import { FeaturedCourses } from "@/components/featured-courses"
import { Resources } from "@/components/resources"
import { Footer } from "@/components/footer"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div className="min-h-screen">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main>
        <Hero />
        <Categories selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        <FeaturedCourses searchQuery={searchQuery} selectedCategory={selectedCategory} />
        <Resources />
      </main>
      <Footer />
    </div>
  )
}

