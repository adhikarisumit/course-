"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { 
  Loader2, Clock, CheckCircle, XCircle, BookOpen, FileText, 
  Calendar, DollarSign, MessageSquare, ShoppingBag, ArrowRight
} from "lucide-react"
import Link from "next/link"

interface PurchaseRequest {
  id: string
  itemType: string
  itemId: string
  itemTitle: string
  amount: number
  currency: string
  status: string
  message: string | null
  adminNote: string | null
  reviewedAt: string | null
  createdAt: string
}

export default function PurchasesPage() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<PurchaseRequest[]>([])

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const response = await fetch("/api/purchase-requests")
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      toast.error("Failed to load purchase requests")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to cancel this request?")) return

    try {
      const response = await fetch(`/api/purchase-requests/${requestId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setRequests(requests.filter((r) => r.id !== requestId))
        toast.success("Request canceled successfully")
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
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "course" ? (
      <BookOpen className="h-5 w-5 text-primary" />
    ) : (
      <FileText className="h-5 w-5 text-primary" />
    )
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const approvedRequests = requests.filter((r) => r.status === "approved")
  const rejectedRequests = requests.filter((r) => r.status === "rejected")

  const stats = {
    total: requests.length,
    pending: pendingRequests.length,
    approved: approvedRequests.length,
    rejected: rejectedRequests.length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const RequestCard = ({ request }: { request: PurchaseRequest }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Left side - Item info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              {getTypeIcon(request.itemType)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold truncate">{request.itemTitle}</h3>
                {getStatusBadge(request.status)}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {request.itemType === "course" ? "Course" : "Resource"}
                  </Badge>
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  ¥{request.amount.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Message */}
              {request.message && (
                <div className="mt-3 flex items-start gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{request.message}</p>
                </div>
              )}

              {/* Admin Note */}
              {request.adminNote && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Response from Admin:</p>
                  <p className="text-sm">{request.adminNote}</p>
                </div>
              )}

              {/* Reviewed date */}
              {request.reviewedAt && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {request.status === "approved" ? "Approved" : "Rejected"} on{" "}
                  {new Date(request.reviewedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex sm:flex-col gap-2 sm:items-end">
            {request.status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleCancelRequest(request.id)}
              >
                Cancel Request
              </Button>
            )}
            {request.status === "approved" && (
              <Link href={request.itemType === "course" ? `/courses/${request.itemId}` : "/portal/resources"}>
                <Button size="sm">
                  Access Now
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">My Purchases</h1>
              <p className="text-muted-foreground text-sm">Track your purchase requests and access status</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                <Clock className="h-4 w-4" /> Pending
              </p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Approved
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <XCircle className="h-4 w-4" /> Rejected
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-8 md:p-12 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Purchase Requests Yet</h3>
              <p className="text-muted-foreground mb-4">
                When you request access to paid courses or resources, they will appear here.
              </p>
              <Link href="/courses">
                <Button>
                  Browse Courses
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pending
                {stats.pending > 0 && (
                  <Badge className="ml-1.5 bg-yellow-500 text-white text-[10px] px-1.5 py-0">{stats.pending}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No pending requests
                  </CardContent>
                </Card>
              ) : (
                pendingRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {approvedRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No approved requests
                  </CardContent>
                </Card>
              ) : (
                approvedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {rejectedRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No rejected requests
                  </CardContent>
                </Card>
              ) : (
                rejectedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
