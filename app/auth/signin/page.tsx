"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { AlertCircle, Ban } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showVerificationAlert, setShowVerificationAlert] = useState(false)
  const [showBannedAlert, setShowBannedAlert] = useState(false)
  const [isAdminEmail, setIsAdminEmail] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Check if email belongs to an admin (with debounce)
  const checkAdminEmail = useCallback(async (email: string) => {
    if (!email || !email.includes("@")) {
      setIsAdminEmail(false)
      return
    }
    try {
      const response = await fetch("/api/auth/check-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (response.ok) {
        const data = await response.json()
        setIsAdminEmail(data.isAdmin)
      }
    } catch {
      setIsAdminEmail(false)
    }
  }, [])

  // Debounced email check
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAdminEmail(formData.email)
    }, 500)
    return () => clearTimeout(timer)
  }, [formData.email, checkAdminEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setShowVerificationAlert(false)
    setShowBannedAlert(false)

    try {
      // First check if user is banned or unverified
      const checkResponse = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      })
      
      if (!checkResponse.ok) {
        const checkData = await checkResponse.json()
        if (checkData.error === "banned") {
          setShowBannedAlert(true)
          setIsLoading(false)
          return
        }
        if (checkData.error === "unverified") {
          setShowVerificationAlert(true)
          setIsLoading(false)
          return
        }
      }

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        // Check if it's an email verification error
        if (result.error.includes("verify your email") || (result.error.includes("verify") && result.error.includes("email"))) {
          setShowVerificationAlert(true)
        } else if (result.error.toLowerCase().includes("banned")) {
          setShowBannedAlert(true)
        } else {
          toast.error("Invalid email or password")
        }
      } else {
        toast.success("Welcome back!")
        // Fetch session to check user role
        const response = await fetch("/api/auth/session")
        const session = await response.json()
        
        // Redirect based on user role
        if (session?.user?.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/portal/dashboard")
        }
        router.refresh()
      }
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
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your courses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showBannedAlert && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-800 dark:text-red-200">
              <Ban className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <p className="font-medium">Account Banned</p>
                <p className="text-sm mt-1">Your account has been banned from this platform. If you believe this is a mistake, please contact support for assistance.</p>
              </AlertDescription>
            </Alert>
          )}
          {showVerificationAlert && (
            <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <p className="font-medium">Email not verified</p>
                <p className="text-sm mt-1">Please verify your email before signing in.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 bg-white hover:bg-amber-100 border-amber-300"
                  onClick={() => router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)}
                >
                  Verify Email
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isAdminEmail && (
                  <Link 
                    href={`/auth/forgot-password?email=${encodeURIComponent(formData.email)}&admin=true`}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
