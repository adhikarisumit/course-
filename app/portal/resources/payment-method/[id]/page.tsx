"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard, Mail, CheckCircle, Clock, Copy } from "lucide-react"
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

export default function PaymentMethodPage() {
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const purchaseId = params.id as string

  useEffect(() => {
    if (purchaseId) {
      fetchPurchase()
    }
  }, [purchaseId])

  const fetchPurchase = async () => {
    try {
      const response = await fetch(`/api/resources/purchase/${purchaseId}`)
      if (response.ok) {
        const data = await response.json()
        setPurchase(data.purchase)
      } else {
        console.error('Failed to fetch purchase')
      }
    } catch (error) {
      console.error('Error fetching purchase:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const sendEmail = (e: React.MouseEvent) => {
    e.preventDefault()
    
    const email = "sumitadhikari2341@gmail.com"
    const subject = `Resource Purchase - ${purchase?.resource.title}`
    const body = `Hi, I have sent payment via PayPay (ID: aatit) for the resource "${purchase?.resource.title}".

My email: [Your Email Here]

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
              <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Pending Approval
              </Badge>
            </div>
            <CardDescription>
              Pay securely via PayPay to get access to this resource.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{purchase.resource.title}</h3>
              {purchase.resource.description && (
                <p className="text-gray-600 mb-4">{purchase.resource.description}</p>
              )}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-lg font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">
                  ¥{purchase.amount}
                </span>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Instructions
              </h4>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg">Payment Instructions:</h3>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="font-semibold">1.</span>
                    <span>Send <strong>¥{purchase.amount}</strong> via PayPay to:</span>
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
                    <span>Include your email and resource name in the payment note</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold">3.</span>
                    <span>Send payment receipt to <strong>sumitadhikari2341@gmail.com</strong> with subject:</span>
                  </li>
                  <li className="ml-5">
                    <div className="bg-white dark:bg-gray-900 p-3 rounded border text-xs font-mono">
                      Resource Purchase - {purchase.resource.title}
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold">4.</span>
                    <span>Include your payment receipt in the email</span>
                  </li>
                </ol>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                <p className="text-sm text-center">
                  <strong>Email Address:</strong> sumitadhikari2341@gmail.com
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                <h5 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  What happens next?
                </h5>
                <ol className="text-sm text-green-800 dark:text-green-200 space-y-1 list-decimal list-inside">
                  <li>Complete the PayPay payment using the ID above</li>
                  <li>Send the payment receipt to sumitadhikari2341@gmail.com</li>
                  <li>Our admin team will verify and approve your purchase</li>
                  <li>You will receive access to the resource within 24 hours</li>
                </ol>
              </div>
            </div>

            <div className="border-t pt-6 flex gap-4">
              <Button
                onClick={() => router.push("/portal/softwares")}
                variant="outline"
                className="flex-1"
              >
                Back to Resources
              </Button>
              <Button
                onClick={sendEmail}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email Receipt
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Purchase ID: {purchase.id} • Created: {new Date(purchase.createdAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}