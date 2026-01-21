"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Settings, Eye, EyeOff, RefreshCw, Clock, Search, X } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { PerformanceMonitor } from "@/lib/performance"
import { ResourceGridSkeleton } from "@/components/skeletons"
import { PurchaseModal } from "@/components/purchase-modal"

interface Resource {
  id: string
  title: string
  description?: string
  type: "cheatsheet" | "software" | "link"
  url?: string
  category?: string
  tags?: string
  isFree: boolean
  price?: number
  isActive: boolean
  clickCount: number
}

interface ResourcePurchase {
  id: string
  resourceId: string
  status: string
}

export default function SoftwaresPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [resourcePurchases, setResourcePurchases] = useState<ResourcePurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    fetchResources()

    // Remove polling - use manual refresh instead for better performance
    // Users can click refresh button if they need latest data
  }, [])

  const fetchResources = useCallback(async () => {
    const monitor = PerformanceMonitor.getInstance()
    const endTimer = monitor.startTimer('fetch-resources')

    try {
      setRefreshing(true)
      const [resourcesRes, purchasesRes] = await Promise.all([
        fetch("/api/resources?type=software&type=link"),
        fetch("/api/user/resource-purchases", {
          next: { revalidate: 60 } // Cache for 1 minute
        })
      ])

      if (resourcesRes.ok) {
        const data = await resourcesRes.json()
        setResources(data)
      }

      if (purchasesRes.ok) {
        const purchasesData = await purchasesRes.json()
        setResourcePurchases(purchasesData)
      }
    } catch (error) {
      console.error("Error fetching resources:", error)
      toast.error("Failed to fetch resources")
    } finally {
      setLoading(false)
      setRefreshing(false)
      endTimer()
    }
  }, [])

  const hasAccess = useCallback((resourceId: string) => {
    return resourcePurchases.some(purchase =>
      purchase.resourceId === resourceId && purchase.status === "completed"
    )
  }, [resourcePurchases])

  const handlePurchase = useCallback((resource: Resource) => {
    setSelectedResource(resource)
    setPurchaseModalOpen(true)
  }, [])

  const handleClick = useCallback(async (resource: Resource) => {
    // Use the url field for both direct links and Google Drive links
    const targetUrl = resource.url

    if (!targetUrl) {
      toast.error("No link available")
      return
    }

    // Check if resource is paid and user doesn't have access
    if (!resource.isFree && !hasAccess(resource.id)) {
      // Show PayPay payment instructions instead of redirecting
      toast.info(`Send ¥${resource.price} to PayPay ID: aatit`, {
        description: "Contact admin after payment for access approval",
        duration: 5000,
      })
      return
    }

    try {
      // Track click/visit (fire and forget for performance)
      fetch(`/api/resources/${resource.id}/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "click" }),
      }).catch(error => console.warn("Tracking failed:", error))

      // Open the link in a new tab
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      toast.success("Opening link...")
    } catch (error) {
      console.error("Error:", error)
      // Still open the link even if tracking fails
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      toast.error("Failed to track visit, but opening link...")
    }
  }, [hasAccess])

  // Memoize filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter(resource =>
      resource.type === "software" || resource.type === "link"
    )
  }, [resources])

  // Filter by search query
  const searchFilteredResources = useMemo(() => {
    if (!searchQuery.trim()) return filteredResources
    const query = searchQuery.toLowerCase()
    return filteredResources.filter(r => 
      r.title.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query) ||
      r.category?.toLowerCase().includes(query) ||
      r.tags?.toLowerCase().includes(query)
    )
  }, [filteredResources, searchQuery])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "software":
        return <Settings className="h-5 w-5" />
      case "link":
        return <ExternalLink className="h-5 w-5" />
      default:
        return <ExternalLink className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "software":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "link":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Software & Links</h1>
            <p className="text-muted-foreground">Essential tools and resources for your development journey</p>
          </div>
        </div>
        <ResourceGridSkeleton />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Software & Links</h1>
            <p className="text-muted-foreground">Essential tools and resources for your development journey</p>
          </div>
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Updating...
            </div>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search software & links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {searchFilteredResources.length === 0 ? (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? "No resources found" : "No resources available"}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery ? `No resources match "${searchQuery}"` : "Check back later for new tools and links"}
          </p>
          {searchQuery && (
            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {searchFilteredResources.map((resource) => (
            <Card key={resource.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 flex items-center gap-2">
                      {getTypeIcon(resource.type)}
                      {resource.title}
                    </CardTitle>
                    {resource.description && (
                      <CardDescription className="line-clamp-2">
                        {resource.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge className={`ml-2 ${getTypeColor(resource.type)}`}>
                    {resource.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ExternalLink className="h-4 w-4" />
                      {resource.clickCount} clicks
                    </span>
                    {resource.category && (
                      <Badge variant="outline">
                        {resource.category}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleClick(resource)}
                      className="flex-1"
                      disabled={!resource.isActive}
                      variant={resource.isFree || hasAccess(resource.id) ? "default" : "outline"}
                    >
                      {resource.isActive ? (
                        resource.isFree || hasAccess(resource.id) ? (
                          <>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Link
                          </>
                        ) : (
                          <>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Link
                          </>
                        )
                      ) : (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Unavailable
                        </>
                      )}
                    </Button>

                    {!resource.isFree && !hasAccess(resource.id) && resource.isActive && (
                      <Button
                        onClick={() => handlePurchase(resource)}
                        variant="default"
                        size="sm"
                      >
                        Purchase ¥{resource.price}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Purchase Modal */}
      <PurchaseModal
        open={purchaseModalOpen}
        onOpenChange={setPurchaseModalOpen}
        resource={selectedResource}
        userEmail={session?.user?.email || ""}
        onSuccess={fetchResources}
      />
    </div>
  )
}