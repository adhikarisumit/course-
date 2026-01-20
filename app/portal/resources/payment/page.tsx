"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, Clock, Send, Loader2, Copy } from "lucide-react"
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

interface PurchaseRequest {
  id: string
  status: string
  message: string | null
  adminNote: string | null
  createdAt: string
}

export default function ResourcePaymentPage() {
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [existingRequests, setExistingRequests] = useState<PurchaseRequest[]>([])
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const resourceId = searchParams.get("id")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch resource
        const response = await fetch(`/api/resources/${resourceId}`)
        if (response.ok) {
          const data = await response.json()
          setResource(data)
        } else {
          toast.error("Resource not found")
          router.back()
          return
        }

        // Fetch existing purchase requests for this resource
        const requestsRes = await fetch("/api/purchase-requests")
        if (requestsRes.ok) {
          const requests = await requestsRes.json()
          const resourceRequests = requests.filter(
            (r: any) => r.itemType === "resource" && r.itemId === resourceId
          )
          setExistingRequests(resourceRequests)
        }
      } catch (error) {
        console.error("Error fetching resource:", error)
        toast.error("Failed to load resource")
        router.back()
      } finally {
        setLoading(false)
      }
    }

    if (resourceId) {
      fetchData()
    }
  }, [resourceId, router])

  const handleSubmitRequest = async () => {
    if (!resource) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/purchase-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "resource",
          itemId: resource.id,
          message: message || null,
        }),
      })

      if (response.ok) {
        const newRequest = await response.json()
        setExistingRequests([newRequest, ...existingRequests])
        setSubmitted(true)
        setMessage("")
        toast.success("Purchase request submitted successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to submit request")
      }
    } catch (error) {
      console.error("Purchase error:", error)
      toast.error("Failed to submit request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/purchase-requests/${requestId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setExistingRequests(existingRequests.filter((r) => r.id !== requestId))
        toast.success("Request canceled")
      } else {
        toast.error("Failed to cancel request")
      }
    } catch (error) {
      toast.error("Failed to cancel request")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
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

  const hasApprovedRequest = existingRequests.some((r) => r.status === "approved")

  // If approved, redirect to resources
  if (hasApprovedRequest) {
    router.push("/portal/resources")
    return null
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
              <CardTitle className="text-2xl">Request Access</CardTitle>
              <Badge variant={resource.isFree ? "secondary" : "default"}>
                {resource.isFree ? "Free" : `¥${resource.price?.toLocaleString()}`}
              </Badge>
            </div>
            <CardDescription>
              Submit a purchase request for admin approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
              {resource.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">{resource.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Type: {resource.type}</span>
                {resource.category && <span>• Category: {resource.category}</span>}
              </div>
            </div>

            {!resource.isFree && (
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">
                    ¥{resource.price?.toLocaleString()}
                  </span>
                </div>

                {/* Payment Instructions */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    💳 Payment Instructions
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      Please send the payment via <strong>PayPay</strong> to:
                    </p>
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 border">
                      <span className="font-mono text-lg font-bold text-primary">aatit</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={() => {
                          navigator.clipboard.writeText("aatit")
                          toast.success("PayPay ID copied!")
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400 mt-2">
                      <li>Open PayPay app</li>
                      <li>Search for ID: <strong>aatit</strong></li>
                      <li>Send ¥{resource.price?.toLocaleString()}</li>
                      <li>Enter PayPay transaction ID below</li>
                    </ol>
                  </div>
                </div>

                {/* Existing Requests */}
                {existingRequests.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Your Previous Requests:</h4>
                    <div className="space-y-2">
                      {existingRequests.map((request) => (
                        <div key={request.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            {getStatusBadge(request.status)}
                            <span className="text-xs text-muted-foreground">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {request.message && (
                            <p className="text-xs text-muted-foreground">
                              Your message: {request.message}
                            </p>
                          )}
                          {request.adminNote && (
                            <p className="text-xs bg-muted p-2 rounded">
                              Admin note: {request.adminNote}
                            </p>
                          )}
                          {request.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive w-full"
                              onClick={() => handleCancelRequest(request.id)}
                            >
                              Cancel Request
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {submitted && (
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-green-700 dark:text-green-300">Request Submitted!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your request has been sent to the admin for review.
                    </p>
                  </div>
                )}

                {/* Submit New Request Form */}
                {!submitted && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="message">Payment Details / Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Enter your PayPay transaction ID or any additional notes..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleSubmitRequest}
                      disabled={submitting}
                      className="w-full"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Purchase Request
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Your request will be reviewed within 24 hours. 30-day money-back guarantee.
                    </p>
                  </div>
                )}
              </div>
            )}

            {resource.isFree && (
              <div className="border-t pt-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  This resource is free! You can access it directly.
                </p>
                <Button
                  onClick={() => router.push("/portal/resources")}
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