"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { CheckCircle, XCircle, Clock, ExternalLink, RefreshCw, User, FileText, DollarSign } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      setRefreshing(true)
      // Fetch all statuses
      const response = await fetch("/api/admin/resource-access?showAll=true")
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

  // Filter purchases by status
  const pendingPurchases = purchases.filter(p => p.status === 'pending')
  const completedPurchases = purchases.filter(p => p.status === 'completed')
  const rejectedPurchases = purchases.filter(p => p.status === 'rejected')

  // Calculate revenue (only from approved/completed)
  const totalRevenue = completedPurchases.reduce((sum, p) => sum + p.amount, 0)

  const approvePurchase = async (purchaseId: string) => {
    try {
      const response = await fetch(`/api/admin/resource-purchases/${purchaseId}/approve`, {
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
      const response = await fetch(`/api/admin/resource-purchases/${purchaseId}/reject`, {
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

  const revokeAccess = async (purchaseId: string) => {
    try {
      const response = await fetch(`/api/admin/resource-access/${purchaseId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Access revoked successfully")
        fetchPurchases() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to revoke access")
      }
    } catch (error) {
      console.error("Error revoking access:", error)
      toast.error("Failed to revoke access")
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
              <p className="text-muted-foreground">Loading access records...</p>
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
            <p className="text-muted-foreground">Manage user access to resources - approve requests and revoke access</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-200 dark:bg-yellow-800">
                <Clock className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
              </div>
              <div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{pendingPurchases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-200 dark:bg-green-800">
                <CheckCircle className="h-5 w-5 text-green-700 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Approved Access</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">{completedPurchases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-200 dark:bg-red-800">
                <XCircle className="h-5 w-5 text-red-700 dark:text-red-300" />
              </div>
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">Rejected</p>
                <p className="text-2xl font-bold text-red-800 dark:text-red-200">{rejectedPurchases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-200 dark:bg-blue-800">
                <DollarSign className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">¥{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="pending" className="relative">
            <Clock className="w-4 h-4 mr-2" />
            Pending
            {pendingPurchases.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-yellow-500 text-white">
                {pendingPurchases.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approved ({completedPurchases.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            <XCircle className="w-4 h-4 mr-2" />
            Rejected ({rejectedPurchases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pending Purchase Requests
              </CardTitle>
              <CardDescription>
                These students have requested access and are waiting for your approval. Approve to grant access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderPurchaseTable(pendingPurchases, "pending")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Approved Access
              </CardTitle>
              <CardDescription>
                Students who have been granted access to resources. Revenue is counted from these approved purchases only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderPurchaseTable(completedPurchases, "completed")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Rejected Requests
              </CardTitle>
              <CardDescription>
                Purchase requests that were rejected. These do not count as purchases or revenue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderPurchaseTable(rejectedPurchases, "rejected")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderPurchaseTable(data: ResourcePurchase[], status: string) {
    if (data.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {status === "pending" && "No pending requests"}
            {status === "completed" && "No approved access records"}
            {status === "rejected" && "No rejected requests"}
          </p>
        </div>
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((purchase) => (
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
                {new Date(purchase.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2 flex-wrap">
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
                            <AlertDialogTitle>Approve Purchase Request</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to approve this purchase request? The student will gain access to "{purchase.resource.title}" and this will count as a sale (¥{purchase.amount}).
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
                            <AlertDialogTitle>Reject Purchase Request</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to reject this purchase request? The student will not gain access to "{purchase.resource.title}".
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
                  {purchase.status === 'completed' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <XCircle className="w-4 h-4 mr-1" />
                          Revoke Access
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke Access</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to revoke access to "{purchase.resource.title}" for {purchase.user.name || purchase.user.email}? This will permanently remove their access to this resource.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => revokeAccess(purchase.id)}>
                            Revoke Access
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {purchase.status === 'rejected' && (
                    <Badge variant="outline" className="text-muted-foreground">
                      No actions available
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
}