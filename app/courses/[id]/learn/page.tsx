"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, ChevronLeft, ChevronRight, BookOpen, Lock, Loader2, Video, Calendar, ExternalLink, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { YouTubePlayer } from "@/components/youtube-player"

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
  const [unwrappedParams, setUnwrappedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    params.then(setUnwrappedParams)
  }, [params])

  useEffect(() => {
    if (!unwrappedParams?.id) return

    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${unwrappedParams.id}`)
        if (!response.ok) throw new Error("Failed to fetch course")
        const data = await response.json()
        setCourse(data)

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
  }, [unwrappedParams, searchParams])

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

  const handleNext = () => {
    if (!course || !currentLesson) return
    const currentIndex = course.lessons.findIndex((l) => l.id === currentLesson.id)
    if (currentIndex < course.lessons.length - 1) {
      const nextLesson = course.lessons[currentIndex + 1]
      setCurrentLesson(nextLesson)
      router.push(`/courses/${unwrappedParams?.id}/learn?lesson=${nextLesson.id}`)
    }
  }

  const handlePrevious = () => {
    if (!course || !currentLesson) return
    const currentIndex = course.lessons.findIndex((l) => l.id === currentLesson.id)
    if (currentIndex > 0) {
      const prevLesson = course.lessons[currentIndex - 1]
      setCurrentLesson(prevLesson)
      router.push(`/courses/${unwrappedParams?.id}/learn?lesson=${prevLesson.id}`)
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
    <div className="min-h-screen bg-background">
      {/* Back to Dashboard */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-2">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Link href="/portal/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
      {/* Top Navigation */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/courses/${unwrappedParams?.id}`}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Course
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="font-semibold">{course.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Lesson {currentIndex + 1} of {course.lessons.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Progress:</span>
                <span className="text-sm font-medium">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="w-32 hidden sm:block" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            {currentLesson.videoUrl && (
              <Card>
                <CardContent className="p-0">
                  <YouTubePlayer 
                    url={currentLesson.videoUrl} 
                    title={currentLesson.title}
                  />
                </CardContent>
              </Card>
            )}

            {/* Lesson Content */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{currentLesson.title}</CardTitle>
                    {currentLesson.duration && (
                      <CardDescription>{currentLesson.duration}</CardDescription>
                    )}
                  </div>
                  {currentLesson.isCompleted && (
                    <Badge className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentLesson.description && (
                  <p className="text-muted-foreground">{currentLesson.description}</p>
                )}
                <Separator />
                {currentLesson.content && (
                  <div
                    className="prose prose-gray dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Navigation and Actions */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Lesson
              </Button>

              <div className="flex items-center gap-2">
                {!currentLesson.isCompleted && (
                  <Button onClick={handleMarkComplete} disabled={marking}>
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
              </div>

              <Button
                onClick={handleNext}
                disabled={currentIndex === course.lessons.length - 1}
              >
                Next Lesson
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar - Lesson List */}
          <div className="lg:col-span-1 space-y-4">
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
                            setCurrentLesson(lesson)
                            router.push(`/courses/${unwrappedParams?.id}/learn?lesson=${lesson.id}`)
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
        </div>
      </div>
    </div>
  )
}
