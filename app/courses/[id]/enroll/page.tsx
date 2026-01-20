"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2, Clock, Send, ArrowLeft, BookOpen, Copy } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

export default function EnrollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [course, setCourse] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [existingRequests, setExistingRequests] = useState<any[]>([])
  const [submitted, setSubmitted] = useState(false)

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

        // Get course
        const courseRes = await fetch(`/api/courses/${id}`)
        const courseData = await courseRes.json()

        if (!courseData) {
          router.push("/courses")
          return
        }

        // Check if already enrolled
        if (courseData.isEnrolled) {
          router.push(`/courses/${id}`)
          return
        }

        // If course is free, auto-enroll
        if (!courseData.isPaid) {
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

        setCourse(courseData)

        // Load existing purchase requests for this course
        const requestsRes = await fetch("/api/purchase-requests")
        if (requestsRes.ok) {
          const requests = await requestsRes.json()
          const courseRequests = requests.filter(
            (r: any) => r.itemType === "course" && r.itemId === id
          )
          setExistingRequests(courseRequests)
        }
      } catch (error) {
        toast.error("Failed to load course")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, router])

  const handleSubmitRequest = async () => {
    setSubmitting(true)
    try {
      const response = await fetch("/api/purchase-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "course",
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!course || !session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Course Info */}
            <div>
              {course.image && (
                <div className="relative h-64 w-full rounded-lg overflow-hidden mb-6">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-muted-foreground mb-6">{course.description}</p>

              {(() => {
                let featuresArray = []
                
                try {
                  featuresArray = course.features ? JSON.parse(course.features) : []
                } catch {
                  featuresArray = []
                }
                
                // Replace placeholders in features
                if (featuresArray.length > 0) {
                  featuresArray = featuresArray.map((f: string) => 
                    f.replace(/\{lessons\}/g, course.lessons.length.toString())
                     .replace(/\{months\}/g, course.accessDurationMonths.toString())
                  )
                }
                
                // Only show section if there are features
                if (featuresArray.length === 0) {
                  return null
                }
                
                return (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">What&apos;s included:</h3>
                    <ul className="space-y-2">
                      {featuresArray.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })()}
            </div>

            {/* Purchase Request Card */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Complete Your Enrollment
                  </CardTitle>
                  <CardDescription>
                    Pay via PayPay and submit a request for access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price Display */}
                  <div className="border rounded-lg p-4 md:p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Course Price</span>
                      <span className="text-2xl font-bold">¥{course.price?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="font-semibold">Total</span>
                      <span className="text-3xl font-bold text-primary">¥{course.price?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-lg">Payment Instructions:</h3>
                    <ol className="space-y-3 text-sm">
                      <li className="flex gap-2">
                        <span className="font-semibold">1.</span>
                        <span>Send <strong>¥{course.price?.toLocaleString()}</strong> via PayPay to:</span>
                      </li>
                      <li className="ml-5">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-3 rounded border">
                          <span className="font-mono font-semibold">aatit</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText("aatit")
                              toast.success("PayPay ID copied!")
                            }}
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
                        <p>30-day money-back guarantee</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
