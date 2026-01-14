"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Copy, Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

export default function EnrollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState<any>(null)
  const [session, setSession] = useState<any>(null)

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
      } catch (error) {
        toast.error("Failed to load course")
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

  const sendEmail = (e: React.MouseEvent) => {
    e.preventDefault()
    
    const email = "sumitadhikari2341@gmail.com"
    const subject = `Course Enrollment - ${course.title}`
    const body = `Hi, I have sent payment via PayPay (ID: aatit) for the course "${course.title}".

My email: ${session.user.email}

Please activate my access. I have attached the payment receipt.`

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    try {
      window.open(mailtoLink)
      toast.success("Opening email client...")
    } catch (error) {
      // Fallback
      window.location.href = mailtoLink
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

            {/* Payment Card */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Enrollment</CardTitle>
                  <CardDescription>
                    Pay securely via PayPay
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Course Price</span>
                      <span className="text-2xl font-bold">¥{course.price}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="font-semibold">Total</span>
                      <span className="text-3xl font-bold text-primary">¥{course.price}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-4">
                    <h3 className="font-semibold text-lg">Payment Instructions:</h3>
                    <ol className="space-y-3 text-sm">
                      <li className="flex gap-2">
                        <span className="font-semibold">1.</span>
                        <span>Send <strong>¥{course.price}</strong> via PayPay to:</span>
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
                        <span>Include your email <strong>({session.user.email})</strong> and course name in the payment note</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold">3.</span>
                        <span>Send payment receipt to <strong>sumitadhikari2341@gmail.com</strong> with subject:</span>
                      </li>
                      <li className="ml-5">
                        <div className="bg-white dark:bg-gray-900 p-3 rounded border text-xs font-mono">
                          Course Enrollment - {course.title}
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold">4.</span>
                        <span>Include your payment receipt in the email</span>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm text-center">
                      <strong>Email Address:</strong> sumitadhikari2341@gmail.com
                    </p>
                  </div>

                  <div className="text-xs text-center text-muted-foreground space-y-1">
                    <p>Access will be granted within 24 hours after payment verification</p>
                    <p>30-day money-back guarantee</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
