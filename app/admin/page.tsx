import { auth } from "@/auth"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Users, Settings, BarChart, UserCircle, Database, HardDrive, Table } from "lucide-react"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await auth()

  // Fetch database statistics
  let dbStats = null
  let dbSize = 0
  let dbSizeMB = 0
  
  try {
    // Get database file size (only works in development with SQLite)
    if (process.env.NODE_ENV === 'development') {
      try {
        const fs = await import("fs/promises")
        const path = await import("path")
        const dbPath = path.join(process.cwd(), "prisma", "dev.db")
        const stats = await fs.stat(dbPath)
        dbSize = stats.size
        dbSizeMB = dbSize / (1024 * 1024)
      } catch (error) {
        console.log("Database file not found")
      }
    }

    const [userCount, courseCount, lessonCount, enrollmentCount, paymentCount, mentorCount] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.lesson.count(),
      prisma.enrollment.count(),
      prisma.payment.count(),
      // @ts-expect-error - Prisma types will be available after VS Code restart
      prisma.mentor.count(),
    ])

    dbStats = {
      tables: {
        users: userCount,
        courses: courseCount,
        lessons: lessonCount,
        enrollments: enrollmentCount,
        payments: paymentCount,
        mentors: mentorCount,
      },
      totalRecords: userCount + courseCount + lessonCount + enrollmentCount + paymentCount + mentorCount,
    }
  } catch (error) {
    console.error("Error fetching database stats:", error)
  }

  // Define limits (you can adjust these)
  const maxDbSizeMB = 100 // Maximum recommended database size in MB
  const usagePercentage = (dbSizeMB / maxDbSizeMB) * 100
  const remainingMB = maxDbSizeMB - dbSizeMB

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Welcome back, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Courses</CardTitle>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Manage your course content</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/courses">
              <Button className="w-full">Manage Courses</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Enrollments</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Manually enroll students</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/enrollments">
              <Button className="w-full">Manage Enrollments</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Users</CardTitle>
              <UserCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>View all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users">
              <Button className="w-full">View Users</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Analytics</CardTitle>
              <BarChart className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Track platform performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Settings</CardTitle>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Configure platform settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{dbStats?.tables.courses || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{dbStats?.tables.users || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Enrollments</p>
                <p className="text-2xl font-bold">{dbStats?.tables.enrollments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Database Monitor</CardTitle>
              <Database className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Track database usage and storage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Storage Space Monitor */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Storage Usage</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {usagePercentage.toFixed(1)}% used
                  </span>
                </div>
                
                <Progress value={usagePercentage} className="h-2" />
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Consumed</p>
                    <p className="text-sm font-bold text-primary">{dbSizeMB.toFixed(2)} MB</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Total Limit</p>
                    <p className="text-sm font-bold">{maxDbSizeMB} MB</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="text-sm font-bold text-green-600">{remainingMB.toFixed(2)} MB</p>
                  </div>
                </div>
              </div>

              {/* Records Count */}
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-2">
                  <Table className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Records</span>
                </div>
                <span className="text-xl font-bold">{dbStats?.totalRecords || 0}</span>
              </div>

              {/* Table Breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Table className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Users</p>
                    <p className="text-sm font-semibold">{dbStats?.tables.users || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Table className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Courses</p>
                    <p className="text-sm font-semibold">{dbStats?.tables.courses || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Table className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Lessons</p>
                    <p className="text-sm font-semibold">{dbStats?.tables.lessons || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Table className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Enrollments</p>
                    <p className="text-sm font-semibold">{dbStats?.tables.enrollments || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Table className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Payments</p>
                    <p className="text-sm font-semibold">{dbStats?.tables.payments || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Table className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Mentors</p>
                    <p className="text-sm font-semibold">{dbStats?.tables.mentors || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
