"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Send, ArrowLeft, Copy, ShoppingCart, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"

interface PurchaseRequest {
  id: string
  status: string
  message?: string
  adminNote?: string
  createdAt: string
}

export default function CheckoutPage({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [existingRequests, setExistingRequests] = useState<PurchaseRequest[]>([])

  const itemType = type === "course" ? "course" : "resource"
  const backUrl = type === "course" ? `/courses/${id}` : "/portal/dashboard"

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

        // Get item details
        const endpoint = type === "course" ? `/api/courses/${id}` : `/api/resources/${id}`
        const itemRes = await fetch(endpoint)
        const itemData = await itemRes.json()

        if (!itemData) {
          router.push(backUrl)
          return
        }

        // Check if already purchased/enrolled
        if (type === "course" && itemData.isEnrolled) {
          router.push(`/courses/${id}`)
          return
        }

        // If item is free, handle differently
        if (type === "course" && !itemData.isPaid) {
          const enrollRes = await fetch("/api/enrollments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseId: id }),
          })
          if (enrollRes.ok) {
            router.push(`/courses/${id}`)
            return
          }
        }

        if (type === "resource" && itemData.isFree) {
          router.push("/portal/dashboard")
          return
        }

        setItem(itemData)

        // Load existing purchase requests
        const requestsRes = await fetch("/api/purchase-requests")
        if (requestsRes.ok) {
          const requests = await requestsRes.json()
          const filteredRequests = requests.filter(
            (r: any) => r.itemType === itemType && r.itemId === id
          )
          setExistingRequests(filteredRequests)
        }
      } catch (error) {
        toast.error("Failed to load item")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, type, itemType, backUrl, router])

  const copyToClipboard = () => {
    navigator.clipboard.writeText("aatit")
    toast.success("PayPay ID copied!")
  }

  const handleSubmitRequest = async () => {
    if (!item) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/purchase-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType,
          itemId: id,
          message: message || null,
        }),
      })

      if (response.ok) {
        const newRequest = await response.json()
        setExistingRequests([newRequest, ...existingRequests])
        setSubmitted(true)
        setMessage("")
        toast.success("Purchase request submitted!")
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
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">Rejected</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!item || !session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href={backUrl}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Item Summary - Left Side */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-4">
                {item.image && (
                  <div className="relative h-32 w-full rounded-lg overflow-hidden mb-3">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h2 className="font-semibold text-lg mb-1">{item.title}</h2>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-xs text-muted-foreground capitalize">{itemType}</span>
                  <span className="text-xl font-bold text-primary">¥{item.price?.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form - Right Side */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShoppingCart className="h-4 w-4" />
                  Checkout
                </CardTitle>
                <CardDescription className="text-xs">
                  Complete your payment via PayPay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {/* Payment Instructions */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-2 space-y-1">
                  <h3 className="font-semibold text-xs">Payment Instructions:</h3>
                  <ol className="space-y-1 text-xs">
                    <li className="flex gap-2">
                      <span className="font-semibold">1.</span>
                      <span>Send <strong>¥{item.price?.toLocaleString()}</strong> via PayPay to:</span>
                    </li>
                    <li className="ml-4">
                      <div className="flex items-center gap-1 bg-white dark:bg-gray-900 px-2 py-1 rounded border inline-flex">
                        <span className="font-mono font-semibold text-xs">aatit</span>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={copyToClipboard}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">2.</span>
                      <span>Include email: <strong className="text-xs">{session?.user?.email}</strong></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">3.</span>
                      <span>Submit request below</span>
                    </li>
                  </ol>
                </div>

                {/* Existing Requests */}
                {existingRequests.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs">Previous Requests:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {existingRequests.map((request) => (
                        <div key={request.id} className="border rounded p-2 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            {getStatusBadge(request.status)}
                            <span className="text-muted-foreground">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {request.message && (
                            <p className="text-muted-foreground truncate">Your message: {request.message}</p>
                          )}
                          {request.adminNote && (
                            <p className="bg-muted p-1 rounded text-xs">Admin: {request.adminNote}</p>
                          )}
                          {request.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive w-full h-6 text-xs"
                              onClick={() => handleCancelRequest(request.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {submitted && (
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-2 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="font-semibold text-xs text-green-700 dark:text-green-300">Request Submitted!</p>
                    <p className="text-xs text-muted-foreground">We&apos;ll review your request shortly.</p>
                  </div>
                )}

                {/* Submit Form */}
                {!submitted && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="message" className="text-xs">Payment Details (optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="PayPay transaction ID..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={2}
                        className="text-xs"
                      />
                    </div>

                    <Button
                      className="w-full"
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
                          Submit Request - ¥{item.price?.toLocaleString()}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <p className="text-center text-[10px] text-muted-foreground">
                  Access granted within 24 hours • 30-day guarantee
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
