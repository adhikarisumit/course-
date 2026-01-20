"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { 
  Loader2, CheckCircle, XCircle, Clock, BookOpen, FileText, 
  Search, Filter, User, Calendar, DollarSign, MessageSquare,
  Check, X, Trash2
} from "lucide-react"

interface PurchaseRequest {
  id: string
  userId: string
  itemType: string
  itemId: string
  itemTitle: string
  amount: number
  currency: string
  status: string
  message: string | null
  adminNote: string | null
  reviewedAt: string | null
  reviewedBy: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function AdminPurchaseRequestsPage() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [adminNote, setAdminNote] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [filterStatus, filterType])

  const loadRequests = async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus !== "all") params.set("status", filterStatus)
      if (filterType !== "all") params.set("itemType", filterType)

      const response = await fetch(`/api/admin/purchase-requests?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests)
        setStats(data.stats)
      }
    } catch (error) {
      toast.error("Failed to load requests")
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (request: PurchaseRequest, action: "approve" | "reject") => {
    setSelectedRequest(request)
    setActionType(action)
    setAdminNote("")
    setActionDialogOpen(true)
  }

  const processAction = async () => {
    if (!selectedRequest || !actionType) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/purchase-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionType, adminNote }),
      })

      if (response.ok) {
        toast.success(`Request ${actionType === "approve" ? "approved" : "rejected"} successfully`)
        setActionDialogOpen(false)
        loadRequests()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to process request")
      }
    } catch (error) {
      toast.error("Failed to process request")
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return

    try {
      const response = await fetch(`/api/admin/purchase-requests/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Request deleted successfully")
        loadRequests()
      } else {
        toast.error("Failed to delete request")
      }
    } catch (error) {
      toast.error("Failed to delete request")
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.itemTitle.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "course" ? <BookOpen className="h-4 w-4" /> : <FileText className="h-4 w-4" />
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
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Purchase Requests</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Review and manage student purchase requests for courses and resources
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-500 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-500 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, email, or item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="course">Courses</SelectItem>
                <SelectItem value="resource">Resources</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Requests</CardTitle>
          <CardDescription>
            Showing {filteredRequests.length} of {requests.length} requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No requests found</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <p className="font-semibold truncate">
                            {request.user.name || request.user.email}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{request.user.email}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    {/* Item Info */}
                    <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                      <div className="flex-shrink-0 mt-0.5">
                        {getTypeIcon(request.itemType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{request.itemTitle}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {request.itemType === "course" ? "Course" : "Resource"}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {request.amount.toLocaleString()} {request.currency.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Message if exists */}
                    {request.message && (
                      <div className="flex items-start gap-2 text-sm">
                        <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <p className="text-muted-foreground line-clamp-2">{request.message}</p>
                      </div>
                    )}

                    {/* Admin Note if exists */}
                    {request.adminNote && (
                      <div className="p-2 bg-muted rounded-md text-sm">
                        <p className="text-xs text-muted-foreground mb-1">Admin Note:</p>
                        <p className="line-clamp-2">{request.adminNote}</p>
                      </div>
                    )}

                    {/* Date */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      {request.status === "pending" ? (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleAction(request, "approve")}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAction(request, "reject")}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <div className="flex-1 text-center text-sm text-muted-foreground">
                          {request.reviewedAt && (
                            <span>
                              {request.status === "approved" ? "Approved" : "Rejected"} on{" "}
                              {new Date(request.reviewedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive flex-shrink-0"
                        onClick={() => handleDelete(request.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Request" : "Reject Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "This will grant the student access to the requested item."
                : "This will reject the student's purchase request."}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md space-y-2">
                <p className="text-sm">
                  <strong>Student:</strong> {selectedRequest.user.name || selectedRequest.user.email}
                </p>
                <p className="text-sm">
                  <strong>Item:</strong> {selectedRequest.itemTitle}
                </p>
                <p className="text-sm">
                  <strong>Type:</strong> {selectedRequest.itemType === "course" ? "Course" : "Resource"}
                </p>
                <p className="text-sm">
                  <strong>Amount:</strong> {selectedRequest.amount.toLocaleString()} {selectedRequest.currency.toUpperCase()}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNote">Note (Optional)</Label>
                <Textarea
                  id="adminNote"
                  placeholder="Add a note for this action..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={processAction}
              disabled={processing}
              className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : actionType === "approve" ? (
                "Approve"
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
