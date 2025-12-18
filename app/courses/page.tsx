import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Clock, BookOpen, Lock, CheckCircle, ArrowLeft } from "lucide-react"

export default async function CoursesPage() {
  const session = await auth()
  
  // @ts-ignore: isDeleted may not be in generated types, but exists in DB
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
    },
    include: {
      lessons: true,
      enrollments: session?.user ? {
        where: { userId: session.user.id },
      } : undefined,
    },
    orderBy: { createdAt: "desc" },
  }) as any[];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">All Courses</h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Master new skills with our comprehensive courses
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course: any) => {
            const isEnrolled = course.enrollments && course.enrollments.length > 0
            const enrollment = isEnrolled ? course.enrollments[0] : null

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
                      <Link href={`/courses/${course.id}/enroll`}>
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

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No courses available yet</h3>
            <p className="text-muted-foreground">Check back soon for new courses!</p>
          </div>
        )}
      </div>
    </div>
  )
}
