"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, UserPlus, Trash2, Users, BookOpen, TrendingUp, CheckCircle2, Clock, Eye, Calendar, Download, FileText, CheckCircle, XCircle, Check, X, DollarSign, MessageSquare, Search } from "lucide-react"
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

interface PurchaseRequest {
  id: string
  userId: string
  itemType: string
  itemId: string
  itemTitle: string
  amount: number
  currency: string
  status: string
  message: string | null
  adminNote: string | null
  reviewedAt: string | null
  reviewedBy: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface RequestStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function AdminEnrollmentsPage() {
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<{ user: { name: string | null; email: string }; enrollments: Enrollment[] } | null>(null)
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)
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

  // Purchase requests state
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([])
  const [requestStats, setRequestStats] = useState<RequestStats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [requestSearchTerm, setRequestSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [adminNote, setAdminNote] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadData()
    loadPurchaseRequests()
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

  const loadPurchaseRequests = async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus !== "all") params.set("status", filterStatus)
      if (filterType !== "all") params.set("itemType", filterType)

      const response = await fetch(`/api/admin/purchase-requests?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPurchaseRequests(data.requests)
        setRequestStats(data.stats)
      }
    } catch (error) {
      toast.error("Failed to load purchase requests")
    }
  }

  useEffect(() => {
    loadPurchaseRequests()
  }, [filterStatus, filterType])

  const handleRequestAction = (request: PurchaseRequest, action: "approve" | "reject") => {
    setSelectedRequest(request)
    setActionType(action)
    setAdminNote("")
    setActionDialogOpen(true)
  }

  const processRequestAction = async () => {
    if (!selectedRequest || !actionType) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/purchase-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionType, adminNote }),
      })

      if (response.ok) {
        toast.success(`Request ${actionType === "approve" ? "approved" : "rejected"} successfully`)
        setActionDialogOpen(false)
        loadPurchaseRequests()
        loadData() // Refresh enrollments too
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to process request")
      }
    } catch (error) {
      toast.error("Failed to process request")
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteRequest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return

    try {
      const response = await fetch(`/api/admin/purchase-requests/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Request deleted successfully")
        loadPurchaseRequests()
      } else {
        toast.error("Failed to delete request")
      }
    } catch (error) {
      toast.error("Failed to delete request")
    }
  }

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredRequests = purchaseRequests.filter((request) => {
    const matchesSearch =
      request.user.name?.toLowerCase().includes(requestSearchTerm.toLowerCase()) ||
      request.user.email.toLowerCase().includes(requestSearchTerm.toLowerCase()) ||
      request.itemTitle.toLowerCase().includes(requestSearchTerm.toLowerCase())
    return matchesSearch
  })

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

  // Group enrollments by student email
  const groupedByStudent = filteredEnrollments.reduce((acc, enrollment) => {
    const email = enrollment.user.email
    if (!acc[email]) {
      acc[email] = {
        user: enrollment.user,
        enrollments: [],
        avgProgress: 0,
        totalCourses: 0,
        completedCourses: 0,
      }
    }
    acc[email].enrollments.push(enrollment)
    return acc
  }, {} as Record<string, { user: { name: string | null; email: string }; enrollments: Enrollment[]; avgProgress: number; totalCourses: number; completedCourses: number }>)

  // Calculate stats for each student
  Object.values(groupedByStudent).forEach(student => {
    student.totalCourses = student.enrollments.length
    student.completedCourses = student.enrollments.filter(e => e.progress === 100).length
    student.avgProgress = Math.round(
      student.enrollments.reduce((sum, e) => sum + e.progress, 0) / student.enrollments.length
    )
  })

  const studentsList = Object.values(groupedByStudent)

  // Get unique students by email
  const uniqueStudents = new Set(enrollments.map(e => e.user.email))
  const uniqueCompleted = new Set(enrollments.filter(e => e.progress === 100).map(e => e.user.email))
  const uniqueInProgress = new Set(enrollments.filter(e => e.progress > 0 && e.progress < 100).map(e => e.user.email))
  const uniqueNotStarted = new Set(enrollments.filter(e => e.progress === 0).map(e => e.user.email))

  const stats = {
    total: uniqueStudents.size,
    completed: uniqueCompleted.size,
    inProgress: uniqueInProgress.size,
    notStarted: uniqueNotStarted.size,
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
          <TabsTrigger value="requests" className="relative">
            Purchase Requests
            {requestStats.pending > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white text-[10px] px-1.5 py-0">{requestStats.pending}</Badge>
            )}
          </TabsTrigger>
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
                Showing {studentsList.length} of {new Set(enrollments.map(e => e.user.email)).size} students ({filteredEnrollments.length} enrollments)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentsList.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No students found</p>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {studentsList.map((student) => (
                    <Card
                      key={student.user.email}
                      className="hover:bg-accent/50 transition-colors"
                    >
                      <CardContent className="p-4 space-y-4">
                        {/* Header with name and badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-base truncate">
                              {student.user.name || student.user.email}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">{student.user.email}</p>
                          </div>
                          <Badge variant="outline" className="flex-shrink-0">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {student.totalCourses} {student.totalCourses === 1 ? "course" : "courses"}
                          </Badge>
                        </div>
                        
                        {/* Progress section */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Average Progress</span>
                            <span className="font-semibold">{student.avgProgress}%</span>
                          </div>
                          <Progress value={student.avgProgress} className="h-2" />
                        </div>
                        
                        {/* Info grid */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            {student.completedCourses} completed
                          </Badge>
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                            {student.totalCourses - student.completedCourses} in progress
                          </Badge>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedStudent(student)
                              setStudentDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Details Dialog */}
          <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Student Course Details</DialogTitle>
                <DialogDescription>
                  {selectedStudent?.user.name || selectedStudent?.user.email} - Enrolled in {selectedStudent?.enrollments.length} {selectedStudent?.enrollments.length === 1 ? "course" : "courses"}
                </DialogDescription>
              </DialogHeader>
              {selectedStudent && (
                <div className="space-y-4 mt-4">
                  {selectedStudent.enrollments.map((enrollment) => (
                    <Card key={enrollment.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold">{enrollment.course.title}</p>
                          </div>
                          {enrollment.progress === 100 ? (
                            <Badge className="bg-green-500 flex-shrink-0">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex-shrink-0">
                              {enrollment.progress}%
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Progress value={enrollment.progress} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="block text-muted-foreground/70">Enrolled:</span>
                            <span>{new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                          </div>
                          {enrollment.expiresAt && (
                            <div className={isExpired(enrollment.expiresAt) ? "text-red-500" : ""}>
                              <span className="block text-muted-foreground/70">
                                {isExpired(enrollment.expiresAt) ? "Expired:" : "Expires:"}
                              </span>
                              <span>{new Date(enrollment.expiresAt).toLocaleDateString()}</span>
                              {!isExpired(enrollment.expiresAt) && getDaysRemaining(enrollment.expiresAt) !== null && (
                                <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">
                                  {getDaysRemaining(enrollment.expiresAt)} days left
                                </Badge>
                              )}
                            </div>
                          )}
                          {enrollment.completedLessons !== undefined && (
                            <div>
                              <span className="block text-muted-foreground/70">Lessons:</span>
                              <span>{enrollment.completedLessons}/{enrollment.totalLessons}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewProgress(enrollment)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Lesson Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveEnrollment(enrollment.id)}
                            className="text-destructive hover:text-destructive ml-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Lesson Progress Dialog */}
          <Dialog open={!!selectedEnrollment} onOpenChange={(open) => !open && setSelectedEnrollment(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Lesson Progress</DialogTitle>
                <DialogDescription>
                  {selectedEnrollment?.user.name || selectedEnrollment?.user.email} - {selectedEnrollment?.course.title}
                </DialogDescription>
              </DialogHeader>
              {selectedEnrollment && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
                        <p className="text-3xl font-bold">{selectedEnrollment.progress}%</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-1">Lessons Completed</p>
                        <p className="text-3xl font-bold">
                          {selectedEnrollment.completedLessons || 0}/{selectedEnrollment.totalLessons || 0}
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
              )}
            </DialogContent>
          </Dialog>
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

        {/* Purchase Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name, email, or item..."
                    value={requestSearchTerm}
                    onChange={(e) => setRequestSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="course">Courses</SelectItem>
                    <SelectItem value="resource">Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Stats Row */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{requestStats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-500">{requestStats.pending}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-500 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-500">{requestStats.approved}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-500 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-500">{requestStats.rejected}</p>
              </CardContent>
            </Card>
          </div>

          {/* Requests List */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Requests</CardTitle>
              <CardDescription>
                Showing {filteredRequests.length} of {purchaseRequests.length} requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No requests found</p>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {filteredRequests.map((request) => (
                    <Card key={request.id} className="hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <p className="font-semibold truncate">
                                {request.user.name || request.user.email}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{request.user.email}</p>
                          </div>
                          {getRequestStatusBadge(request.status)}
                        </div>

                        {/* Item Info */}
                        <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                          <div className="flex-shrink-0 mt-0.5">
                            {request.itemType === "course" ? <BookOpen className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{request.itemTitle}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Badge variant="secondary" className="text-[10px]">
                                {request.itemType === "course" ? "Course" : "Resource"}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {request.amount.toLocaleString()} {request.currency.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Message if exists */}
                        {request.message && (
                          <div className="flex items-start gap-2 text-sm">
                            <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <p className="text-muted-foreground line-clamp-2">{request.message}</p>
                          </div>
                        )}

                        {/* Admin Note if exists */}
                        {request.adminNote && (
                          <div className="p-2 bg-muted rounded-md text-sm">
                            <p className="text-xs text-muted-foreground mb-1">Admin Note:</p>
                            <p className="line-clamp-2">{request.adminNote}</p>
                          </div>
                        )}

                        {/* Date */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t">
                          {request.status === "pending" ? (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => handleRequestAction(request, "approve")}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleRequestAction(request, "reject")}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          ) : (
                            <div className="flex-1 text-center text-sm text-muted-foreground">
                              {request.reviewedAt && (
                                <span>
                                  {request.status === "approved" ? "Approved" : "Rejected"} on{" "}
                                  {new Date(request.reviewedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive flex-shrink-0"
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog for Purchase Requests */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Request" : "Reject Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "This will grant the student access to the requested item."
                : "This will reject the student's purchase request."}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md space-y-2">
                <p className="text-sm">
                  <strong>Student:</strong> {selectedRequest.user.name || selectedRequest.user.email}
                </p>
                <p className="text-sm">
                  <strong>Item:</strong> {selectedRequest.itemTitle}
                </p>
                <p className="text-sm">
                  <strong>Type:</strong> {selectedRequest.itemType === "course" ? "Course" : "Resource"}
                </p>
                <p className="text-sm">
                  <strong>Amount:</strong> {selectedRequest.amount.toLocaleString()} {selectedRequest.currency.toUpperCase()}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNote">Note (Optional)</Label>
                <Textarea
                  id="adminNote"
                  placeholder="Add a note for this action..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={processRequestAction}
              disabled={processing}
              className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : actionType === "approve" ? (
                "Approve"
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
