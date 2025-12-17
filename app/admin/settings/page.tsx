"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, Settings2, CreditCard, Mail, Globe, Shield, AlertCircle, CheckCircle2, RefreshCw, Building2 } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import dynamic from "next/dynamic"
const DeleteAllChatsButton = dynamic(() => import("./delete-all-chats-button"), { ssr: false });

interface Settings {
  site: {
    name: string
    description: string
    url: string
    contactEmail: string
  }
  payment: {
    currency: string
    stripeEnabled: boolean
    paypalEnabled: boolean
    bankTransferEnabled: boolean
    bankDetails: string
  }
  email: {
    fromEmail: string
    fromName: string
    smtpHost: string
    smtpPort: string
    smtpUser: string
  }
  security: {
    requireEmailVerification: boolean
    allowSignup: boolean
    sessionTimeout: number
  }
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [settings, setSettings] = useState<Settings>({
    site: {
      name: "ProtecLink",
      description: "Master technology skills with expert-curated courses and resources",
      url: "https://proteclink.com",
      contactEmail: "sumitadhikari2341@gmail.com",
    },
    payment: {
      currency: "JPY",
      stripeEnabled: false,
      paypalEnabled: false,
      bankTransferEnabled: true,
      bankDetails: "Bank: Nepal Bank\nAccount Name: ProtecLink\nAccount Number: XXXXX-XXXXX\nBranch: Kathmandu",
    },
    email: {
      fromEmail: "noreply@proteclink.com",
      fromName: "ProtecLink",
      smtpHost: "",
      smtpPort: "587",
      smtpUser: "",
    },
    security: {
      requireEmailVerification: false,
      allowSignup: true,
      sessionTimeout: 30,
    },
  })

  // Track changes
  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings)
    setHasChanges(true)
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setHasChanges(false)
      } else {
        toast.error("Failed to load settings")
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // Validation
    if (!settings.site.name.trim()) {
      toast.error("Site name is required")
      return
    }
    if (!settings.site.contactEmail.trim()) {
      toast.error("Contact email is required")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success("Settings saved successfully!")
        setHasChanges(false)
        setLastSaved(new Date())
      } else {
        toast.error("Failed to save settings")
      }
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    loadSettings()
    toast.info("Settings reset to last saved state")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Platform Settings</h1>
            <p className="text-sm md:text-base text-muted-foreground">Configure your course platform</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleReset} 
              disabled={saving || !hasChanges}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving || !hasChanges}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>


        {/* Status Indicators */}
        <div className="flex flex-wrap gap-2 items-center">
          {hasChanges && (
            <Badge variant="secondary" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Unsaved Changes
            </Badge>
          )}
          {!hasChanges && lastSaved && (
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              Saved {lastSaved.toLocaleTimeString()}
            </Badge>
          )}
        </div>
      </div>

      {hasChanges && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>You have unsaved changes</AlertTitle>
          <AlertDescription>
            Don't forget to save your changes before leaving this page.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="site" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="site" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Site</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="site" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Site Information
              </CardTitle>
              <CardDescription>Configure your platform's basic information and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="flex items-center gap-2">
                    Site Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="siteName"
                    placeholder="Your Platform Name"
                    value={settings.site.name}
                    onChange={(e) =>
                      updateSettings({
                        ...settings,
                        site: { ...settings.site, name: e.target.value },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Displayed in the browser tab and navigation
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="flex items-center gap-2">
                    Contact Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="contact@example.com"
                    value={settings.site.contactEmail}
                    onChange={(e) =>
                      updateSettings({
                        ...settings,
                        site: { ...settings.site, contactEmail: e.target.value },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for support and contact inquiries
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={settings.site.url}
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      site: { ...settings.site, url: e.target.value },
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Your platform's public URL
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  placeholder="A brief description of your platform..."
                  value={settings.site.description}
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      site: { ...settings.site, description: e.target.value },
                    })
                  }
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Used for SEO and social media previews
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Settings
              </CardTitle>
              <CardDescription>Configure payment methods and currency preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currency" className="flex items-center gap-2">
                  Primary Currency <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={settings.payment.currency}
                  onValueChange={(value) =>
                    updateSettings({
                      ...settings,
                      payment: { ...settings.payment, currency: value },
                    })
                  }
                >
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JPY">¥ Japanese Yen (JPY)</SelectItem>
                    <SelectItem value="NPR">रू Nepali Rupee (NPR)</SelectItem>
                    <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  All prices will be displayed in this currency
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Payment Methods</h3>
                  <p className="text-sm text-muted-foreground">Enable payment options for your students</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
                    <div className="flex-1 space-y-1">
                      <Label className="text-base">Stripe</Label>
                      <p className="text-sm text-muted-foreground">
                        Accept credit/debit cards via Stripe
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Requires API keys
                      </Badge>
                    </div>
                    <Switch
                      checked={settings.payment.stripeEnabled}
                      onCheckedChange={(checked) =>
                        updateSettings({
                          ...settings,
                          payment: { ...settings.payment, stripeEnabled: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
                    <div className="flex-1 space-y-1">
                      <Label className="text-base">PayPal</Label>
                      <p className="text-sm text-muted-foreground">
                        Accept payments via PayPal
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Requires PayPal account
                      </Badge>
                    </div>
                    <Switch
                      checked={settings.payment.paypalEnabled}
                      onCheckedChange={(checked) =>
                        updateSettings({
                          ...settings,
                          payment: { ...settings.payment, paypalEnabled: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
                    <div className="flex-1 space-y-1">
                      <Label className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Bank Transfer
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Accept direct bank transfers manually
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Manual verification required
                      </Badge>
                    </div>
                    <Switch
                      checked={settings.payment.bankTransferEnabled}
                      onCheckedChange={(checked) =>
                        updateSettings({
                          ...settings,
                          payment: { ...settings.payment, bankTransferEnabled: checked },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {settings.payment.bankTransferEnabled && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="bankDetails" className="text-base">Bank Transfer Instructions</Label>
                    <Textarea
                      id="bankDetails"
                      placeholder="Enter complete bank account details that students will see...&#10;&#10;Example:&#10;Bank Name: Nepal Bank&#10;Account Name: Your Company Name&#10;Account Number: XXXXX-XXXXX-XX&#10;Branch: City Name&#10;SWIFT/IBAN: (if applicable)"
                      value={settings.payment.bankDetails}
                      onChange={(e) =>
                        updateSettings({
                          ...settings,
                          payment: { ...settings.payment, bankDetails: e.target.value },
                        })
                      }
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        These details will be displayed to students during checkout. Make sure all information is accurate.
                      </AlertDescription>
                    </Alert>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>Configure email settings for notifications and communications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Email Identity</h3>
                  <p className="text-sm text-muted-foreground">How your emails appear to recipients</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      placeholder="Your Platform Name"
                      value={settings.email.fromName}
                      onChange={(e) =>
                        updateSettings({
                          ...settings,
                          email: { ...settings.email, fromName: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      placeholder="noreply@example.com"
                      value={settings.email.fromEmail}
                      onChange={(e) =>
                        updateSettings({
                          ...settings,
                          email: { ...settings.email, fromEmail: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">SMTP Configuration</h3>
                  <p className="text-sm text-muted-foreground">Configure your email service provider</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      placeholder="smtp.gmail.com"
                      value={settings.email.smtpHost}
                      onChange={(e) =>
                        updateSettings({
                          ...settings,
                          email: { ...settings.email, smtpHost: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      placeholder="587"
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) =>
                        updateSettings({
                          ...settings,
                          email: { ...settings.email, smtpPort: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    placeholder="your-email@gmail.com"
                    value={settings.email.smtpUser}
                    onChange={(e) =>
                      updateSettings({
                        ...settings,
                        email: { ...settings.email, smtpUser: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Security Note</AlertTitle>
                <AlertDescription>
                  SMTP password must be stored securely in your environment variables. 
                  Add <code className="text-xs bg-muted px-1 py-0.5 rounded">SMTP_PASSWORD</code> to your <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> file.
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Recommended Email Services</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                    <li>Resend - Modern email API for developers</li>
                    <li>SendGrid - Reliable email delivery service</li>
                    <li>AWS SES - Cost-effective for high volume</li>
                    <li>Gmail SMTP - Good for testing (limit 500/day)</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure authentication and security policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Authentication</h3>
                  <p className="text-sm text-muted-foreground">Control user registration and access</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
                    <div className="flex-1 space-y-1">
                      <Label className="text-base">Allow User Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable new users to create accounts on your platform
                      </p>
                      {!settings.security.allowSignup && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Only admins can create accounts
                        </Badge>
                      )}
                    </div>
                    <Switch
                      checked={settings.security.allowSignup}
                      onCheckedChange={(checked) =>
                        updateSettings({
                          ...settings,
                          security: { ...settings.security, allowSignup: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 rounded-lg border bg-card opacity-50">
                    <div className="flex-1 space-y-1">
                      <Label className="text-base">Email Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Require users to verify their email before accessing content
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        Currently disabled
                      </Badge>
                    </div>
                    <Switch
                      checked={false}
                      disabled={true}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Session Management</h3>
                  <p className="text-sm text-muted-foreground">Control user session behavior</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Duration (days)</Label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 max-w-xs">
                      <Input
                        id="sessionTimeout"
                        type="number"
                        min="1"
                        max="365"
                        value={settings.security.sessionTimeout}
                        onChange={(e) =>
                          updateSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              sessionTimeout: parseInt(e.target.value) || 30,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Users will remain logged in for {settings.security.sessionTimeout} days before requiring re-authentication
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Security Best Practices</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                    <li>Use strong passwords with minimum 8 characters</li>
                    <li>Enable HTTPS for your production site</li>
                    <li>Keep NextAuth secrets secure in environment variables</li>
                    <li>Regular ly review user access and permissions</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
