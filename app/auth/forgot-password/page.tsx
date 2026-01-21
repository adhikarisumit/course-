"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, Mail, Shield, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

function ForgotPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get("email") || ""
  const isAdmin = searchParams.get("admin") === "true"
  
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState(initialEmail)
  const [codeSent, setCodeSent] = useState(false)
  const [isAdminAccount, setIsAdminAccount] = useState(isAdmin)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to send reset code")
        return
      }

      setCodeSent(true)
      setIsAdminAccount(data.isAdmin)
      toast.success("If an account exists, a reset code has been sent to your email")
      
      // Redirect to reset password page after a short delay
      setTimeout(() => {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}${data.isAdmin ? "&admin=true" : ""}`)
      }, 1500)

    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
              <CardDescription>
                Enter your email to receive a password reset code
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAdminAccount && (
            <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-200">
              <Shield className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <p className="font-medium">Admin Account</p>
                <p className="text-sm mt-1">A password reset code will be sent to your admin email address.</p>
              </AlertDescription>
            </Alert>
          )}
          
          {codeSent ? (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Check Your Email</h3>
              <p className="text-muted-foreground text-sm">
                We've sent a password reset code to <strong>{email}</strong>
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Redirecting to reset page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full text-muted-foreground">
            Remember your password?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

function ForgotPasswordLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
