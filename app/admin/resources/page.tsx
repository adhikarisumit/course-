"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, FileText, Download, ExternalLink, Eye, EyeOff, UserPlus, UserMinus, Search, Filter, Settings, Users, X } from "lucide-react"
import { toast } from "sonner"

interface Resource {
  id: string
  title: string
  description?: string
  type: "cheatsheet" | "software" | "link"
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

interface User {
  id: string
  name: string | null
  email: string
}

interface ResourceAccess {
  id: string
  userId: string
  resourceId: string
  amount: number
  currency: string
  status: string
  createdAt: string
  user: User
  resource: Resource
}

export default function AdminResourcesPage() {
  // Resource Management State
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "cheatsheet" as "cheatsheet" | "software" | "link",
    url: "",
    fileUrl: "",
    category: "",
    tags: "",
    isFree: true,
    price: 0,
    isActive: true,
  })

  // Resource Access Management State
  const [resourceAccess, setResourceAccess] = useState<ResourceAccess[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [resourceFilter, setResourceFilter] = useState<string>("all")
  const [grantForm, setGrantForm] = useState({
    userEmail: "",
    resourceId: "",
  })
  const [grantFormData, setGrantFormData] = useState({
    userId: "",
    resourceId: "",
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [resourcesRes, accessRes, usersRes] = await Promise.all([
        fetch("/api/admin/resources"),
        fetch("/api/admin/resource-access"),
        fetch("/api/admin/users?role=student")
      ])

      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json()
        setResources(resourcesData)
      }

      if (accessRes.ok) {
        const accessData = await accessRes.json()
        setResourceAccess(accessData)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const fetchResources = async () => {
    try {
      const response = await fetch("/api/admin/resources")
      if (response.ok) {
        const data = await response.json()
        setResources(data)
      }
    } catch (error) {
      console.error("Error fetching resources:", error)
      toast.error("Failed to fetch resources")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingResource
        ? `/api/admin/resources/${editingResource.id}`
        : "/api/admin/resources"

      const method = editingResource ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingResource ? "Resource updated successfully" : "Resource created successfully")
        setIsDialogOpen(false)
        resetForm()
        fetchResources()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to save resource")
      }
    } catch (error) {
      console.error("Error saving resource:", error)
      toast.error("Failed to save resource")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/resources/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Resource deleted successfully")
        fetchResources()
      } else {
        toast.error("Failed to delete resource")
      }
    } catch (error) {
      console.error("Error deleting resource:", error)
      toast.error("Failed to delete resource")
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/resources/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        toast.success(`Resource ${!currentStatus ? "activated" : "deactivated"} successfully`)
        fetchResources()
      } else {
        toast.error("Failed to update resource status")
      }
    } catch (error) {
      console.error("Error updating resource status:", error)
      toast.error("Failed to update resource status")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "cheatsheet",
      url: "",
      fileUrl: "",
      category: "",
      tags: "",
      isFree: true,
      price: 0,
      isActive: true,
    })
    setEditingResource(null)
  }

  const openEditDialog = (resource: Resource) => {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description || "",
      type: resource.type,
      url: resource.url || "",
      fileUrl: resource.fileUrl || "",
      category: resource.category || "",
      tags: resource.tags || "",
      isFree: resource.isFree,
      price: resource.price || 0,
      isActive: resource.isActive,
    })
    setIsDialogOpen(true)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "cheatsheet":
        return <FileText className="h-4 w-4" />
      case "software":
        return <Download className="h-4 w-4" />
      case "link":
        return <ExternalLink className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "cheatsheet":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "software":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "link":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  // Resource Access Management Functions
  const handleGrantAccess = async () => {
    if (!grantForm.userEmail || !grantForm.resourceId) {
      toast.error("Please enter user email and select a resource")
      return
    }

    try {
      const response = await fetch("/api/admin/resource-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: grantForm.userEmail,
          resourceId: grantForm.resourceId,
          amount: 0, // Free access granted by admin
          currency: "usd",
          status: "completed"
        }),
      })

      if (response.ok) {
        toast.success("Access granted successfully")
        setGrantForm({ userEmail: "", resourceId: "" })
        fetchAllData()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to grant access")
      }
    } catch (error) {
      console.error("Error granting access:", error)
      toast.error("Failed to grant access")
    }
  }

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description || "",
      type: resource.type,
      url: resource.url || "",
      fileUrl: resource.fileUrl || "",
      category: resource.category || "",
      tags: resource.tags || "",
      isFree: resource.isFree,
      price: resource.price || 0,
      isActive: resource.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleRevokeAccess = async (accessId: string) => {
    try {
      const response = await fetch(`/api/admin/resource-access/${accessId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Access revoked successfully")
        fetchAllData()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to revoke access")
      }
    } catch (error) {
      console.error("Error revoking access:", error)
      toast.error("Failed to revoke access")
    }
  }

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || resource.type === typeFilter
    return matchesSearch && matchesType
  })

  const paidResources = resources.filter(resource => !resource.isFree)

  const filteredAccess = resourceAccess.filter(access => {
    const matchesUserSearch = access.user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    const matchesResourceFilter = resourceFilter === "all" || access.resourceId === resourceFilter
    return matchesUserSearch && matchesResourceFilter
  })

  const getResourceAccessCount = (resourceId: string) => {
    return resourceAccess.filter(access => access.resourceId === resourceId).length
  }

  const getResourceAccessForResource = (resourceId: string) => {
    return resourceAccess.filter(access => access.resourceId === resourceId)
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "cheatsheet":
        return <FileText className="h-4 w-4" />
      case "software":
        return <Settings className="h-4 w-4" />
      case "link":
        return <ExternalLink className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading resources...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Resources Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage resources and student access</p>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">{editingResource ? "Edit Resource" : "Add New Resource"}</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                {editingResource ? "Update the resource details" : "Create a new resource for students"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "cheatsheet" | "software" | "link") =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cheatsheet">Cheat Sheet</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., JavaScript, React, Development Tools"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., beginner, advanced, tutorial"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL {formData.type === "link" && "*"}</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                    required={formData.type === "link"}
                  />
                </div>
                {formData.type !== "cheatsheet" && (
                  <div className="space-y-2">
                    <Label htmlFor="fileUrl">File URL</Label>
                    <Input
                      id="fileUrl"
                      type="url"
                      value={formData.fileUrl}
                      onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                      placeholder="https://example.com/file.pdf"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFree"
                    checked={formData.isFree}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })}
                  />
                  <Label htmlFor="isFree">Free Resource</Label>
                </div>

                {!formData.isFree && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  {editingResource ? "Update" : "Create"} Resource
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="resources" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Access Management</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">Resources</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Manage course resources and materials</p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cheatsheet">Cheat Sheets</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="link">Links</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px] sm:min-w-[200px]">Title</TableHead>
                    <TableHead className="min-w-[80px] sm:min-w-[100px]">Type</TableHead>
                    <TableHead className="min-w-[80px] sm:min-w-[100px] hidden sm:table-cell">Category</TableHead>
                    <TableHead className="min-w-[60px] sm:min-w-[80px]">Free</TableHead>
                    <TableHead className="min-w-[70px] sm:min-w-[80px]">Active</TableHead>
                    <TableHead className="min-w-[100px] sm:min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">
                          {resource.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{resource.category || "-"}</TableCell>
                      <TableCell>
                        {resource.isFree ? (
                          <Badge variant="secondary" className="text-xs">Free</Badge>
                        ) : (
                          <Badge variant="default" className="text-xs">${resource.price}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={resource.isActive ? "default" : "secondary"} className="text-xs">
                          {resource.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(resource)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(resource.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No resources found matching your criteria.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">Resource Access Management</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Grant or revoke access to paid resources</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search users by email..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  {paidResources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px] sm:min-w-[200px]">User Email</TableHead>
                    <TableHead className="min-w-[120px] sm:min-w-[200px]">Resource</TableHead>
                    <TableHead className="min-w-[100px] sm:min-w-[120px] hidden sm:table-cell">Purchase Date</TableHead>
                    <TableHead className="min-w-[80px] sm:min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccess.map((access) => (
                    <TableRow key={access.id}>
                      <TableCell className="font-medium text-sm">{access.user.email}</TableCell>
                      <TableCell className="text-sm">{access.resource.title}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        {new Date(access.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeAccess(access.id)}
                          className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Revoke</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredAccess.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No access records found.</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t">
              <div>
                <h3 className="text-base sm:text-lg font-semibold">Grant Access</h3>
                <p className="text-muted-foreground text-sm">Manually grant access to a paid resource</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grantUserEmail">User Email</Label>
                <Input
                  id="grantUserEmail"
                  type="email"
                  value={grantForm.userEmail}
                  onChange={(e) => setGrantForm({ ...grantForm, userEmail: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grantResourceId">Resource</Label>
                <Select
                  value={grantForm.resourceId}
                  onValueChange={(value) => setGrantForm({ ...grantForm, resourceId: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {paidResources.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.title} (${resource.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end sm:col-span-2 lg:col-span-1">
                <Button onClick={handleGrantAccess} className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Grant Access
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
}