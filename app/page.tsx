"use client"

import { useState } from "react"
import dynamic from 'next/dynamic'
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Categories } from "@/components/categories"

const FeaturedCourses = dynamic(() => import('@/components/featured-courses').then(mod => ({ default: mod.FeaturedCourses })), { ssr: true })
const Resources = dynamic(() => import('@/components/resources').then(mod => ({ default: mod.Resources })), { ssr: true })
const Footer = dynamic(() => import('@/components/footer').then(mod => ({ default: mod.Footer })), { ssr: true })

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

