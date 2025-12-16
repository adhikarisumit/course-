import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen, Users, Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AdminCoursesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const courses = await prisma.course.findMany({
    include: {
      lessons: true,
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Manage Courses</h1>
              <p className="text-sm md:text-base text-muted-foreground">Create and manage your course content</p>
            </div>
            <Button asChild>
              <Link href="/admin/courses/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Link>
            </Button>
          </div>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first course</p>
              <Button asChild>
                <Link href="/admin/courses/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </div>
                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{course.lessons.length} lessons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{course._count.enrollments} students</span>
                      </div>
                    </div>

                    {/* Category and Price */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {course.category && <Badge variant="outline">{course.category}</Badge>}
                      {course.level && <Badge variant="outline">{course.level}</Badge>}
                      {course.isPaid ? (
                        <Badge variant="outline">
                          ¥{course.price}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Free</Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-2">
                      <Button asChild className="w-full" size="sm">
                        <Link href={`/admin/courses/${course.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Course
                        </Link>
                      </Button>
                      <div className="flex gap-2">
                        <Button asChild className="flex-1" size="sm" variant="outline">
                          <Link href={`/admin/courses/${course.id}/lessons`}>
                            Edit Lessons
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link href={`/courses/${course.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
