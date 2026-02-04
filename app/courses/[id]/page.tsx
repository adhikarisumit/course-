import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import Image from "next/image"
import { BookOpen, Clock, Award, Lock, CheckCircle, Play, Video, Calendar, ExternalLink, FileText } from "lucide-react"
import { YouTubePlayer } from "@/components/youtube-player"
import { SidebarAd, InArticleAd, CourseAd } from "@/components/ads"

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  // @ts-ignore: isDeleted may not be in generated types, but exists in DB
  const course = await prisma.course.findFirst({
    where: {
      id,
    },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
      enrollments: session?.user ? {
        where: { userId: session.user.id },
      } : undefined,
    },
  }) as any;

  if (!course) {
    notFound()
  }

  let isEnrolled = course.enrollments && course.enrollments.length > 0
  let enrollment = isEnrolled ? course.enrollments[0] : null

  // Auto-enroll free courses
  if (!course.isPaid && !isEnrolled && session?.user) {
    try {
      await prisma.enrollment.create({
        data: {
          userId: session.user.id,
          courseId: course.id,
          enrolledAt: new Date(),
          expiresAt: new Date(Date.now() + (course.accessDurationMonths || 6) * 30 * 24 * 60 * 60 * 1000), // Approximate months to milliseconds
        },
      })
      // Re-fetch to get the new enrollment
      const updatedCourse = await prisma.course.findFirst({
        where: { id },
        include: {
          lessons: { orderBy: { order: "asc" } },
          enrollments: session?.user ? { where: { userId: session.user.id } } : undefined,
        },
      }) as any
      course.enrollments = updatedCourse.enrollments
      isEnrolled = updatedCourse.enrollments && updatedCourse.enrollments.length > 0
      enrollment = isEnrolled ? updatedCourse.enrollments[0] : null
    } catch (error) {
      // Enrollment might fail if already enrolled, ignore
    }
  }

  // If course is paid and user is not enrolled, redirect to enrollment page
  if (course.isPaid && !isEnrolled && session?.user) {
    redirect(`/courses/${course.id}/enroll`)
  }

  // If not logged in and course is paid, redirect to signin
  if (course.isPaid && !session?.user) {
    redirect("/auth/signin")
  }

  const lessonProgress = session?.user ? await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      lessonId: { in: course.lessons.map((l: any) => l.id) },
    },
  }) : []

  const completedLessons = lessonProgress.filter((p: any) => p.completed).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            {/* Course Video or Image */}
            {(course as any).videoUrl ? (
              <div className="mb-6">
                <YouTubePlayer 
                  url={(course as any).videoUrl} 
                  title={`${course.title} - Intro Video`}
                />
              </div>
            ) : course.image ? (
              <div className="relative h-64 lg:h-96 w-full rounded-lg overflow-hidden mb-6">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {course.category && (
                <Badge variant="secondary">{course.category}</Badge>
              )}
              {course.level && (
                <Badge variant="outline">{course.level}</Badge>
              )}
              {(course as any).courseType === "reading" && (
                <Badge variant="outline" className="gap-1">
                  <FileText className="h-3 w-3" />
                  Reading
                </Badge>
              )}
              {(course as any).courseType === "live" && (
                <Badge variant="outline" className="gap-1">
                  <Video className="h-3 w-3" />
                  Live
                </Badge>
              )}
              {isEnrolled && (
                <Badge className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enrolled
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-6">{course.description}</p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>{course.lessons.length} lessons</span>
              </div>
              {course.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{course.duration}</span>
                </div>
              )}
              {isEnrolled && (
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>{enrollment?.progress}% Complete</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Course Access</CardTitle>
                <CardDescription>
                  {course.isPaid ? `¥${course.price}` : "Free"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEnrolled && enrollment ? (
                  <>
                    {(course as any).courseType === "live" && (course as any).meetingLink ? (
                      <>
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2 text-primary font-semibold">
                            <Video className="h-5 w-5" />
                            <span>Live Session</span>
                          </div>
                          {(course as any).scheduledStartTime && (
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Scheduled Time</span>
                              </div>
                              <p className="font-medium">
                                {new Date((course as any).scheduledStartTime).toLocaleString('en-US', {
                                  dateStyle: 'full',
                                  timeStyle: 'short'
                                })}
                              </p>
                              {(course as any).scheduledEndTime && (
                                <p className="text-xs text-muted-foreground">
                                  to {new Date((course as any).scheduledEndTime).toLocaleString('en-US', {
                                    timeStyle: 'short'
                                  })}
                                </p>
                              )}
                              {(course as any).isRecurring && (course as any).recurringSchedule && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  🔁 {(course as any).recurringSchedule}
                                </p>
                              )}
                            </div>
                          )}
                          <Button asChild className="w-full" size="lg">
                            <a href={(course as any).meetingLink} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Join Live Session
                            </a>
                          </Button>
                          <p className="text-xs text-center text-muted-foreground">
                            Platform: {(course as any).meetingPlatform === 'google-meet' ? 'Google Meet' : (course as any).meetingPlatform === 'teams' ? 'Microsoft Teams' : (course as any).meetingPlatform?.charAt(0).toUpperCase() + (course as any).meetingPlatform?.slice(1)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-medium">{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} />
                          <p className="text-sm text-muted-foreground">
                            {completedLessons} of {course.lessons.length} lessons completed
                          </p>
                        </div>
                        <Button asChild className="w-full" size="lg">
                          <Link href={`/courses/${course.id}/learn`}>
                            <Play className="h-4 w-4 mr-2" />
                            Continue Learning
                          </Link>
                        </Button>
                      </>
                    )}
                  </>
                ) : course.isPaid ? (
                  <>
                    <div className="text-3xl font-bold text-center py-4">
                      ¥{course.price}
                    </div>
                    <Button asChild className="w-full" size="lg">
                      <Link href={session?.user ? `/courses/${course.id}/enroll` : "/auth/signin"}>
                        <Lock className="h-4 w-4 mr-2" />
                        Enroll Now
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild className="w-full" size="lg">
                    <Link href={session?.user ? `/courses/${course.id}/learn` : "/auth/signin"}>
                      Start Free Course
                    </Link>
                  </Button>
                )}

                <div className="pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">{(course as any).courseType || "recorded"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lessons</span>
                    <span className="font-medium">{course.lessons.length}</span>
                  </div>
                  {course.duration && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level</span>
                    <span className="font-medium capitalize">{course.level || "All levels"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Sidebar Ad */}
            <div className="mt-6">
              <SidebarAd />
            </div>
          </div>
        </div>

        {/* Course-Specific Ad before content */}
        <div className="my-6">
          <CourseAd adCode={(course as any).adCode} showAds={(course as any).showAds} />
        </div>

        {/* Course Content */}
        <Card>
          <Tabs defaultValue="curriculum">
            <CardHeader>
              <TabsList>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="curriculum" className="mt-0">
                <Accordion type="single" collapsible className="w-full">
                  {course.lessons.map((lesson: any, index: number) => {
                    const progress = lessonProgress.find((p: any) => p.lessonId === lesson.id)
                    const isCompleted = progress?.completed || false
                    const canAccess = !course.isPaid || isEnrolled || lesson.isFree

                    return (
                      <AccordionItem key={lesson.id} value={lesson.id}>
                        <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
                          <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 text-left">
                            <div className="flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 text-primary font-medium text-xs sm:text-sm shrink-0 mt-0.5 sm:mt-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                <span className="font-medium text-sm sm:text-base break-words">{lesson.title}</span>
                                {lesson.isFree && (
                                  <Badge variant="outline" className="text-[10px] sm:text-xs">Free</Badge>
                                )}
                                {!canAccess && (
                                  <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                                )}
                                {isCompleted && (
                                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 shrink-0" />
                                )}
                              </div>
                              {lesson.duration && (
                                <span className="text-xs sm:text-sm text-muted-foreground mt-1 block sm:hidden">{lesson.duration}</span>
                              )}
                            </div>
                            {lesson.duration && (
                              <span className="text-sm text-muted-foreground hidden sm:block shrink-0">{lesson.duration}</span>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-8 sm:pl-11 space-y-2">
                            <p className="text-sm sm:text-base text-muted-foreground">{lesson.description}</p>
                            {canAccess && (
                              <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                                <Link href={`/courses/${course.id}/learn?lesson=${lesson.id}`}>
                                  {isCompleted ? "Review Lesson" : "Start Lesson"}
                                </Link>
                              </Button>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </TabsContent>
              
              <TabsContent value="overview" className="mt-0">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <h3>About This Course</h3>
                  <p>{course.description}</p>
                  
                  {(() => {
                    const learningPoints = (course as any).whatYouWillLearn
                    if (!learningPoints) return null
                    
                    try {
                      const points = JSON.parse(learningPoints)
                      if (!Array.isArray(points) || points.length === 0) return null
                      
                      return (
                        <>
                          <h3>What You&apos;ll Learn</h3>
                          <ol className="list-decimal list-inside space-y-1">
                            {points.map((point: string, index: number) => (
                              <li key={index}>{point}</li>
                            ))}
                          </ol>
                        </>
                      )
                    } catch {
                      return null
                    }
                  })()}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
