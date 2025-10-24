"use client"

import { Code, Palette, TrendingUp, Brain, Globe, Database, FcIdea } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const categories = [
  {
    icon: Code,
    title: "Programming",
    count: "4 courses uploading more",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Palette,
    title: "Design",
    count: "uploading...",
    color: "text-pink-600 dark:text-pink-400",
  },
  {
    icon: TrendingUp,
    title: "Business",
    count: "uploading...",
    color: "text-green-600 dark:text-green-400",
  },
  {
    icon: Brain,
    title: "Data Science",
    count: "1 course uploading more",
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: Globe,
    title: "Languages",
    count: "uploading...",
    color: "text-orange-600 dark:text-orange-400",
  },
  {
    icon: Database,
    title: "Databases",
    count: "uploading...",
    color: "text-teal-600 dark:text-teal-400",
  },
]

interface CategoriesProps {
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

export function Categories({ selectedCategory, onSelectCategory }: CategoriesProps) {
  const handleCategoryClick = (categoryTitle: string) => {
    if (selectedCategory === categoryTitle) {
      onSelectCategory(null) // Deselect if clicking the same category
    } else {
      onSelectCategory(categoryTitle)
    }
    // Scroll to courses section
    const coursesSection = document.getElementById("courses")
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="py-16 md:py-24" id="categories">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by Category</h2>
          <p className="text-muted-foreground text-lg">Find courses and resources tailored to your learning goals</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Card
              key={category.title}
              onClick={() => handleCategoryClick(category.title)}
              className={`hover:shadow-lg transition-all cursor-pointer group ${
                selectedCategory === category.title ? "ring-2 ring-primary shadow-lg scale-105" : ""
              }`}
            >
              <CardContent className="p-6 text-center">
                <category.icon
                  className={`h-10 w-10 mx-auto mb-3 ${category.color} group-hover:scale-110 transition-transform`}
                />
                <h3 className="font-semibold mb-1">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {selectedCategory && (
          <div className="text-center mt-6">
            <button
              onClick={() => onSelectCategory(null)}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
