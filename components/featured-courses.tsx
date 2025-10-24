"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Clock, BarChart } from "lucide-react"

const courses = [
  {
    title: "Complete Javascript Course",
    platform: "Youtube",
    url: "https://www.youtube.com/playlist?list=PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37",
    level: "Beginner to intermidiate",
    duration: "15 Days",
    category: "Programming",
    description: " Learn JavaScript from Zero to Hero",
  },
  {
    title: "Machine Learning A-Z",
    platform: "Coursera",
    url: "https://www.coursera.org",
    level: "Intermediate",
    duration: "44 hours",
    category: "Data Science",
    description: "Master Machine Learning algorithms with Python and R. Includes hands-on projects.",
  },
  {
    title: "UI/UX Design Fundamentals",
    platform: "Skillshare",
    url: "https://www.skillshare.com",
    level: "Beginner",
    duration: "12 hours",
    category: "Design",
    description: "Learn the principles of user interface and user experience design from scratch.",
  },
  {
    title: "Advanced React Patterns",
    platform: "Frontend Masters",
    url: "https://frontendmasters.com",
    level: "Advanced",
    duration: "8 hours",
    category: "Programming",
    description: "Deep dive into advanced React patterns, hooks, and performance optimization.",
  },
  {
    title: "Digital Marketing Masterclass",
    platform: "LinkedIn Learning",
    url: "https://www.linkedin.com/learning",
    level: "Intermediate",
    duration: "20 hours",
    category: "Business",
    description: "Complete guide to SEO, social media marketing, email campaigns, and analytics.",
  },
  {
    title: "Python for Data Analysis",
    platform: "DataCamp",
    url: "https://www.datacamp.com",
    level: "Intermediate",
    duration: "30 hours",
    category: "Data Science",
    description: "Learn to analyze and visualize data using Python, Pandas, and Matplotlib.",
  },
]

const levelColors = {
  Beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
}

interface FeaturedCoursesProps {
  searchQuery: string
  selectedCategory: string | null
}

export function FeaturedCourses({ searchQuery, selectedCategory }: FeaturedCoursesProps) {
  const filteredCourses = courses.filter((course) => {
    if (selectedCategory && course.category !== selectedCategory) {
      return false
    }

    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.category.toLowerCase().includes(query) ||
      course.platform.toLowerCase().includes(query) ||
      course.level.toLowerCase().includes(query)
    )
  })

  return (
    <section id="courses" className="py-16 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Courses</h2>
          <p className="text-muted-foreground text-lg">Hand-picked courses from top learning platforms</p>
          {(searchQuery || selectedCategory) && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
              {selectedCategory && ` in ${selectedCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          )}
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No courses found matching your search.</p>
            <p className="text-sm text-muted-foreground mt-2">Try different keywords or browse all courses.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.title} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="secondary">{course.category}</Badge>
                    <Badge className={levelColors[course.level as keyof typeof levelColors]}>{course.level}</Badge>
                  </div>
                  <h3 className="font-semibold text-lg leading-tight">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">{course.platform}</p>
                </CardHeader>

                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart className="h-4 w-4" />
                      <span>{course.level}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button className="w-full gap-2 bg-transparent" variant="outline" asChild>
                    <a href={course.url} target="_blank" rel="noopener noreferrer">
                      View Course
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
