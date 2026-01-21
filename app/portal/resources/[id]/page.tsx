"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Copy, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ResourcePurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [resource, setResource] = useState<any>(null)
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

  const sendEmail = (e: React.MouseEvent) => {
    e.preventDefault()

    const email = "proteclink.com@gmail.com"
    const subject = `Resource Purchase - ${resource.title}`
    const body = `Hi, I have sent payment via PayPay (ID: aatit) for the resource "${resource.title}".

My email: ${session.user.email}

Please activate my access. I have attached the payment receipt.

Resource Details:
- Title: ${resource.title}
- Price: ¥${resource.price}
- Type: ${resource.type}`

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
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Purchase Resource</h1>
        <p className="text-muted-foreground">Complete your purchase to access this premium resource</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {resource.title}
            <span className="text-lg font-normal text-muted-foreground">
              - ¥{resource.price}
            </span>
          </CardTitle>
          <CardDescription>{resource.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Payment Instructions</h3>
            <div className="space-y-2 text-sm">
              <p>1. Send payment of <strong>¥{resource.price}</strong> via PayPay</p>
              <p>2. Use PayPay ID: <code className="bg-background px-2 py-1 rounded">aatit</code></p>
              <p>3. Send confirmation email with payment receipt</p>
              <p>4. Access will be activated within 24 hours</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={copyToClipboard} variant="outline" className="flex-1">
              <Copy className="mr-2 h-4 w-4" />
              Copy PayPay ID
            </Button>
            <Button onClick={sendEmail} className="flex-1">
              <Mail className="mr-2 h-4 w-4" />
              Send Confirmation Email
            </Button>
          </div>

          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200">What happens next?</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 mt-1 space-y-1">
                  <li>• Your payment will be verified within 24 hours</li>
                  <li>• You'll receive access to download the resource</li>
                  <li>• Access is granted for lifetime</li>
                  <li>• Contact support if you have any issues</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Having trouble? Contact us at <a href="mailto:proteclink.com@gmail.com" className="text-primary hover:underline">proteclink.com@gmail.com</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}