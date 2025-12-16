import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Calendar, Shield, Users, BookOpen, DollarSign, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import prisma from "@/lib/prisma"

export default async function AdminProfilePage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  // Fetch user details
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user || user.role !== "admin") {
    redirect("/portal/dashboard")
  }

  // Fetch admin statistics
  const [totalUsers, totalCourses, totalEnrollments, totalPayments] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.payment.count(),
  ])

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "A"

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Profile</h1>
        <p className="text-muted-foreground">Manage your administrator account and view platform overview</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.image || undefined} alt={user.name || "Admin"} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <Badge variant="default" className="mt-2">
                  <Shield className="mr-1 h-3 w-3" />
                  Administrator
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <Separator />

            <Button asChild className="w-full" variant="outline">
              <Link href="/admin">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Statistics and Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Platform Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>Key statistics and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalUsers}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total Users</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{totalCourses}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total Courses</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalEnrollments}</div>
                  <div className="text-sm text-muted-foreground mt-1">Enrollments</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{totalPayments}</div>
                  <div className="text-sm text-muted-foreground mt-1">Transactions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Access frequently used admin tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/admin/users">
                    <Users className="h-6 w-6" />
                    <span>Manage Users</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/admin/courses">
                    <BookOpen className="h-6 w-6" />
                    <span>Manage Courses</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/admin/enrollments">
                    <Activity className="h-6 w-6" />
                    <span>Enrollments</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/admin/settings">
                    <Shield className="h-6 w-6" />
                    <span>Settings</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin Access */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Administrator Access
              </CardTitle>
              <CardDescription>You have full access to all platform features and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">User Management</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Course Management</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Platform Settings</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Analytics Access</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
