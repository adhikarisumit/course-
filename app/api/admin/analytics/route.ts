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
      paymentsThisMonth,
      paymentsLastMonth,
      totalLessonProgress,
      completedLessonProgress,
    ] = await Promise.all([
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

      // Payments this month
      prisma.payment.findMany({
        where: { createdAt: { gte: firstDayThisMonth } },
        select: { amount: true }
      }),

      // Payments last month
      prisma.payment.findMany({
        where: { createdAt: { gte: firstDayLastMonth, lte: lastDayLastMonth } },
        select: { amount: true }
      }),

      // Lesson progress stats
      prisma.lessonProgress.count(),
      prisma.lessonProgress.count({ where: { completed: true } }),
    ])

    // Calculate revenue from payments
    const revenueThisMonth = paymentsThisMonth.reduce((sum, p) => sum + (p.amount || 0), 0)
    const revenueLastMonth = paymentsLastMonth.reduce((sum, p) => sum + (p.amount || 0), 0)

    // Calculate resource revenue
    const resourceRevenueThisMonth = resourcePurchasesThisMonth.reduce((sum, p) => sum + (p.amount || 0), 0)
    const resourceRevenueLastMonth = resourcePurchasesLastMonth.reduce((sum, p) => sum + (p.amount || 0), 0)
    const totalResourceRevenue = allResourcePurchases.reduce((sum, p) => sum + (p.amount || 0), 0)

    // Format users by role
    const formattedUsersByRole = usersByRole.reduce((acc, curr) => {
      acc[curr.role] = curr._count.role
      return acc
    }, {} as Record<string, number>)

    // Get top courses by lesson count
    const topCoursesData = await prisma.course.findMany({
      take: 5,
      where: { isPublished: true },
      include: {
        _count: {
          select: { lessons: true }
        },
      },
      orderBy: {
        lessons: { _count: 'desc' }
      }
    })

    // Format top courses
    const topCourses = topCoursesData.map(course => ({
      id: course.id,
      title: course.title,
      lessons: course._count.lessons,
      revenue: 0,
      completionRate: 0
    }))

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

    // Calculate combined revenue (payments + resources)
    const combinedRevenueThisMonth = revenueThisMonth + resourceRevenueThisMonth
    const combinedRevenueLastMonth = revenueLastMonth + resourceRevenueLastMonth
    const totalCombinedRevenue = revenueThisMonth + revenueLastMonth + totalResourceRevenue

    const analytics = {
      enrollments: {
        thisMonth: 0,
        lastMonth: 0,
        total: 0,
        growth: 0
      },
      revenue: {
        thisMonth: combinedRevenueThisMonth,
        lastMonth: combinedRevenueLastMonth,
        total: totalCombinedRevenue,
        growth: combinedRevenueLastMonth > 0 ?
          ((combinedRevenueThisMonth - combinedRevenueLastMonth) / combinedRevenueLastMonth * 100) : 0,
        courses: {
          thisMonth: revenueThisMonth,
          lastMonth: revenueLastMonth,
          total: revenueThisMonth + revenueLastMonth
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
        rate: totalLessonProgress > 0 ?
          (completedLessonProgress / totalLessonProgress * 100) : 0,
        completed: completedLessonProgress,
        inProgress: totalLessonProgress - completedLessonProgress,
        notStarted: 0
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
