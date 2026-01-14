"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, ExternalLink, Eye, EyeOff, RefreshCw, Search, X } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

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
  downloadCount: number
  clickCount: number
}

interface ResourcePurchase {
  id: string
  resourceId: string
  status: string
}

export default function CheatSheetsPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [resourcePurchases, setResourcePurchases] = useState<ResourcePurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    fetchResources()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchResources, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval) // Cleanup on unmount
  }, [])

  const fetchResources = useCallback(async () => {
    try {
      setRefreshing(true)
      const [resourcesRes, purchasesRes] = await Promise.all([
        fetch("/api/resources?type=cheatsheet"),
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
  }, [])

  const hasAccess = useCallback((resourceId: string) => {
    return resourcePurchases.some(purchase =>
      purchase.resourceId === resourceId && purchase.status === "completed"
    )
  }, [resourcePurchases])

  const handleVisit = async (resource: Resource) => {
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
      // Track click/visit
      await fetch(`/api/resources/${resource.id}/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "click" }),
      })

      // Open the link in a new tab
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      toast.success("Opening link...")
    } catch (error) {
      console.error("Error:", error)
      // Still open the link even if tracking fails
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      toast.error("Failed to track visit, but opening link...")
    }
  }

  const handlePurchase = useCallback(async (resource: Resource) => {
    try {
      const response = await fetch("/api/resources/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resourceId: resource.id,
          amount: resource.price,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/portal/resources/payment-method/${data.purchase.id}`)
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to create purchase")
      }
    } catch (error) {
      console.error("Error creating purchase:", error)
      toast.error("Failed to create purchase")
    }
  }, [router])

  // Filter resources by search query
  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) return resources
    const query = searchQuery.toLowerCase()
    return resources.filter(r => 
      r.title.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query) ||
      r.category?.toLowerCase().includes(query) ||
      r.tags?.toLowerCase().includes(query)
    )
  }, [resources, searchQuery])

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading cheat sheets...</p>
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
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Cheat Sheets</h1>
            <p className="text-muted-foreground">Quick reference guides to accelerate your learning</p>
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
            placeholder="Search cheat sheets..."
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

      {filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? "No cheat sheets found" : "No cheat sheets available"}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery ? `No cheat sheets match "${searchQuery}"` : "Check back later for new resources"}
          </p>
          {searchQuery && (
            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{resource.title}</CardTitle>
                    {resource.description && (
                      <CardDescription className="line-clamp-2">
                        {resource.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge className="ml-2" variant="outline">
                    {resource.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ExternalLink className="h-4 w-4" />
                      {resource.clickCount} visits
                    </span>
                    {resource.isFree ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Free
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                        ¥{resource.price}
                      </Badge>
                    )}
                  </div>

                  <Button
                    onClick={() => (resource.isFree || hasAccess(resource.id)) ? handleVisit(resource) : handlePurchase(resource)}
                    className="w-full"
                    disabled={!resource.isActive}
                    variant={(resource.isFree || hasAccess(resource.id)) ? "default" : "secondary"}
                  >
                    {resource.isActive ? (
                      (resource.isFree || hasAccess(resource.id)) ? (
                        <>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open
                        </>
                      ) : (
                        <>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Purchase - ¥{resource.price}
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