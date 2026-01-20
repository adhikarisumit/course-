"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CheckCircle, ChevronLeft, ChevronRight, ChevronDown, BookOpen, Lock, Loader2, Video, Calendar, ExternalLink, FileText } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { YouTubePlayer } from "@/components/youtube-player"
import { HtmlContentRenderer } from "@/components/html-content-renderer"

interface Lesson {
  id: string
  title: string
  description: string | null
  content: string | null
  videoUrl: string | null
  duration: string | null
  order: number
  isFree: boolean
  isCompleted: boolean
}

interface Course {
  id: string
  title: string
  description: string | null
  isPaid: boolean
  isEnrolled: boolean
  progress: number
  lessons: Lesson[]
  courseType?: string
  meetingLink?: string | null
  meetingPlatform?: string | null
  scheduledStartTime?: string | null
  scheduledEndTime?: string | null
  isRecurring?: boolean
  recurringSchedule?: string | null
}

export default function LearnPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [course, setCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [mobileContentOpen, setMobileContentOpen] = useState(false)
  const [unwrappedParams, setUnwrappedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    params.then(setUnwrappedParams)
  }, [params])

  // Fetch course data only once when params are ready
  useEffect(() => {
    if (!unwrappedParams?.id) return

    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${unwrappedParams.id}`)
        if (!response.ok) throw new Error("Failed to fetch course")
        const data = await response.json()
        setCourse(data)

        // Set initial lesson based on URL or first lesson
        const lessonId = searchParams.get("lesson")
        const lesson = lessonId
          ? data.lessons.find((l: Lesson) => l.id === lessonId)
          : data.lessons[0]

        setCurrentLesson(lesson || null)
      } catch (error) {
        console.error("Error fetching course:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
    // Only depend on unwrappedParams, not searchParams to avoid refetching on every navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unwrappedParams])

  const handleMarkComplete = async () => {
    if (!currentLesson || !unwrappedParams?.id) return

    setMarking(true)
    try {
      const response = await fetch(`/api/lessons/${currentLesson.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: unwrappedParams.id }),
      })

      if (!response.ok) throw new Error("Failed to mark lesson complete")

      const data = await response.json()

      // Update local state
      setCourse((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          progress: data.enrollmentProgress,
          lessons: prev.lessons.map((l) =>
            l.id === currentLesson.id ? { ...l, isCompleted: true } : l
          ),
        }
      })

      setCurrentLesson((prev) => (prev ? { ...prev, isCompleted: true } : prev))
    } catch (error) {
      console.error("Error marking lesson complete:", error)
    } finally {
      setMarking(false)
    }
  }

  const navigateToLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson)
    // Use replace to update URL without adding history entry
    window.history.replaceState(null, '', `/courses/${unwrappedParams?.id}/learn?lesson=${lesson.id}`)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNext = () => {
    if (!course || !currentLesson) return
    const currentIndex = course.lessons.findIndex((l) => l.id === currentLesson.id)
    if (currentIndex < course.lessons.length - 1) {
      navigateToLesson(course.lessons[currentIndex + 1])
    }
  }

  const handlePrevious = () => {
    if (!course || !currentLesson) return
    const currentIndex = course.lessons.findIndex((l) => l.id === currentLesson.id)
    if (currentIndex > 0) {
      navigateToLesson(course.lessons[currentIndex - 1])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Course Not Found</CardTitle>
            <CardDescription>The course you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentIndex = course.lessons.findIndex((l) => l.id === currentLesson.id)
  const canAccess = !course.isPaid || course.isEnrolled || currentLesson.isFree

  if (!canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Content Locked
            </CardTitle>
            <CardDescription>You need to enroll in this course to access this lesson.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={`/courses/${unwrappedParams?.id}/enroll`}>Enroll Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background overflow-x-hidden">
      {/* Top Navigation */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button asChild variant="ghost" size="sm" className="shrink-0 h-8 px-2 sm:px-3">
                <Link href={`/courses/${unwrappedParams?.id}`}>
                  <ChevronLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Course</span>
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <div className="min-w-0">
                <h1 className="font-semibold text-sm sm:text-base truncate">{course.title}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Lesson {currentIndex + 1} of {course.lessons.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Progress:</span>
                <span className="text-sm font-medium">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="w-32 hidden sm:block" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Mobile Course Content - Collapsible */}
        <div className="lg:hidden mb-3">
          <Collapsible open={mobileContentOpen} onOpenChange={setMobileContentOpen}>
            <Card className="shadow-sm">
              <CollapsibleTrigger asChild>
                <button className="w-full text-left">
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {currentIndex + 1}/{course.lessons.length}
                        </span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <p className="font-medium text-xs truncate">{currentLesson.title}</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${mobileContentOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t">
                  <div className="max-h-[200px] overflow-y-auto">
                    {course.lessons.map((lesson, index) => {
                      const isActive = lesson.id === currentLesson.id
                      const canAccessLesson = !course.isPaid || course.isEnrolled || lesson.isFree

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            if (canAccessLesson) {
                              navigateToLesson(lesson)
                              setMobileContentOpen(false)
                            }
                          }}
                          disabled={!canAccessLesson}
                          className={`w-full text-left p-3 border-b hover:bg-accent/50 transition-colors ${
                            isActive ? "bg-accent" : ""
                          } ${!canAccessLesson ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex items-center justify-center h-5 w-5 rounded-full text-xs font-medium flex-shrink-0 ${
                                lesson.isCompleted
                                  ? "bg-green-500 text-white"
                                  : isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {lesson.isCompleted ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{lesson.title}</p>
                            </div>
                            {!canAccessLesson && <Lock className="h-3 w-3 flex-shrink-0" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 overflow-hidden">
          {/* Sidebar - Lesson List (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1 space-y-4">
            {/* Live Session Card */}
            {course.courseType === "live" && course.meetingLink && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-primary">
                    <Video className="h-4 w-4" />
                    Live Session
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {course.scheduledStartTime && (
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Next Session</span>
                      </div>
                      <p className="font-medium text-sm">
                        {new Date(course.scheduledStartTime).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                      {course.isRecurring && course.recurringSchedule && (
                        <p className="text-muted-foreground">
                          🔁 {course.recurringSchedule}
                        </p>
                      )}
                    </div>
                  )}
                  <Button asChild size="sm" className="w-full">
                    <a href={course.meetingLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-2" />
                      Join Session
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  {course.lessons.map((lesson, index) => {
                    const isActive = lesson.id === currentLesson.id
                    const canAccessLesson = !course.isPaid || course.isEnrolled || lesson.isFree

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          if (canAccessLesson) {
                            navigateToLesson(lesson)
                          }
                        }}
                        disabled={!canAccessLesson}
                        className={`w-full text-left p-4 border-b hover:bg-accent/50 transition-colors ${
                          isActive ? "bg-accent" : ""
                        } ${!canAccessLesson ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium flex-shrink-0 ${
                              lesson.isCompleted
                                ? "bg-green-500 text-white"
                                : isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {lesson.isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{lesson.title}</p>
                              {!canAccessLesson && <Lock className="h-3 w-3 flex-shrink-0" />}
                            </div>
                            {lesson.duration && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {lesson.duration}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6 min-w-0 overflow-hidden">
            {/* Video Player */}
            {currentLesson.videoUrl && (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <YouTubePlayer 
                    url={currentLesson.videoUrl} 
                    title={currentLesson.title}
                  />
                </CardContent>
              </Card>
            )}

            {/* Lesson Content */}
            <Card className="overflow-hidden">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2 break-words">{currentLesson.title}</CardTitle>
                    {currentLesson.duration && (
                      <CardDescription className="text-xs sm:text-sm">{currentLesson.duration}</CardDescription>
                    )}
                  </div>
                  {currentLesson.isCompleted && (
                    <Badge className="bg-green-500 shrink-0 w-fit text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4 overflow-hidden max-w-full">
                {currentLesson.description && (
                  <p className="text-sm sm:text-base text-muted-foreground break-words">{currentLesson.description}</p>
                )}
                <Separator />
                {currentLesson.content && (
                  <div className="lesson-content overflow-x-auto overflow-y-visible max-w-full w-full" style={{ maxWidth: '100%' }}>
                    <HtmlContentRenderer content={currentLesson.content} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation and Actions */}
            <div className="space-y-3">
              {/* Mark Complete Button */}
              {!currentLesson.isCompleted && (
                <Button onClick={handleMarkComplete} disabled={marking} size="sm" className="w-full">
                  {marking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </>
                  )}
                </Button>
              )}
              
              {/* Prev/Next Navigation */}
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>

                <span className="text-xs text-muted-foreground hidden sm:block">
                  {currentIndex + 1} / {course.lessons.length}
                </span>

                <Button
                  onClick={handleNext}
                  disabled={currentIndex === course.lessons.length - 1}
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
