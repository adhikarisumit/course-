import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Award, TrendingUp, User, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

import { SignOutButton } from "@/components/sign-out-button"
import ClientChatWithTeacherModalWrapper from "./client-chat-with-teacher-modal-wrapper"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          lessons: true,
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  })

  const stats = {
    totalCourses: enrollments.length,
    inProgress: enrollments.filter((e: any) => !e.completed).length,
    completed: enrollments.filter((e: any) => e.completed).length,
    totalHours: enrollments.reduce((acc: number, e: any) => {
      const hours = e.course.duration?.match(/\d+/)?.[0] || 0
      return acc + Number(hours)
    }, 0),
  }

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U"

  // Find the first admin user to chat with (for demo, real app may allow selection)
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header with Profile */}
        <div className="mb-6 md:mb-8 flex flex-col lg:flex-row items-start justify-between gap-4">
          <div className="w-full lg:flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {session.user.name}!</h1>
            <p className="text-sm md:text-base text-muted-foreground">Track your learning progress and continue your courses</p>
          </div>
          
          {/* Quick Actions Card */}
          <Card className="w-full lg:min-w-[280px] lg:max-w-[280px]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
                  <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{session.user.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{session.user.email}</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                {/* Chat with Teacher button for students */}
                {session.user.role === "student" && admin && (
                  <ClientChatWithTeacherModalWrapper
                    currentUserId={session.user.id}
                    teacherId={admin.id}
                    teacherName={admin.name || "Teacher"}
                  />
                )}
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/portal/profile">
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </Link>
                </Button>
                {session.user.role === "admin" && (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/admin/courses">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Courses
                    </Link>
                  </Button>
                )}
                <SignOutButton />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHours}h</div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Continue where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your learning journey by enrolling in a course
                </p>
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrollments.map((enrollment: any) => (
                  <Card key={enrollment.id} className="overflow-hidden">
                    {enrollment.course.image && (
                      <div className="relative h-40 w-full">
                        <Image
                          src={enrollment.course.image}
                          alt={enrollment.course.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {enrollment.course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} />
                        </div>
                        <div className="flex gap-2">
                          <Button asChild className="flex-1">
                            <Link href={`/courses/${enrollment.course.id}`}>
                              {enrollment.progress === 0 ? "Start Course" : "Continue"}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Resources Footer */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Learning Resources</CardTitle>
            <CardDescription>Additional tools and materials to enhance your learning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/cheat-sheets" className="flex flex-col items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Cheat Sheets</div>
                    <div className="text-xs text-muted-foreground">Quick reference guides</div>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/softwares" className="flex flex-col items-center gap-2">
                  <Settings className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Softwares & Links</div>
                    <div className="text-xs text-muted-foreground">Essential tools and resources</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
