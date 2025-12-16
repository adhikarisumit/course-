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
import { Loader2, Save, Settings2, CreditCard, Mail, Globe, Shield } from "lucide-react"
import { toast } from "sonner"

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
  const [settings, setSettings] = useState<Settings>({
    site: {
      name: "Course Platform",
      description: "Learn and grow with our courses",
      url: "",
      contactEmail: "",
    },
    payment: {
      currency: "JPY",
      stripeEnabled: false,
      paypalEnabled: false,
      bankTransferEnabled: true,
      bankDetails: "",
    },
    email: {
      fromEmail: "",
      fromName: "",
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

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast.success("Settings saved successfully!")
      } else {
        toast.error("Failed to save settings")
      }
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Platform Settings</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your platform configuration</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
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

      <Tabs defaultValue="site" className="space-y-6">
        <TabsList>
          <TabsTrigger value="site">
            <Globe className="h-4 w-4 mr-2" />
            Site
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>Basic information about your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.site.name}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      site: { ...settings.site, name: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.site.description}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      site: { ...settings.site, description: e.target.value },
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={settings.site.url}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      site: { ...settings.site, url: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@example.com"
                  value={settings.site.contactEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      site: { ...settings.site, contactEmail: e.target.value },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment methods and currency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={settings.payment.currency}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      payment: { ...settings.payment, currency: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="GBP">British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Payment Methods</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Stripe</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept credit cards via Stripe
                    </p>
                  </div>
                  <Switch
                    checked={settings.payment.stripeEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        payment: { ...settings.payment, stripeEnabled: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>PayPal</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept payments via PayPal
                    </p>
                  </div>
                  <Switch
                    checked={settings.payment.paypalEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        payment: { ...settings.payment, paypalEnabled: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bank Transfer</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept direct bank transfers
                    </p>
                  </div>
                  <Switch
                    checked={settings.payment.bankTransferEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        payment: { ...settings.payment, bankTransferEnabled: checked },
                      })
                    }
                  />
                </div>
              </div>

              {settings.payment.bankTransferEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="bankDetails">Bank Transfer Details</Label>
                  <Textarea
                    id="bankDetails"
                    placeholder="Enter bank account details for students..."
                    value={settings.payment.bankDetails}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payment: { ...settings.payment, bankDetails: e.target.value },
                      })
                    }
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    This information will be shown to students when they enroll in courses
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure email settings for notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  placeholder="noreply@example.com"
                  value={settings.email.fromEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, fromEmail: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  placeholder="Course Platform"
                  value={settings.email.fromName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, fromName: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  placeholder="smtp.example.com"
                  value={settings.email.smtpHost}
                  onChange={(e) =>
                    setSettings({
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
                  value={settings.email.smtpPort}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, smtpPort: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  placeholder="username"
                  value={settings.email.smtpUser}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, smtpUser: e.target.value },
                    })
                  }
                />
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> SMTP password should be stored securely in environment variables.
                  Add SMTP_PASSWORD to your .env file.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and authentication options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require users to verify their email address
                  </p>
                </div>
                <Switch
                  checked={settings.security.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, requireEmailVerification: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Signup</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to create accounts
                  </p>
                </div>
                <Switch
                  checked={settings.security.allowSignup}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, allowSignup: checked },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (days)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="1"
                  max="365"
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        sessionTimeout: parseInt(e.target.value) || 30,
                      },
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  How long users stay logged in before needing to sign in again
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
