import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get current date info
    const now = new Date()
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get all enrollments with course data
    const allEnrollments = await prisma.enrollment.findMany({
      include: {
        course: true,
      },
    })

    // Get enrollments this month
    const enrollmentsThisMonth = await prisma.enrollment.count({
      where: {
        enrolledAt: {
          gte: firstDayThisMonth,
        },
      },
    })

    // Get enrollments last month
    const enrollmentsLastMonth = await prisma.enrollment.count({
      where: {
        enrolledAt: {
          gte: firstDayLastMonth,
          lte: lastDayLastMonth,
        },
      },
    })

    // Calculate revenue
    const revenueThisMonth = allEnrollments
      .filter((e) => new Date(e.enrolledAt) >= firstDayThisMonth)
      .reduce((sum, e) => sum + e.course.price, 0)

    const revenueLastMonth = allEnrollments
      .filter(
        (e) =>
          new Date(e.enrolledAt) >= firstDayLastMonth &&
          new Date(e.enrolledAt) <= lastDayLastMonth
      )
      .reduce((sum, e) => sum + e.course.price, 0)

    const totalRevenue = allEnrollments.reduce(
      (sum, e) => sum + e.course.price,
      0
    )

    // Get users
    const allUsers = await prisma.user.findMany()
    const usersThisMonth = allUsers.filter(
      (u) => new Date(u.createdAt) >= firstDayThisMonth
    ).length
    const usersLastMonth = allUsers.filter(
      (u) =>
        new Date(u.createdAt) >= firstDayLastMonth &&
        new Date(u.createdAt) <= lastDayLastMonth
    ).length

    const usersByRole = {
      admin: allUsers.filter((u) => u.role === "admin").length,
      student: allUsers.filter((u) => u.role === "student").length,
    }

    // Get courses
    const allCourses = await prisma.course.findMany({
      include: {
        lessons: true,
        enrollments: true,
      },
    })

    const publishedCourses = allCourses.filter(
      (c) => c.isPublished === true
    ).length
    const averagePrice =
      allCourses.length > 0
        ? allCourses.reduce((sum, c) => sum + c.price, 0) / allCourses.length
        : 0

    // Calculate completion stats based on enrollment.completed field
    const completedEnrollments = allEnrollments.filter(e => e.completed).length
    const inProgressEnrollments = allEnrollments.filter(e => !e.completed && e.progress > 0).length
    const notStartedEnrollments = allEnrollments.filter(e => e.progress === 0).length

    const completionRate =
      allEnrollments.length > 0
        ? (completedEnrollments / allEnrollments.length) * 100
        : 0

    // Top courses by enrollments
    const topCourses = allCourses
      .map((course) => {
        const enrollments = course.enrollments.length
        const revenue = enrollments * course.price
        
        // Calculate completion rate for this course
        const courseCompleted = course.enrollments.filter(e => e.completed).length
        const completionRate =
          enrollments > 0 ? (courseCompleted / enrollments) * 100 : 0

        return {
          id: course.id,
          title: course.title,
          enrollments,
          revenue,
          completionRate,
        }
      })
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5)

    // Calculate growth percentages
    const enrollmentGrowth =
      enrollmentsLastMonth > 0
        ? ((enrollmentsThisMonth - enrollmentsLastMonth) /
            enrollmentsLastMonth) *
          100
        : enrollmentsThisMonth > 0
        ? 100
        : 0

    const revenueGrowth =
      revenueLastMonth > 0
        ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
        : revenueThisMonth > 0
        ? 100
        : 0

    const userGrowth =
      usersLastMonth > 0
        ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100
        : usersThisMonth > 0
        ? 100
        : 0

    const analytics = {
      revenue: {
        total: totalRevenue,
        thisMonth: revenueThisMonth,
        lastMonth: revenueLastMonth,
        growth: revenueGrowth,
      },
      enrollments: {
        total: allEnrollments.length,
        thisMonth: enrollmentsThisMonth,
        lastMonth: enrollmentsLastMonth,
        growth: enrollmentGrowth,
      },
      users: {
        total: allUsers.length,
        thisMonth: usersThisMonth,
        lastMonth: usersLastMonth,
        growth: userGrowth,
        byRole: usersByRole,
      },
      courses: {
        total: allCourses.length,
        published: publishedCourses,
        draft: allCourses.length - publishedCourses,
        averagePrice,
      },
      completion: {
        rate: completionRate,
        completed: completedEnrollments,
        inProgress: inProgressEnrollments,
        notStarted: notStartedEnrollments,
      },
      topCourses,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
