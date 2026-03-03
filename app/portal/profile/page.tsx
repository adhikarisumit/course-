import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Calendar, Shield, User as UserIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { ProfileEdit } from "@/components/profile-edit"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  // Fetch user details with payments (used as enrollments)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      payments: {
        include: {
          course: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!user) {
    redirect("/auth/signin")
  }

  const initials = user.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U"

  const completedPayments = user.payments.filter((p: any) => p.status === "completed" || p.status === "succeeded")
  const totalEnrollments = completedPayments.length
  const completedCourses = 0 // No completion tracking without Enrollment model
  const activeCourses = totalEnrollments - completedCourses

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information and view your learning progress</p>
        </div>
        <div className="flex gap-2">
          <ProfileEdit
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            }}
          />
        </div>
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
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  {user.name}
                  {user.profileVerified && (
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500" title="Verified">
                      <Check className="h-3 w-3 text-white stroke-3" />
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">
                    <Shield className="mr-1 h-3 w-3" />
                    {user.role}
                  </Badge>
                  {user.profileVerified && (
                    <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                      <span className="inline-flex items-center justify-center h-3 w-3 rounded-full bg-white mr-1">
                        <Check className="h-2 w-2 text-blue-500 stroke-3" />
                      </span>
                      Verified
                    </Badge>
                  )}
                </div>
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
              <Link href="/portal/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Statistics and Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Learning Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Statistics</CardTitle>
              <CardDescription>Your progress and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="text-3xl font-bold text-primary">{totalEnrollments}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total Courses</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-500/5">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{activeCourses}</div>
                  <div className="text-sm text-muted-foreground mt-1">In Progress</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/5">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{completedCourses}</div>
                  <div className="text-sm text-muted-foreground mt-1">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enrolled Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Courses</CardTitle>
              <CardDescription>Courses you are currently enrolled in</CardDescription>
            </CardHeader>
            <CardContent>
              {completedPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-4">You haven't enrolled in any courses yet.</p>
                  <Button asChild>
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedPayments.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{payment.course?.title || "Course"}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="text-sm text-muted-foreground">
                            Purchased: {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                          <Badge variant="default" className="bg-green-500">
                            Active
                          </Badge>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm" className="ml-4">
                        <Link href={`/courses/${payment.courseId}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          {user.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Your recent transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.payments.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <div className="font-medium">
                          ¥{payment.amount}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge
                        variant={
                          payment.status === "succeeded"
                            ? "default"
                            : payment.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
