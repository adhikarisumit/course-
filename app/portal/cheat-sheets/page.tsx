"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, EyeOff, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface Resource {
  id: string
  title: string
  description?: string
  type: "cheatsheet" | "software" | "link"
  fileUrl?: string
  category?: string
  tags?: string
  isFree: boolean
  price?: number
  isActive: boolean
  downloadCount: number
}

export default function CheatSheetsPage() {
  const [resources, setResources] = useState<Resource[]>([])
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
      const response = await fetch("/api/resources?type=cheatsheet")
      if (response.ok) {
        const data = await response.json()
        setResources(data)
      }
    } catch (error) {
      console.error("Error fetching resources:", error)
      toast.error("Failed to fetch resources")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleDownload = async (resource: Resource) => {
    if (!resource.fileUrl) return

    // Check if resource is paid
    if (!resource.isFree) {
      toast.error("This is a paid resource. Please purchase it first.")
      return
    }

    try {
      // Track download
      await fetch(`/api/resources/${resource.id}/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "download" }),
      })

      // Create download link
      const link = document.createElement("a")
      link.href = resource.fileUrl
      link.download = resource.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Download started!")
    } catch (error) {
      console.error("Error downloading:", error)
      toast.error("Failed to download")
    }
  }

  const handlePurchase = async (resource: Resource) => {
    router.push(`/portal/resources/${resource.id}`)
  }

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

      {resources.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No cheat sheets available</h3>
          <p className="text-muted-foreground">Check back later for new resources</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
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
                      <Download className="h-4 w-4" />
                      {resource.downloadCount} downloads
                    </span>
                    {resource.isFree ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Free
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                        ${resource.price}
                      </Badge>
                    )}
                  </div>

                  <Button
                    onClick={() => resource.isFree ? handleDownload(resource) : handlePurchase(resource)}
                    className="w-full"
                    disabled={!resource.isActive}
                    variant={resource.isFree ? "default" : "secondary"}
                  >
                    {resource.isActive ? (
                      resource.isFree ? (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
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