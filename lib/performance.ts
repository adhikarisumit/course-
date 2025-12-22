import { cache } from 'react'

// Cache frequently accessed data
export const getCachedResources = async (types: string[], category?: string, isFree?: boolean) => {
  const prisma = (await import('@/lib/prisma')).default

  const where: any = {
    isActive: true,
  }

  if (types.length > 0) {
    where.type = { in: types }
  }

  if (category) {
    where.category = { contains: category, mode: "insensitive" }
  }

  if (isFree !== undefined) {
    where.isFree = isFree
  }

  return await prisma.resource.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      url: true,
      fileUrl: true,
      category: true,
      tags: true,
      isFree: true,
      price: true,
      isActive: true,
      clickCount: true,
      createdAt: true,
    }
  })
}

// Performance monitoring utility
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTimer(label: string): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      if (!this.metrics.has(label)) {
        this.metrics.set(label, [])
      }
      this.metrics.get(label)!.push(duration)

      // Keep only last 100 measurements
      if (this.metrics.get(label)!.length > 100) {
        this.metrics.get(label)!.shift()
      }

      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`)
    }
  }

  getAverage(label: string): number {
    const measurements = this.metrics.get(label)
    if (!measurements || measurements.length === 0) return 0

    return measurements.reduce((sum, time) => sum + time, 0) / measurements.length
  }

  getMetrics(): Record<string, { average: number; count: number; last: number }> {
    const result: Record<string, { average: number; count: number; last: number }> = {}

    for (const [label, measurements] of this.metrics.entries()) {
      result[label] = {
        average: this.getAverage(label),
        count: measurements.length,
        last: measurements[measurements.length - 1] || 0
      }
    }

    return result
  }
}

// Database query optimization utilities
export const optimizedDbQueries = {
  // Get user purchases with minimal data
  getUserPurchases: cache(async (userId: string) => {
    const prisma = (await import('@/lib/prisma')).default
    return await prisma.resourcePurchase.findMany({
      where: {
        userId,
        status: 'completed'
      },
      select: {
        id: true,
        resourceId: true,
        status: true
      }
    })
  }),

  // Get resource analytics efficiently
  getResourceAnalytics: cache(async () => {
    const prisma = (await import('@/lib/prisma')).default

    const [totalResources, activeResources, freeResources, paidResources] = await Promise.all([
      prisma.resource.count(),
      prisma.resource.count({ where: { isActive: true } }),
      prisma.resource.count({ where: { isFree: true, isActive: true } }),
      prisma.resource.count({ where: { isFree: false, isActive: true } })
    ])

    return {
      total: totalResources,
      active: activeResources,
      free: freeResources,
      paid: paidResources
    }
  })
}