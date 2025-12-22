"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { CheckCircle, XCircle, Clock, ExternalLink, RefreshCw, User, FileText } from "lucide-react"
import { toast } from "sonner"

interface ResourcePurchase {
  id: string
  userId: string
  resourceId: string
  amount: number
  currency: string
  status: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  resource: {
    id: string
    title: string
    description?: string
    type: string
    url?: string
    fileUrl?: string
    category?: string
    tags?: string
    isFree: boolean
    price?: number
    isActive: boolean
    downloadCount: number
    clickCount: number
    createdAt: string
    updatedAt: string
  }
}

export default function ResourceAccessPage() {
  const [purchases, setPurchases] = useState<ResourcePurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/admin/resource-access")
      if (response.ok) {
        const data = await response.json()
        setPurchases(data)
      } else {
        toast.error("Failed to fetch purchase requests")
      }
    } catch (error) {
      console.error("Error fetching purchases:", error)
      toast.error("Failed to fetch purchase requests")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const approvePurchase = async (purchaseId: string) => {
    try {
      const response = await fetch(`/api/admin/resource-access/${purchaseId}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Purchase approved successfully")
        fetchPurchases() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to approve purchase")
      }
    } catch (error) {
      console.error("Error approving purchase:", error)
      toast.error("Failed to approve purchase")
    }
  }

  const rejectPurchase = async (purchaseId: string) => {
    try {
      const response = await fetch(`/api/admin/resource-access/${purchaseId}/reject`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Purchase rejected")
        fetchPurchases() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to reject purchase")
      }
    } catch (error) {
      console.error("Error rejecting purchase:", error)
      toast.error("Failed to reject purchase")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "cheatsheet":
        return <FileText className="w-4 h-4" />
      case "software":
        return <ExternalLink className="w-4 h-4" />
      case "link":
        return <ExternalLink className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading purchase requests...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Resource Access Management</h1>
            <p className="text-muted-foreground">Review and approve student purchase requests</p>
          </div>
          <Button
            onClick={fetchPurchases}
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Requests</CardTitle>
          <CardDescription>
            {purchases.length} total requests • {purchases.filter(p => p.status === 'pending').length} pending approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No purchase requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{purchase.user.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{purchase.user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getResourceTypeIcon(purchase.resource.type)}
                        <div>
                          <p className="font-medium">{purchase.resource.title}</p>
                          {purchase.resource.category && (
                            <p className="text-sm text-muted-foreground">{purchase.resource.category}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{purchase.resource.type}</Badge>
                    </TableCell>
                    <TableCell>
                      ¥{purchase.amount}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(purchase.status)}
                    </TableCell>
                    <TableCell>
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {purchase.status === 'pending' && (
                          <>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="default">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Approve Purchase</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to approve this purchase request? The student will gain access to "{purchase.resource.title}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => approvePurchase(purchase.id)}>
                                    Approve
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Reject Purchase</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to reject this purchase request? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => rejectPurchase(purchase.id)}>
                                    Reject
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}