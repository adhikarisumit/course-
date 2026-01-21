import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// Cache analytics for 5 minutes to reduce database load
export async function GET(_request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super")) {
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
      allCourses,
      resourceStats,
      resourcePurchasesThisMonth,
      resourcePurchasesLastMonth,
      allResourcePurchases,
      topResources,
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

      // All courses for draft count
      prisma.course.findMany({
        select: { isPublished: true }
      }),

      // Resource statistics
      prisma.resource.aggregate({
        _count: { id: true },
        _sum: { downloadCount: true, clickCount: true },
        where: { isActive: true }
      }),

      // Resource purchases this month (only completed/approved)
      prisma.resourcePurchase.findMany({
        where: { 
          createdAt: { gte: firstDayThisMonth },
          status: "completed"
        },
        select: { amount: true }
      }),

      // Resource purchases last month (only completed/approved)
      prisma.resourcePurchase.findMany({
        where: {
          createdAt: { gte: firstDayLastMonth, lte: lastDayLastMonth },
          status: "completed"
        },
        select: { amount: true }
      }),

      // All resource purchases (only completed/approved)
      prisma.resourcePurchase.findMany({
        where: { status: "completed" },
        select: { amount: true, resourceId: true }
      }),

      // Top resources by purchases (only completed/approved)
      prisma.resource.findMany({
        where: { isFree: false, isActive: true },
        include: {
          _count: { 
            select: { 
              purchases: { where: { status: "completed" } } 
            } 
          },
          purchases: { 
            where: { status: "completed" },
            select: { amount: true } 
          }
        },
        orderBy: { purchases: { _count: 'desc' } },
        take: 5
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

    // Calculate resource revenue
    const resourceRevenueThisMonth = resourcePurchasesThisMonth.reduce((sum, p) => sum + (p.amount || 0), 0)
    const resourceRevenueLastMonth = resourcePurchasesLastMonth.reduce((sum, p) => sum + (p.amount || 0), 0)
    const totalResourceRevenue = allResourcePurchases.reduce((sum, p) => sum + (p.amount || 0), 0)

    // Format top resources
    const formattedTopResources = topResources.map(resource => ({
      id: resource.id,
      title: resource.title,
      type: resource.type,
      purchases: resource._count.purchases,
      revenue: resource.purchases.reduce((sum, p) => sum + (p.amount || 0), 0),
      price: resource.price || 0
    }))

    // Count draft courses
    const draftCourses = allCourses.filter(c => !c.isPublished).length
    const publishedCourses = allCourses.filter(c => c.isPublished).length

    // Calculate combined revenue (courses + resources)
    const combinedRevenueThisMonth = revenueThisMonth + resourceRevenueThisMonth
    const combinedRevenueLastMonth = revenueLastMonth + resourceRevenueLastMonth
    const totalCombinedRevenue = totalRevenueAmount + totalResourceRevenue

    const analytics = {
      enrollments: {
        thisMonth: enrollmentsThisMonth,
        lastMonth: enrollmentsLastMonth,
        total: totalEnrollments,
        growth: enrollmentsLastMonth > 0 ?
          ((enrollmentsThisMonth - enrollmentsLastMonth) / enrollmentsLastMonth * 100) : 0
      },
      revenue: {
        thisMonth: combinedRevenueThisMonth,
        lastMonth: combinedRevenueLastMonth,
        total: totalCombinedRevenue,
        growth: combinedRevenueLastMonth > 0 ?
          ((combinedRevenueThisMonth - combinedRevenueLastMonth) / combinedRevenueLastMonth * 100) : 0,
        // Breakdown
        courses: {
          thisMonth: revenueThisMonth,
          lastMonth: revenueLastMonth,
          total: totalRevenueAmount
        },
        resources: {
          thisMonth: resourceRevenueThisMonth,
          lastMonth: resourceRevenueLastMonth,
          total: totalResourceRevenue
        }
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
        total: allCourses.length,
        published: publishedCourses,
        draft: draftCourses,
        averagePrice: courseStats._avg.price || 0
      },
      resources: {
        active: resourceStats._count.id,
        totalDownloads: resourceStats._sum.downloadCount || 0,
        totalClicks: resourceStats._sum.clickCount || 0,
        totalPurchases: allResourcePurchases.length
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
      topCourses,
      topResources: formattedTopResources
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
