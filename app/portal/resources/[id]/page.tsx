"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, Copy, ArrowLeft, Clock, Send, Package } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface PurchaseRequest {
  id: string
  status: string
  message?: string
  adminNote?: string
  createdAt: string
}

export default function ResourcePurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [resource, setResource] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [existingRequests, setExistingRequests] = useState<PurchaseRequest[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get session
        const sessionRes = await fetch("/api/auth/session")
        const sessionData = await sessionRes.json()

        if (!sessionData?.user) {
          router.push("/auth/signin")
          return
        }

        setSession(sessionData)

        // Get resource
        const resourceRes = await fetch(`/api/resources/${id}`)
        const resourceData = await resourceRes.json()

        if (!resourceData) {
          router.push("/portal/dashboard")
          return
        }

        // If resource is free, redirect back
        if (resourceData.isFree) {
          router.push("/portal/dashboard")
          return
        }

        setResource(resourceData)

        // Load existing purchase requests for this resource
        const requestsRes = await fetch("/api/purchase-requests")
        if (requestsRes.ok) {
          const requests = await requestsRes.json()
          const resourceRequests = requests.filter(
            (r: any) => r.itemType === "resource" && r.itemId === id
          )
          setExistingRequests(resourceRequests)
        }
      } catch (error) {
        toast.error("Failed to load resource")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, router])

  const copyToClipboard = () => {
    navigator.clipboard.writeText("aatit")
    toast.success("PayPay ID copied to clipboard!")
  }

  const handleSubmitRequest = async () => {
    if (!resource) return
    
    setSubmitting(true)
    try {
      const response = await fetch("/api/purchase-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "resource",
          itemId: id,
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
      toast.error("Failed to submit request")
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
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading resource...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Resource not found</h3>
          <Link href="/portal/dashboard">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/portal/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{resource.title}</h1>
        <p className="text-muted-foreground">{resource.description}</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Complete Your Purchase
          </CardTitle>
          <CardDescription className="text-xs">
            Pay via PayPay and submit a request for access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {/* Price Display */}
          <div className="border rounded-lg p-2 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">Resource Price</span>
              <span className="text-lg font-bold">¥{resource.price?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t">
              <span className="font-semibold text-xs">Total</span>
              <span className="text-xl font-bold text-primary">¥{resource.price?.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-2 space-y-1">
            <h3 className="font-semibold text-xs">Payment Instructions:</h3>
            <ol className="space-y-1 text-xs">
              <li className="flex gap-2">
                <span className="font-semibold">1.</span>
                <span>Send <strong>¥{resource.price?.toLocaleString()}</strong> via PayPay to:</span>
              </li>
              <li className="ml-4">
                <div className="flex items-center gap-1 bg-white dark:bg-gray-900 px-2 py-1 rounded border inline-flex">
                  <span className="font-mono font-semibold text-xs">aatit</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">2.</span>
                <span>Include your email <strong>({session?.user?.email})</strong> in the payment note</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">3.</span>
                <span>Submit the request below with payment details</span>
              </li>
            </ol>
          </div>

          {/* Existing Requests */}
          {existingRequests.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-xs">Your Previous Requests:</h4>
              <div className="space-y-1">
                {existingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-2 space-y-1">
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
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <p className="font-semibold text-sm text-green-700 dark:text-green-300">Request Submitted!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your request has been sent to the admin for review.
              </p>
            </div>
          )}

          {/* Submit New Request Form */}
          {!submitted && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="message" className="text-sm">Payment Details / Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your PayPay transaction ID or any payment details..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>

              <Button
                className="w-full"
                size="default"
                onClick={handleSubmitRequest}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Purchase Request
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Footer Info */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>Access will be granted within 24 hours after payment verification</p>
            <p>30-day money-back guarantee</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}