"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface Resource {
  id: string
  title: string
  description?: string
  type: string
  category?: string
  isFree: boolean
  price?: number
}

export default function ResourcePaymentPage() {
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const resourceId = searchParams.get("id")

  useEffect(() => {
    if (resourceId) {
      fetchResource()
    }
  }, [resourceId])

  const fetchResource = async () => {
    try {
      const response = await fetch(`/api/resources/${resourceId}`)
      if (response.ok) {
        const data = await response.json()
        setResource(data)
      } else {
        toast.error("Resource not found")
        router.back()
      }
    } catch (error) {
      console.error("Error fetching resource:", error)
      toast.error("Failed to load resource")
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!resource) return

    setProcessing(true)
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
        toast.success("Purchase request submitted!")
        // Redirect to payment method page
        router.push(data.redirectTo)
      } else {
        const error = await response.json()
        toast.error(error.message || "Purchase failed")
      }
    } catch (error) {
      console.error("Purchase error:", error)
      toast.error("Purchase failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Resource not found</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Purchase Resource</CardTitle>
              <Badge variant={resource.isFree ? "secondary" : "default"}>
                {resource.isFree ? "Free" : `¥${resource.price}`}
              </Badge>
            </div>
            <CardDescription>
              Complete your purchase to access this resource
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
              {resource.description && (
                <p className="text-gray-600 mb-4">{resource.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Type: {resource.type}</span>
                {resource.category && <span>• Category: {resource.category}</span>}
              </div>
            </div>

            {!resource.isFree && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ¥{resource.price}
                  </span>
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={processing}
                  className="w-full"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Complete Purchase
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  Secure payment processing • Instant access after purchase
                </p>
              </div>
            )}

            {resource.isFree && (
              <div className="border-t pt-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">
                  This resource is free! You can access it directly.
                </p>
                <Button
                  onClick={() => router.push("/portal/softwares")}
                  className="mt-4"
                >
                  Go to Resources
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}