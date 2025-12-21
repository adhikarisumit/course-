"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Settings, Eye, EyeOff, RefreshCw } from "lucide-react"
import { toast } from "sonner"

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
  const router = useRouter()

  useEffect(() => {
    fetchResources()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchResources, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval) // Cleanup on unmount
  }, [])

  const fetchResources = async () => {
    try {
      setRefreshing(true)
      const [resourcesRes, purchasesRes] = await Promise.all([
        fetch("/api/resources?type=software&type=link"),
        fetch("/api/user/resource-purchases")
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
    }
  }

  const handleClick = async (resource: Resource) => {
    if (!resource.url) return

    // Check if resource is paid and user doesn't have access
    if (!resource.isFree && !hasAccess(resource.id)) {
      toast.error("This is a paid resource. Please purchase it first.")
      return
    }

    try {
      // Track click
      await fetch(`/api/resources/${resource.id}/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "click" }),
      })

      // Open link in new tab
      window.open(resource.url, "_blank")

      toast.success("Opening link...")
    } catch (error) {
      console.error("Error tracking click:", error)
      // Still open the link even if tracking fails
      window.open(resource.url, "_blank")
    }
  }

  const hasAccess = (resourceId: string) => {
    return resourcePurchases.some(purchase => purchase.resourceId === resourceId)
  }

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
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading software and links...</p>
          </div>
        </div>
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

      {resources.length === 0 ? (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No resources available</h3>
          <p className="text-muted-foreground">Check back later for new tools and links</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
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

                  <Button
                    onClick={() => handleClick(resource)}
                    className="w-full"
                    disabled={!resource.isActive}
                    variant={resource.isFree || hasAccess(resource.id) ? "default" : "secondary"}
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
                          Purchase - ${resource.price}
                        </>
                      )
                    ) : (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Unavailable
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}