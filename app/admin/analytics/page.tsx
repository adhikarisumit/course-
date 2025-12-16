"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, TrendingUp, Users, BookOpen, DollarSign, Award, Activity } from "lucide-react"
import { toast } from "sonner"

interface AnalyticsData {
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  enrollments: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  users: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
    byRole: { admin: number; student: number }
  }
  courses: {
    total: number
    published: number
    draft: number
    averagePrice: number
  }
  completion: {
    rate: number
    completed: number
    inProgress: number
    notStarted: number
  }
  topCourses: Array<{
    id: string
    title: string
    enrollments: number
    revenue: number
    completionRate: number
  }>
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        toast.error("Failed to load analytics")
      }
    } catch (error) {
      toast.error("Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Failed to load analytics data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
<div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Track platform performance and user engagement</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{analytics.revenue.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.revenue.growth >= 0 ? "+" : ""}
                  {analytics.revenue.growth.toFixed(1)}% from last month
                </p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  ¥{analytics.revenue.thisMonth.toLocaleString()} this month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.enrollments.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.enrollments.growth >= 0 ? "+" : ""}
                  {analytics.enrollments.growth.toFixed(1)}% from last month
                </p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Activity className="h-3 w-3 mr-1" />
                  {analytics.enrollments.thisMonth} this month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.users.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.users.growth >= 0 ? "+" : ""}
                  {analytics.users.growth.toFixed(1)}% from last month
                </p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" />
                  {analytics.users.thisMonth} new this month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.completion.rate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.completion.completed} completed courses
                </p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Activity className="h-3 w-3 mr-1" />
                  {analytics.completion.inProgress} in progress
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Course Statistics</CardTitle>
              <CardDescription>Overview of all courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold">{analytics.courses.total}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.courses.published}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Average Price</p>
                  <p className="text-2xl font-bold">¥{analytics.courses.averagePrice.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>User Breakdown</CardTitle>
              <CardDescription>Users by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Students</p>
                  <p className="text-2xl font-bold">{analytics.users.byRole.student}</p>
                  <p className="text-xs text-muted-foreground">
                    {((analytics.users.byRole.student / analytics.users.total) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold">{analytics.users.byRole.admin}</p>
                  <p className="text-xs text-muted-foreground">
                    {((analytics.users.byRole.admin / analytics.users.total) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>Courses ranked by enrollments and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.topCourses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No course data available</p>
              ) : (
                <div className="space-y-4">
                  {analytics.topCourses.map((course, index) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {course.enrollments} enrollment{course.enrollments !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">¥{course.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {course.completionRate.toFixed(1)}% completion
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completion Status</CardTitle>
              <CardDescription>Enrollment progress across all courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium">{analytics.completion.completed}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(analytics.completion.completed / analytics.enrollments.total) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">In Progress</span>
                    <span className="font-medium">{analytics.completion.inProgress}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(analytics.completion.inProgress / analytics.enrollments.total) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Not Started</span>
                    <span className="font-medium">{analytics.completion.notStarted}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-gray-400 h-2 rounded-full"
                      style={{
                        width: `${(analytics.completion.notStarted / analytics.enrollments.total) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New users this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.users.thisMonth}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {analytics.users.growth >= 0 ? "+" : ""}
                  {analytics.users.growth.toFixed(1)}% from last month ({analytics.users.lastMonth} users)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Enrollment</CardTitle>
                <CardDescription>Active learners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.users.byRole.student}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {((analytics.users.byRole.student / analytics.users.total) * 100).toFixed(1)}% of all users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg Enrollments</CardTitle>
                <CardDescription>Per student</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {analytics.users.byRole.student > 0
                    ? (analytics.enrollments.total / analytics.users.byRole.student).toFixed(1)
                    : "0"}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  courses per student
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>User activity and course completion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-sm font-bold">{analytics.completion.rate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${analytics.completion.rate}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3 pt-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {analytics.completion.completed}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {analytics.completion.inProgress}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">In Progress</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                      {analytics.completion.notStarted}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Not Started</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
