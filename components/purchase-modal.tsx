"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Send, Copy, Loader2, X } from "lucide-react"
import { toast } from "sonner"

interface PurchaseRequest {
  id: string
  status: string
  message?: string
  adminNote?: string
  createdAt: string
}

interface PurchaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resource: {
    id: string
    title: string
    description?: string
    price?: number
  } | null
  userEmail?: string
  onSuccess?: () => void
}

export function PurchaseModal({ open, onOpenChange, resource, userEmail, onSuccess }: PurchaseModalProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [existingRequests, setExistingRequests] = useState<PurchaseRequest[]>([])

  useEffect(() => {
    if (open && resource) {
      loadExistingRequests()
      setSubmitted(false)
      setMessage("")
    }
  }, [open, resource])

  const loadExistingRequests = async () => {
    if (!resource) return
    
    setLoading(true)
    try {
      const response = await fetch("/api/purchase-requests")
      if (response.ok) {
        const requests = await response.json()
        const filteredRequests = requests.filter(
          (r: any) => r.itemType === "resource" && r.itemId === resource.id
        )
        setExistingRequests(filteredRequests)
      }
    } catch (error) {
      console.error("Failed to load requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText("aatit")
    toast.success("PayPay ID copied!")
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
          itemId: resource.id,
          message: message || null,
        }),
      })

      if (response.ok) {
        const newRequest = await response.json()
        setExistingRequests([newRequest, ...existingRequests])
        setSubmitted(true)
        setMessage("")
        toast.success("Purchase request submitted!")
        onSuccess?.()
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

  if (!resource) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Purchase Resource</DialogTitle>
          <DialogDescription className="text-sm">
            Complete payment via PayPay to access this resource
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Item Info */}
            <div className="border rounded-lg p-3 space-y-2">
              <h3 className="font-semibold text-sm">{resource.title}</h3>
              {resource.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{resource.description}</p>
              )}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-xs text-muted-foreground">Price</span>
                <span className="text-lg font-bold text-primary">¥{resource.price?.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
              <h4 className="font-semibold text-xs">Payment Instructions:</h4>
              <ol className="space-y-1 text-xs">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Send <strong>¥{resource.price?.toLocaleString()}</strong> via PayPay to:</span>
                </li>
                <li className="ml-4">
                  <div className="flex items-center gap-1 bg-white dark:bg-gray-900 px-2 py-1 rounded border inline-flex">
                    <span className="font-mono font-semibold text-sm">aatit</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={copyToClipboard}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Include your email <strong>({userEmail})</strong> in the payment note</span>
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
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {existingRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-2 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        {getStatusBadge(request.status)}
                        <span className="text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {request.message && (
                        <p className="text-muted-foreground">Your message: {request.message}</p>
                      )}
                      {request.adminNote && (
                        <p className="bg-muted p-1 rounded">Admin note: {request.adminNote}</p>
                      )}
                      {request.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive w-full h-7 text-xs"
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

            {/* Submit Form */}
            {!submitted && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="message" className="text-xs">Payment Details / Message (Optional)</Label>
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

                <p className="text-xs text-center text-muted-foreground">
                  Access will be granted within 24 hours after payment verification
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
