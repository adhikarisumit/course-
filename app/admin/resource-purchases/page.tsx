"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import { toast } from "sonner"

interface ResourcePurchase {
  id: string
  amount: number
  currency: string
  status: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  resource: {
    id: string
    title: string
    description?: string
  }
}

export default function ResourcePurchasesAdminPage() {
  const [purchases, setPurchases] = useState<ResourcePurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      const response = await fetch("/api/admin/resource-purchases")
      if (response.ok) {
        const data = await response.json()
        setPurchases(data.purchases)
      } else {
        toast.error("Failed to load purchases")
      }
    } catch (error) {
      console.error("Error fetching purchases:", error)
      toast.error("Failed to load purchases")
    } finally {
      setLoading(false)
    }
  }

  const handleApprovePurchase = async (purchaseId: string) => {
    setProcessing(purchaseId)
    try {
      const response = await fetch(`/api/admin/resource-purchases/${purchaseId}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Purchase approved successfully!")
        fetchPurchases() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to approve purchase")
      }
    } catch (error) {
      console.error("Error approving purchase:", error)
      toast.error("Failed to approve purchase")
    } finally {
      setProcessing(null)
    }
  }

  const handleRejectPurchase = async (purchaseId: string) => {
    setProcessing(purchaseId)
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
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Resource Purchases</h1>
          <p className="text-gray-600">Manage pending resource purchase requests</p>
        </div>
        <Button onClick={fetchPurchases} variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Requests</CardTitle>
          <CardDescription>
            Review and approve pending resource purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No purchase requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Resource</TableHead>
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
                      <div>
                        <div className="font-medium">{purchase.user.name}</div>
                        <div className="text-sm text-gray-500">{purchase.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{purchase.resource.title}</div>
                        {purchase.resource.description && (
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {purchase.resource.description}
                          </div>
                        )}
                      </div>
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
                      {purchase.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprovePurchase(purchase.id)}
                            disabled={processing === purchase.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectPurchase(purchase.id)}
                            disabled={processing === purchase.id}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
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