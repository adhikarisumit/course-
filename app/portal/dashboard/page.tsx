import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Award, TrendingUp, User, Settings, FileText, FolderOpen, ChevronRight, Play, GraduationCap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { SignOutButton } from "@/components/sign-out-button"
import ClientChatWithTeacherModalWrapper from "./client-chat-with-teacher-modal-wrapper"
import NoticeBoard from "@/components/notice-board"

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

  // Find the super admin user to chat with
  const admin = await prisma.user.findFirst({ where: { email: process.env.SUPER_ADMIN_EMAIL, role: "admin" } });

  // Get first name for greeting
  const firstName = session.user.name?.split(" ")[0] || "Student"

  // Get time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">{greeting}</p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Welcome back, {firstName}! 👋
              </h1>
              <p className="text-muted-foreground">
                Continue your learning journey where you left off
              </p>
            </div>
            <div className="flex items-center gap-3">
              {session.user.role === "student" && admin && (
                <ClientChatWithTeacherModalWrapper
                  currentUserId={session.user.id}
                  teacherId={admin.id}
                  teacherName={admin.name || "Teacher"}
                />
              )}
              <Button asChild variant="outline">
                <Link href="/courses">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Browse Courses
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Notice Board */}
        <div className="mb-8">
          <NoticeBoard />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Enrolled</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCourses}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">In Progress</p>
                  <p className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.inProgress}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Completed</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Hours</p>
                  <p className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.totalHours}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Courses */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Courses */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">My Courses</CardTitle>
                    <CardDescription>Continue learning where you left off</CardDescription>
                  </div>
                  {enrollments.length > 0 && (
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/courses" className="gap-1">
                        View all
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Start your learning journey by exploring our course catalog
                    </p>
                    <Button asChild size="lg">
                      <Link href="/courses">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Browse Courses
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrollments.slice(0, 4).map((enrollment: any) => (
                      <div
                        key={enrollment.id}
                        className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
                      >
                        {/* Course Image */}
                        <div className="relative w-full sm:w-40 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          {enrollment.course.image ? (
                            <Image
                              src={enrollment.course.image}
                              alt={enrollment.course.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <BookOpen className="h-8 w-8 text-primary/50" />
                            </div>
                          )}
                          {enrollment.progress > 0 && enrollment.progress < 100 && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-8 w-8 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Course Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                {enrollment.course.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {enrollment.course.description}
                              </p>
                            </div>
                            <Badge variant={enrollment.completed ? "default" : "secondary"} className="flex-shrink-0">
                              {enrollment.completed ? "Completed" : `${enrollment.progress}%`}
                            </Badge>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <Progress value={enrollment.progress} className="h-2" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{enrollment.course.lessons?.length || 0} lessons</span>
                              <span>{enrollment.course.duration || "Self-paced"}</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button asChild size="sm" variant={enrollment.progress === 0 ? "default" : "outline"} className="w-full sm:w-auto">
                            <Link href={`/courses/${enrollment.course.id}`}>
                              {enrollment.progress === 0 ? "Start Course" : enrollment.completed ? "Review" : "Continue"}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Access */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="ghost" className="w-full justify-start h-auto py-3">
                  <Link href="/portal/resources" className="gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">All Resources</div>
                      <div className="text-xs text-muted-foreground">Browse all materials</div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="ghost" className="w-full justify-start h-auto py-3">
                  <Link href="/portal/cheat-sheets" className="gap-3">
                    <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Cheat Sheets</div>
                      <div className="text-xs text-muted-foreground">Quick reference guides</div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="ghost" className="w-full justify-start h-auto py-3">
                  <Link href="/portal/softwares" className="gap-3">
                    <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Settings className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Software & Tools</div>
                      <div className="text-xs text-muted-foreground">Essential tools</div>
                    </div>
                  </Link>
                </Button>

                <Separator className="my-2" />

                <Button asChild variant="ghost" className="w-full justify-start h-auto py-3">
                  <Link href="/portal/profile" className="gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">My Profile</div>
                      <div className="text-xs text-muted-foreground">Account settings</div>
                    </div>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Profile Card */}
            <Card className="shadow-sm overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
              <CardContent className="pt-0 -mt-8">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 border-4 border-background shadow-md">
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
                    <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold mt-3">{session.user.name}</h3>
                  <p className="text-sm text-muted-foreground truncate max-w-full">{session.user.email}</p>
                  <Badge variant="secondary" className="mt-2 capitalize">{session.user.role}</Badge>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full" size="sm">
                    <Link href="/portal/profile">
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </Link>
                  </Button>
                  {session.user.role === "admin" && (
                    <Button asChild variant="outline" className="w-full" size="sm">
                      <Link href="/admin/courses">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </Button>
                  )}
                  <SignOutButton />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
