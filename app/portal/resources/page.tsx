"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, ExternalLink, Settings, Eye, EyeOff, RefreshCw, Package } from "lucide-react"
import { toast } from "sonner"
import { ResourceGridSkeleton } from "@/components/skeletons"

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

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [resourcePurchases, setResourcePurchases] = useState<ResourcePurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { data: session } = useSession()
  const router = useRouter()

  // Check for hash in URL to auto-select resource
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      // If hash matches a resource ID, we could scroll to it or highlight it
      // For now, just keep all tab selected
    }
  }, [])

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = useCallback(async () => {
    try {
      setRefreshing(true)
      const [resourcesRes, purchasesRes] = await Promise.all([
        fetch("/api/resources"),
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
    const targetUrl = resource.url

    if (!targetUrl) {
      toast.error("No link available")
      return
    }

    // Check if resource is paid and user doesn't have access
    if (!resource.isFree && !hasAccess(resource.id)) {
      toast.info(`Send ¥${resource.price} to PayPay ID: aatit`, {
        description: "Contact admin after payment for access approval",
        duration: 5000,
      })
      return
    }

    try {
      // Track click/visit
      fetch(`/api/resources/${resource.id}/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "click" }),
      }).catch(error => console.warn("Tracking failed:", error))

      // Open the link in a new tab
      window.open(targetUrl, '_blank', 'noopener,noreferrer')
      toast.success("Opening link...")
    } catch (error) {
      console.error("Error:", error)
      window.open(targetUrl, '_blank', 'noopener,noreferrer')
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

  // Filter resources by type
  const filteredResources = useMemo(() => {
    if (activeTab === "all") return resources
    if (activeTab === "cheatsheets") return resources.filter(r => r.type === "cheatsheet")
    if (activeTab === "software") return resources.filter(r => r.type === "software" || r.type === "link")
    return resources
  }, [resources, activeTab])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "cheatsheet":
        return <FileText className="h-5 w-5" />
      case "software":
        return <Settings className="h-5 w-5" />
      case "link":
        return <ExternalLink className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "cheatsheet":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "software":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "link":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "cheatsheet":
        return "Cheat Sheet"
      case "software":
        return "Software"
      case "link":
        return "Link"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Resources</h1>
          <p className="text-muted-foreground">All resources to accelerate your learning</p>
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
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Resources</h1>
            <p className="text-muted-foreground">All resources to accelerate your learning</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchResources}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="cheatsheets">Cheat Sheets</TabsTrigger>
          <TabsTrigger value="software">Software & Links</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No resources available</h3>
          <p className="text-muted-foreground">Check back later for new resources</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="overflow-hidden" id={resource.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(resource.type)}
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                    </div>
                    {resource.description && (
                      <CardDescription className="line-clamp-2">
                        {resource.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge className={getTypeColor(resource.type)}>
                    {getTypeBadge(resource.type)}
                  </Badge>
                  {resource.category && (
                    <Badge variant="outline">
                      {resource.category}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {resource.isFree ? (
                      <Badge variant="secondary">Free</Badge>
                    ) : (
                      <>
                        <Badge variant="default">¥{resource.price}</Badge>
                        {hasAccess(resource.id) && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            <Eye className="h-3 w-3 mr-1" />
                            Access Granted
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  {resource.isFree || hasAccess(resource.id) ? (
                    <Button size="sm" onClick={() => handleVisit(resource)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handlePurchase(resource)}>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Purchase
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
