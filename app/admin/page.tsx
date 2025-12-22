import { auth } from "@/auth"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Users, BarChart, UserCircle, Database, HardDrive, Table, Bell } from "lucide-react"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const revalidate = 60

export default async function AdminDashboard() {
  const session = await auth()

  // Fetch database statistics
  let dbStats = null
  let dbSize = 0
  let dbSizeMB = 0
  
  if (process.env.DATABASE_URL) {
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

      const [userCount, studentCount, courseCount, lessonCount, enrollmentCount, paymentCount, mentorCount] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "user" } }), // Only count actual students, not admins
        prisma.course.count(),
        prisma.lesson.count(),
        prisma.enrollment.count(),
        prisma.payment.count(),
        prisma.mentor.count(),
      ])

      dbStats = {
        tables: {
          users: userCount,
          students: studentCount,
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
  }

  // SQLite has no practical storage limit (281 TB theoretical max)
  // We'll show percentage based on 1 GB for monitoring purposes
  const monitoringLimitMB = 1024 // 1 GB monitoring threshold (not a hard limit)
  const usagePercentage = (dbSizeMB / monitoringLimitMB) * 100
  const remainingMB = monitoringLimitMB - dbSizeMB
  const isUnlimited = true // SQLite = Free forever, no storage limits

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
              <CardTitle>Resources</CardTitle>
              <HardDrive className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Manage cheat sheets, software, and links</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/resources">
              <Button className="w-full">Manage Resources</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notice Board</CardTitle>
              <Bell className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Manage student notices and announcements</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/notices">
              <Button className="w-full">Manage Notices</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-green-600">💎</span>
              Free Forever Services
            </CardTitle>
            <CardDescription>Your platform runs on 100% free infrastructure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div>
                  <p className="text-sm font-semibold">SQLite Database</p>
                  <p className="text-xs text-muted-foreground">Current: {dbSizeMB.toFixed(2)} MB</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-green-600">∞ UNLIMITED</p>
                  <p className="text-xs text-muted-foreground">Free Forever</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div>
                  <p className="text-sm font-semibold">NextAuth v5</p>
                  <p className="text-xs text-muted-foreground">Authentication</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-blue-600">✓ FREE</p>
                  <p className="text-xs text-muted-foreground">Open Source</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div>
                  <p className="text-sm font-semibold">UploadThing</p>
                  <p className="text-xs text-muted-foreground">File uploads (512MB/file)</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-purple-600">2 GB</p>
                  <p className="text-xs text-muted-foreground">Free Tier</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div>
                  <p className="text-sm font-semibold">Vercel Hosting</p>
                  <p className="text-xs text-muted-foreground">100 GB bandwidth/month</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-orange-600">✓ FREE</p>
                  <p className="text-xs text-muted-foreground">Hobby Tier</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <p className="text-2xl font-bold">{dbStats?.tables.students || 0}</p>
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
            <CardDescription>SQLite - Free Forever ✨ No Storage Limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Storage Space Monitor */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Current Usage</span>
                  </div>
                  <span className="text-xs font-semibold text-green-600">
                    ♾️ UNLIMITED
                  </span>
                </div>
                
                <Progress value={Math.min(usagePercentage, 100)} className="h-2" />
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-2 border border-green-200 dark:border-green-800">
                    <p className="text-xs text-muted-foreground">Current Size</p>
                    <p className="text-sm font-bold text-green-700 dark:text-green-400">{dbSizeMB.toFixed(2)} MB</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-muted-foreground">Storage Limit</p>
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-400">∞ Unlimited</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-2 border border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <p className="text-sm font-bold text-purple-700 dark:text-purple-400">FREE Forever</p>
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-400 text-center">
                    💎 SQLite: No storage costs, no limits (281 TB theoretical max)
                  </p>
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
