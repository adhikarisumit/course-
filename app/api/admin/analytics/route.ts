import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// Cache analytics for 5 minutes to reduce database load
export async function GET(_request: NextRequest) {
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

    // Use Promise.all for parallel queries to improve performance
    const [
      enrollmentsThisMonth,
      enrollmentsLastMonth,
      totalEnrollments,
      enrollmentsWithCoursesThisMonth,
      enrollmentsWithCoursesLastMonth,
      allEnrollmentsWithCourses,
      usersThisMonth,
      usersLastMonth,
      totalUsers,
      usersByRole,
      courseStats,
      resourceStats,
      paymentStats,
      topCoursesData
    ] = await Promise.all([
      // Enrollment counts
      prisma.enrollment.count({
        where: { enrolledAt: { gte: firstDayThisMonth } }
      }),
      prisma.enrollment.count({
        where: {
          enrolledAt: { gte: firstDayLastMonth, lte: lastDayLastMonth }
        }
      }),
      prisma.enrollment.count(),

      // Revenue calculations using proper joins and aggregation
      prisma.enrollment.findMany({
        where: { enrolledAt: { gte: firstDayThisMonth } },
        include: { course: { select: { price: true } } }
      }),
      prisma.enrollment.findMany({
        where: {
          enrolledAt: { gte: firstDayLastMonth, lte: lastDayLastMonth }
        },
        include: { course: { select: { price: true } } }
      }),
      prisma.enrollment.findMany({
        include: { course: { select: { price: true } } }
      }),

      // User counts
      prisma.user.count({
        where: { createdAt: { gte: firstDayThisMonth } }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: firstDayLastMonth, lte: lastDayLastMonth }
        }
      }),
      prisma.user.count(),

      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),

      // Course statistics
      prisma.course.aggregate({
        where: { isPublished: true },
        _count: { id: true },
        _avg: { price: true }
      }),

      // Resource statistics
      prisma.resource.aggregate({
        _count: { id: true },
        where: { isActive: true }
      }),

      // Payment statistics
      prisma.payment.count(),

      // Top courses by enrollment
      prisma.course.findMany({
        take: 5,
        include: {
          _count: {
            select: { enrollments: true }
          },
          enrollments: {
            select: {
              course: { select: { price: true } }
            }
          }
        },
        orderBy: {
          enrollments: { _count: 'desc' }
        }
      })
    ])

    // Calculate revenue from enrollment data
    const revenueThisMonth = enrollmentsWithCoursesThisMonth.reduce((sum, enrollment) => sum + (enrollment.course?.price || 0), 0)
    const revenueLastMonth = enrollmentsWithCoursesLastMonth.reduce((sum, enrollment) => sum + (enrollment.course?.price || 0), 0)
    const totalRevenueAmount = allEnrollmentsWithCourses.reduce((sum, enrollment) => sum + (enrollment.course?.price || 0), 0)

    // Calculate completion stats efficiently
    const completionStats = await prisma.enrollment.aggregate({
      _count: {
        id: true,
      },
      where: { completed: true }
    })

    const inProgressStats = await prisma.enrollment.aggregate({
      _count: {
        id: true,
      },
      where: {
        completed: false,
        progress: { gt: 0 }
      }
    })

    // Format users by role
    const formattedUsersByRole = usersByRole.reduce((acc, curr) => {
      acc[curr.role] = curr._count.role
      return acc
    }, {} as Record<string, number>)

    // Format top courses
    const topCourses = topCoursesData.map(course => ({
      id: course.id,
      title: course.title,
      enrollments: course._count.enrollments,
      revenue: course.enrollments.reduce((sum, enrollment) => sum + (enrollment.course?.price || 0), 0),
      completionRate: 0 // TODO: Calculate completion rate
    }))

    const analytics = {
      enrollments: {
        thisMonth: enrollmentsThisMonth,
        lastMonth: enrollmentsLastMonth,
        total: totalEnrollments,
        growth: enrollmentsLastMonth > 0 ?
          ((enrollmentsThisMonth - enrollmentsLastMonth) / enrollmentsLastMonth * 100) : 0
      },
      revenue: {
        thisMonth: revenueThisMonth,
        lastMonth: revenueLastMonth,
        total: totalRevenueAmount,
        growth: revenueLastMonth > 0 ?
          ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100) : 0
      },
      users: {
        thisMonth: usersThisMonth,
        lastMonth: usersLastMonth,
        total: totalUsers,
        growth: usersLastMonth > 0 ?
          ((usersThisMonth - usersLastMonth) / usersLastMonth * 100) : 0,
        byRole: formattedUsersByRole
      },
      courses: {
        total: courseStats._count.id, // Assuming all courses are counted, not just published
        published: courseStats._count.id,
        draft: 0, // TODO: Add draft course count
        averagePrice: courseStats._avg.price || 0
      },
      resources: {
        active: resourceStats._count.id
      },
      completion: {
        rate: totalEnrollments > 0 ?
          (completionStats._count.id / totalEnrollments * 100) : 0,
        completed: completionStats._count.id,
        inProgress: inProgressStats._count.id,
        notStarted: totalEnrollments - completionStats._count.id - inProgressStats._count.id
      },
      payments: {
        total: paymentStats
      },
      topCourses
    }

    // Cache analytics for 2 minutes (analytics don't need to be real-time)
    const response = NextResponse.json(analytics)
    response.headers.set('Cache-Control', 'private, max-age=120')

    return response
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
