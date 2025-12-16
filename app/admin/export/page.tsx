"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Users, CreditCard, BookOpen, GraduationCap, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function ExportPage() {
  const [exporting, setExporting] = useState<string | null>(null)

  const handleExport = async (type: string, label: string) => {
    setExporting(type)
    try {
      const response = await fetch(`/api/admin/export?type=${type}`)
      
      if (!response.ok) {
        throw new Error("Export failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`${label} exported successfully!`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error(`Failed to export ${label.toLowerCase()}`)
    } finally {
      setExporting(null)
    }
  }

  const exportItems = [
    {
      type: "students",
      label: "Students Data",
      description: "Export all student information including enrollment counts",
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      type: "all-users",
      label: "All Users",
      description: "Export complete user database (students, admins, mentors)",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      type: "payments",
      label: "Payment Records",
      description: "Export transaction history and payment details",
      icon: CreditCard,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      type: "enrollments",
      label: "Enrollments",
      description: "Export course enrollment data with progress tracking",
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      type: "courses",
      label: "Courses Data",
      description: "Export course catalog with statistics",
      icon: FileSpreadsheet,
      color: "text-indigo-600",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
    },
  ]

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Data Export</h1>
        <p className="text-muted-foreground">
          Export platform data for analysis, backup, or reporting purposes
        </p>
      </div>

      <Alert className="mb-6">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>CSV Format</AlertTitle>
        <AlertDescription>
          All exports are in CSV format, compatible with Excel, Google Sheets, and other spreadsheet applications.
          Files include headers and are encoded in UTF-8.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {exportItems.map((item) => (
          <Card key={item.type} className={`border ${item.borderColor}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <Badge variant="outline" className="text-xs">
                  CSV
                </Badge>
              </div>
              <CardTitle className="mt-4">{item.label}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => handleExport(item.type, item.label)}
                disabled={exporting !== null}
              >
                {exporting === item.type ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export {item.label}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle>Export Information</CardTitle>
          <CardDescription>What's included in each export</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Students Data
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Student ID, name, and email</li>
                <li>Registration date</li>
                <li>Email verification status</li>
                <li>Total enrollments count</li>
                <li>Total payments count</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                All Users
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>All user types (students, admins, mentors)</li>
                <li>User roles and permissions</li>
                <li>Account creation dates</li>
                <li>Activity metrics</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Records
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Transaction IDs and amounts</li>
                <li>Payment methods and status</li>
                <li>Student information</li>
                <li>Currency and dates</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Enrollments
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Student and course details</li>
                <li>Progress percentages</li>
                <li>Completion status</li>
                <li>Enrollment dates</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Courses Data
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Course titles and categories</li>
                <li>Pricing and difficulty levels</li>
                <li>Publication status</li>
                <li>Enrollment and lesson counts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="mt-6">
        <AlertTitle>Data Privacy</AlertTitle>
        <AlertDescription>
          Exported data contains sensitive information. Store files securely and handle according to data protection regulations (GDPR, etc.).
          Do not share exported files publicly.
        </AlertDescription>
      </Alert>
    </div>
  )
}
