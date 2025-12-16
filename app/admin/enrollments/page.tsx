"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, UserPlus, Trash2, Users, BookOpen, TrendingUp, CheckCircle2, Clock, Eye, Calendar, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

interface Course {
  id: string
  title: string
}

interface Enrollment {
  id: string
  user: {
    name: string | null
    email: string
  }
  course: {
    title: string
    lessons: Array<{
      id: string
      title: string
      order: number
    }>
  }
  enrolledAt: string
  expiresAt: string | null
  progress: number
  completedLessons?: number
  totalLessons?: number
  lastAccessedAt?: string
}

export default function AdminEnrollmentsPage() {
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [lessonProgress, setLessonProgress] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterProgress, setFilterProgress] = useState("all")
  const [extendDialogOpen, setExtendDialogOpen] = useState(false)
  const [extendingId, setExtendingId] = useState<string | null>(null)
  const [monthsToExtend, setMonthsToExtend] = useState<number>(0)
  const [formData, setFormData] = useState({
    userEmail: "",
    courseId: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        fetch("/api/admin/courses"),
        fetch("/api/admin/enrollments?detailed=true"),
      ])

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData)
      }

      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json()
        setEnrollments(enrollmentsData)
      }
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const viewProgress = async (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment)
    try {
      const response = await fetch(`/api/admin/enrollments/${enrollment.id}/progress`)
      if (response.ok) {
        const data = await response.json()
        setLessonProgress(data.lessonProgress || [])
      }
    } catch (error) {
      toast.error("Failed to load progress details")
    }
  }

  const handleExtendValidity = async () => {
    if (!extendingId || monthsToExtend === 0) {
      toast.error("Please enter a valid number of months")
      return
    }

    try {
      const response = await fetch(`/api/admin/enrollments/${extendingId}/extend`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months: monthsToExtend }),
      })

      if (response.ok) {
        toast.success(monthsToExtend > 0 ? "Validity extended successfully" : "Validity decreased successfully")
        setExtendDialogOpen(false)
        setMonthsToExtend(0)
        setExtendingId(null)
        loadData()
      } else {
        toast.error("Failed to update validity")
      }
    } catch (error) {
      toast.error("Failed to update validity")
    }
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const getDaysRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null
    const days = Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterProgress === "all" ||
      (filterProgress === "completed" && enrollment.progress === 100) ||
      (filterProgress === "in-progress" && enrollment.progress > 0 && enrollment.progress < 100) ||
      (filterProgress === "not-started" && enrollment.progress === 0)

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: enrollments.length,
    completed: enrollments.filter((e) => e.progress === 100).length,
    inProgress: enrollments.filter((e) => e.progress > 0 && e.progress < 100).length,
    notStarted: enrollments.filter((e) => e.progress === 0).length,
    avgProgress: enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
      : 0,
  }

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.userEmail || !formData.courseId) {
      toast.error("Please fill in all fields")
      return
    }

    setEnrolling(true)
    try {
      const response = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to enroll user")
      }

      toast.success("User enrolled successfully!")
      setFormData({ userEmail: "", courseId: "" })
      loadData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setEnrolling(false)
    }
  }

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to remove this enrollment?")) return

    try {
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove enrollment")

      toast.success("Enrollment removed successfully!")
      loadData()
    } catch (error) {
      toast.error("Failed to remove enrollment")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Student Progress Tracking</h1>
          <p className="text-sm md:text-base text-muted-foreground">Monitor student learning progress and manage enrollments</p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              const response = await fetch("/api/admin/export?type=enrollments")
              const blob = await response.blob()
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `enrollments-export-${new Date().toISOString().split("T")[0]}.csv`
              document.body.appendChild(a)
              a.click()
              window.URL.revokeObjectURL(url)
              document.body.removeChild(a)
              toast.success("Enrollments exported successfully!")
            } catch (error) {
              toast.error("Failed to export enrollments")
            }
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{stats.completed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-500">{stats.inProgress}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-orange-500" />
              Not Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-500">{stats.notStarted}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Avg Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-500">{stats.avgProgress}%</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="mb-6">
        <TabsList>
          <TabsTrigger value="progress">Student Progress</TabsTrigger>
          <TabsTrigger value="enroll">Enroll Student</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by student name, email, or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterProgress} onValueChange={setFilterProgress}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by progress" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Student Progress List */}
          <Card>
            <CardHeader>
              <CardTitle>Student Progress Details</CardTitle>
              <CardDescription>
                Showing {filteredEnrollments.length} of {enrollments.length} students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredEnrollments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No students found</p>
              ) : (
                <div className="space-y-4">
                  {filteredEnrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold truncate">
                              {enrollment.user.name || enrollment.user.email}
                            </p>
                            {enrollment.progress === 100 && (
                              <Badge className="bg-green-500">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{enrollment.course.title}</p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-semibold">{enrollment.progress}%</span>
                            </div>
                            <Progress value={enrollment.progress} className="h-2" />
                            
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                              <span>
                                Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                              </span>
                              {enrollment.expiresAt && (
                                <span className={isExpired(enrollment.expiresAt) ? "text-red-500 font-semibold" : ""}>
                                  {isExpired(enrollment.expiresAt) ? (
                                    <>Expired: {new Date(enrollment.expiresAt).toLocaleDateString()}</>
                                  ) : (
                                    <>
                                      Expires: {new Date(enrollment.expiresAt).toLocaleDateString()}
                                      {getDaysRemaining(enrollment.expiresAt) !== null && (
                                        <Badge variant="outline" className="ml-2">
                                          {getDaysRemaining(enrollment.expiresAt)} days left
                                        </Badge>
                                      )}
                                    </>
                                  )}
                                </span>
                              )}
                              {enrollment.completedLessons !== undefined && (
                                <span>
                                  {enrollment.completedLessons}/{enrollment.totalLessons} lessons
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setExtendingId(enrollment.id)
                              setExtendDialogOpen(true)
                            }}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Extend
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewProgress(enrollment)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Student Progress Details</DialogTitle>
                                <DialogDescription>
                                  {enrollment.user.name || enrollment.user.email} - {enrollment.course.title}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <Card>
                                    <CardContent className="pt-6">
                                      <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
                                      <p className="text-3xl font-bold">{enrollment.progress}%</p>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardContent className="pt-6">
                                      <p className="text-sm text-muted-foreground mb-1">Lessons Completed</p>
                                      <p className="text-3xl font-bold">
                                        {enrollment.completedLessons || 0}/{enrollment.totalLessons || 0}
                                      </p>
                                    </CardContent>
                                  </Card>
                                </div>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-base">Lesson Progress</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    {lessonProgress.length === 0 ? (
                                      <p className="text-sm text-muted-foreground text-center py-4">
                                        Loading lesson progress...
                                      </p>
                                    ) : (
                                      <div className="space-y-3">
                                        {lessonProgress.map((lesson: any, index: number) => (
                                          <div key={lesson.id} className="flex items-center gap-3">
                                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                              lesson.completed
                                                ? 'bg-green-500 text-white'
                                                : 'bg-muted text-muted-foreground'
                                            }`}>
                                              {lesson.completed ? '✓' : index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium truncate">{lesson.title}</p>
                                              {lesson.completedAt && (
                                                <p className="text-xs text-muted-foreground">
                                                  Completed: {new Date(lesson.completedAt).toLocaleDateString()}
                                                </p>
                                              )}
                                            </div>
                                            {lesson.completed && (
                                              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveEnrollment(enrollment.id)}
                            className="text-destructive hover:text-destructive flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enroll">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Enroll User Form */}
            <Card>
              <CardHeader>
                <CardTitle>Enroll Student</CardTitle>
                <CardDescription>Add a student to a course manually</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEnroll} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Student Email *</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder="student@example.com"
                      value={formData.userEmail}
                      onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      The student must already have an account
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courseId">Course *</Label>
                    <Select
                      value={formData.courseId}
                      onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" disabled={enrolling} className="w-full">
                    {enrolling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Enroll Student
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Total Enrollments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{enrollments.length}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Total Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{courses.length}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Extend Validity Dialog */}
      <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend/Reduce Enrollment Validity</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="months" className="text-sm font-medium">
                Months to Add/Subtract
              </label>
              <Input
                id="months"
                type="number"
                placeholder="Enter number of months (positive to extend, negative to reduce)"
                value={monthsToExtend || ""}
                onChange={(e) => setMonthsToExtend(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Enter a positive number to extend (e.g., 3 for 3 months) or negative to reduce (e.g., -1 to subtract 1 month)
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMonthsToExtend(1)}
              >
                +1 Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMonthsToExtend(3)}
              >
                +3 Months
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMonthsToExtend(6)}
              >
                +6 Months
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMonthsToExtend(-1)}
              >
                -1 Month
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setExtendDialogOpen(false)
                setExtendingId(null)
                setMonthsToExtend(0)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleExtendValidity()}
              disabled={!monthsToExtend || monthsToExtend === 0}
            >
              Update Validity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
