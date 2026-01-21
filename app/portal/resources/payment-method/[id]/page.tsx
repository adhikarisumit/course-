"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CreditCard, CheckCircle, Clock, Copy, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Purchase {
  id: string
  resourceId: string
  amount: number
  currency: string
  status: string
  createdAt: string
  resource: {
    id: string
    title: string
    description?: string
    type: string
  }
}

interface PurchaseRequest {
  id: string
  status: string
  message?: string
  adminNote?: string
  createdAt: string
}

export default function PaymentMethodPage() {
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [existingRequests, setExistingRequests] = useState<PurchaseRequest[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [session, setSession] = useState<any>(null)
  const router = useRouter()
  const params = useParams()
  const purchaseId = params.id as string

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

        if (purchaseId) {
          // Fetch purchase
          const response = await fetch(`/api/resources/purchase/${purchaseId}`)
          if (response.ok) {
            const data = await response.json()
            setPurchase(data.purchase)

            // Load existing purchase requests for this resource
            const requestsRes = await fetch("/api/purchase-requests")
            if (requestsRes.ok) {
              const requests = await requestsRes.json()
              const resourceRequests = requests.filter(
                (r: any) => r.itemType === "resource" && r.itemId === data.purchase.resourceId
              )
              setExistingRequests(resourceRequests)
            }
          } else {
            console.error('Failed to fetch purchase')
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [purchaseId, router])

  const getBackPath = (resourceType?: string) => {
    switch (resourceType) {
      case 'cheatsheet':
        return '/portal/cheat-sheets'
      case 'software':
      case 'link':
        return '/portal/softwares'
      default:
        return '/portal/softwares'
    }
  }

  const handleBack = () => {
    if (purchase?.resource.type) {
      router.push(getBackPath(purchase.resource.type))
    } else {
      router.back()
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText("aatit")
    toast.success("PayPay ID copied to clipboard!")
  }

  const handleSubmitRequest = async () => {
    if (!purchase) return
    
    setSubmitting(true)
    try {
      const response = await fetch("/api/purchase-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "resource",
          itemId: purchase.resourceId,
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!purchase) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Purchase not found</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
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
          onClick={handleBack}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Complete Your Purchase
              </CardTitle>
            </div>
            <CardDescription>
              Pay via PayPay and submit a request for access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resource Info */}
            <div>
              <h3 className="text-lg font-semibold mb-2">{purchase.resource.title}</h3>
              {purchase.resource.description && (
                <p className="text-muted-foreground mb-4">{purchase.resource.description}</p>
              )}
            </div>

            {/* Price Display */}
            <div className="border rounded-lg p-4 md:p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Resource Price</span>
                <span className="text-2xl font-bold">¥{purchase.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-semibold">Total</span>
                <span className="text-3xl font-bold text-primary">¥{purchase.amount?.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-lg">Payment Instructions:</h3>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Send <strong>¥{purchase.amount?.toLocaleString()}</strong> via PayPay to:</span>
                </li>
                <li className="ml-5">
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-3 rounded border">
                    <span className="font-mono font-semibold">aatit</span>
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
                    placeholder="Enter your PayPay transaction ID or any payment details..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Purchase Request
                    </>
                  )}
                </Button>

                <div className="text-xs text-center text-muted-foreground space-y-1">
                  <p>Access will be granted within 24 hours after payment verification</p>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Purchase ID: {purchase.id}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}