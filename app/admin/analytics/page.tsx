"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, TrendingUp, Users, BookOpen, DollarSign, Award, Activity, FolderOpen, Download, MousePointerClick, Package } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface AnalyticsData {
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
    courses: {
      total: number
      thisMonth: number
      lastMonth: number
    }
    resources: {
      total: number
      thisMonth: number
      lastMonth: number
    }
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
  resources: {
    active: number
    totalDownloads: number
    totalClicks: number
    totalPurchases: number
  }
  completion: {
    rate: number
    completed: number
    inProgress: number
    notStarted: number
  }
  payments: {
    total: number
  }
  topCourses: Array<{
    id: string
    title: string
    enrollments: number
    revenue: number
    completionRate: number
  }>
  topResources: Array<{
    id: string
    title: string
    type: string
    purchases: number
    revenue: number
    price: number
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
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">¥{analytics.revenue.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.revenue.growth >= 0 ? "+" : ""}
                  {analytics.revenue.growth.toFixed(1)}% from last month
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <Badge variant="outline" className="text-xs">Courses: ¥{analytics.revenue.courses.total.toLocaleString()}</Badge>
                  <Badge variant="outline" className="text-xs">Resources: ¥{analytics.revenue.resources.total.toLocaleString()}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{analytics.enrollments.total}</div>
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

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{analytics.users.total}</div>
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

            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Resources</CardTitle>
                <FolderOpen className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{analytics.resources.active}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.resources.totalPurchases} purchases
                </p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Download className="h-3 w-3 mr-1" />
                  {analytics.resources.totalDownloads} downloads
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{analytics.revenue.thisMonth.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Courses: ¥{analytics.revenue.courses.thisMonth.toLocaleString()} | Resources: ¥{analytics.revenue.resources.thisMonth.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.courses.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.courses.published} published, {analytics.courses.draft} draft
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resource Clicks</CardTitle>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.resources.totalClicks}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total link clicks
                </p>
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

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Total Revenue Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Total Revenue Breakdown
                </CardTitle>
                <CardDescription>Combined revenue from courses and resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                      ¥{analytics.revenue.total.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">Total Revenue</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                      ¥{analytics.revenue.courses.total.toLocaleString()}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Course Revenue</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                      ¥{analytics.revenue.resources.total.toLocaleString()}
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Resource Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Revenue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Course Revenue
                </CardTitle>
                <CardDescription>Monthly course sales performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">This Month</span>
                  <span className="text-lg font-bold text-blue-600">¥{analytics.revenue.courses.thisMonth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Last Month</span>
                  <span className="text-lg font-bold">¥{analytics.revenue.courses.lastMonth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">All Time</span>
                  <span className="text-lg font-bold">¥{analytics.revenue.courses.total.toLocaleString()}</span>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Share of Total Revenue</span>
                    <span className="font-medium">
                      {analytics.revenue.total > 0 
                        ? ((analytics.revenue.courses.total / analytics.revenue.total) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${analytics.revenue.total > 0 
                          ? (analytics.revenue.courses.total / analytics.revenue.total) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Revenue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-purple-600" />
                  Resource Revenue
                </CardTitle>
                <CardDescription>Monthly resource sales performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">This Month</span>
                  <span className="text-lg font-bold text-purple-600">¥{analytics.revenue.resources.thisMonth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Last Month</span>
                  <span className="text-lg font-bold">¥{analytics.revenue.resources.lastMonth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">All Time</span>
                  <span className="text-lg font-bold">¥{analytics.revenue.resources.total.toLocaleString()}</span>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Share of Total Revenue</span>
                    <span className="font-medium">
                      {analytics.revenue.total > 0 
                        ? ((analytics.revenue.resources.total / analytics.revenue.total) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${analytics.revenue.total > 0 
                          ? (analytics.revenue.resources.total / analytics.revenue.total) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Comparison</CardTitle>
              <CardDescription>Revenue growth this month vs last month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">This Month</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Courses</span>
                      <span className="font-medium">¥{analytics.revenue.courses.thisMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Resources</span>
                      <span className="font-medium">¥{analytics.revenue.resources.thisMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-green-600">¥{analytics.revenue.thisMonth.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Last Month</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Courses</span>
                      <span className="font-medium">¥{analytics.revenue.courses.lastMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Resources</span>
                      <span className="font-medium">¥{analytics.revenue.resources.lastMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">¥{analytics.revenue.lastMonth.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Month-over-Month Growth</span>
                  <span className={`text-lg font-bold ${analytics.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics.revenue.growth >= 0 ? '+' : ''}{analytics.revenue.growth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          {/* Resource Metrics */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resource Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">¥{analytics.revenue.resources.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  ¥{analytics.revenue.resources.thisMonth.toLocaleString()} this month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{analytics.resources.totalPurchases}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Paid resource purchases
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                <Download className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analytics.resources.totalDownloads}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  File downloads
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                <MousePointerClick className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{analytics.resources.totalClicks}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Link clicks
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Resources</CardTitle>
              <CardDescription>Resources ranked by purchases and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.topResources.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No paid resource sales yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Resource revenue will appear here when users purchase paid resources</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.topResources.map((resource, index) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {resource.purchases} purchase{resource.purchases !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">¥{resource.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          ¥{resource.price.toLocaleString()} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resource Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Statistics</CardTitle>
              <CardDescription>Overview of all active resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{analytics.resources.active}</p>
                  <p className="text-sm text-muted-foreground">Active Resources</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{analytics.resources.totalPurchases}</p>
                  <p className="text-sm text-muted-foreground">Total Purchases</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{analytics.resources.totalDownloads}</p>
                  <p className="text-sm text-muted-foreground">Total Downloads</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">
                    {analytics.resources.totalPurchases > 0 
                      ? `¥${(analytics.revenue.resources.total / analytics.resources.totalPurchases).toFixed(0)}`
                      : '¥0'}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg. Purchase Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
