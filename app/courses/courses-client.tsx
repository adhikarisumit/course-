"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { Clock, BookOpen, Lock, CheckCircle, Search, X } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string | null
  image: string | null
  category: string | null
  isPaid: boolean
  price: number | null
  duration: string | null
  lessons: any[]
  enrollments?: any[]
}

interface CoursesClientProps {
  courses: Course[]
  initialSearch: string
}

export function CoursesClient({ courses, initialSearch }: CoursesClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch)

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) {
      return courses
    }
    
    const query = searchQuery.toLowerCase().trim()
    return courses.filter((course) => {
      const titleMatch = course.title?.toLowerCase().includes(query)
      const descriptionMatch = course.description?.toLowerCase().includes(query)
      const categoryMatch = course.category?.toLowerCase().includes(query)
      return titleMatch || descriptionMatch || categoryMatch
    })
  }, [courses, searchQuery])

  // Get unique categories for filtering
  const categories = useMemo(() => {
    const cats = new Set<string>()
    courses.forEach((course) => {
      if (course.category) {
        cats.add(course.category)
      }
    })
    return Array.from(cats)
  }, [courses])

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">All Courses</h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Master new skills with our comprehensive courses
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search courses by title, description, or category..."
              className="pl-10 pr-10 h-12 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Category filters */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <Badge 
                variant={searchQuery === "" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/90"
                onClick={() => setSearchQuery("")}
              >
                All
              </Badge>
              {categories.map((category) => (
                <Badge 
                  key={category}
                  variant={searchQuery.toLowerCase() === category.toLowerCase() ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/90"
                  onClick={() => setSearchQuery(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          )}

          {/* Search results info */}
          {searchQuery && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} 
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          )}
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const isEnrolled = course.enrollments && course.enrollments.length > 0

            return (
              <Card key={course.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                {course.image && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                    {course.isPaid && !isEnrolled && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary">
                          ¥{course.price}
                        </Badge>
                      </div>
                    )}
                    {isEnrolled && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enrolled
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl line-clamp-2">{course.title}</CardTitle>
                  </div>
                  {course.category && (
                    <Badge variant="secondary" className="w-fit">
                      {course.category}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="flex-1">
                  <CardDescription className="line-clamp-3 mb-4">
                    {course.description}
                  </CardDescription>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.lessons.length} lessons</span>
                    </div>
                    {course.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  {isEnrolled ? (
                    <Button asChild className="w-full">
                      <Link href={`/courses/${course.id}`}>
                        Continue Learning
                      </Link>
                    </Button>
                  ) : course.isPaid ? (
                    <Button asChild className="w-full">
                      <Link href={`/courses/${course.id}`}>
                        <Lock className="h-4 w-4 mr-2" />
                        Enroll Now - ¥{course.price}
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href={`/courses/${course.id}`}>
                        Start Free Course
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            {searchQuery ? (
              <>
                <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">No courses match "{searchQuery}"</p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-2">No courses available yet</h3>
                <p className="text-muted-foreground">Check back soon for new courses!</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
