"use client"

import { useState, Suspense, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromParams = searchParams.get('email')
  
  const [status, setStatus] = useState<'input' | 'verifying' | 'success' | 'error'>('input')
  const [errorMessage, setErrorMessage] = useState('')
  const [email, setEmail] = useState(emailFromParams || '')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (emailFromParams) {
      inputRefs.current[0]?.focus()
    }
  }, [emailFromParams])

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits are entered
    if (value && index === 5 && newCode.every(digit => digit !== '')) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      const newCode = pastedData.split('')
      setCode(newCode)
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('')
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    if (codeToVerify.length !== 6) {
      toast.error('Please enter the 6-digit code')
      return
    }

    setStatus('verifying')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: codeToVerify, action: 'verify' }),
      })

      const data = await response.json()

      if (response.ok && data.verified) {
        setStatus('success')
        toast.success('Email verified successfully!')
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        setStatus('error')
        setErrorMessage(data.error || 'Verification failed')
        setCode(['', '', '', '', '', ''])
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
      setCode(['', '', '', '', '', ''])
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsResending(true)

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('New verification code sent! Check your inbox.')
        setCode(['', '', '', '', '', ''])
        setStatus('input')
        inputRefs.current[0]?.focus()
      } else {
        toast.error(data.error || 'Failed to send verification code')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md">
        {status === 'verifying' && (
          <>
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">Verifying</CardTitle>
              <CardDescription className="text-center">
                Please wait while we verify your code...
              </CardDescription>
            </CardHeader>
          </>
        )}

        {status === 'success' && (
          <>
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-center text-green-600">Email Verified!</CardTitle>
              <CardDescription className="text-center">
                Your email has been verified successfully. Redirecting to sign in...
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/auth/signin">Sign In Now</Link>
              </Button>
            </CardFooter>
          </>
        )}

        {status === 'error' && (
          <>
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-center text-red-600">Verification Failed</CardTitle>
              <CardDescription className="text-center">
                {errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  setStatus('input')
                  inputRefs.current[0]?.focus()
                }}
              >
                Try Again
              </Button>
              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={handleResendCode}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend Code'
                )}
              </Button>
            </CardContent>
          </>
        )}

        {status === 'input' && (
          <>
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Mail className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Enter Verification Code</CardTitle>
              <CardDescription className="text-center">
                We sent a 6-digit code to your email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!emailFromParams && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}
              {emailFromParams && (
                <p className="text-center text-sm text-muted-foreground">
                  Code sent to <span className="font-medium text-foreground">{email}</span>
                </p>
              )}
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold"
                  />
                ))}
              </div>
              <Button 
                className="w-full" 
                onClick={() => handleVerify()}
                disabled={code.some(d => !d) || !email}
              >
                Verify Email
              </Button>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn&apos;t receive the code?
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleResendCode}
                  disabled={isResending || !email}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Code'
                  )}
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-center w-full text-muted-foreground">
                <Link href="/auth/signin" className="text-primary hover:underline">
                  Back to Sign In
                </Link>
              </p>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
