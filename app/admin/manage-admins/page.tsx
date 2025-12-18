"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Loader2, UserPlus, Shield, Mail, Calendar, AlertCircle, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const SUPER_ADMIN_EMAIL = "sumitadhikari2341@gmail.com"

interface Admin {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
}

export default function ManageAdminsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
  })

  const isSuperAdmin = session?.user?.email === SUPER_ADMIN_EMAIL

  useEffect(() => {
    if (session && !isSuperAdmin) {
      toast.error("Access denied: Only super admin can manage admins")
      router.push("/admin")
      return
    }
    if (session) {
      loadAdmins()
    }
  }, [session, isSuperAdmin, router])

  const loadAdmins = async () => {
    try {
      const response = await fetch("/api/admin/manage-admins")
      if (response.ok) {
        const data = await response.json()
        setAdmins(data)
      } else {
        toast.error("Failed to load admins")
      }
    } catch (error) {
      toast.error("Failed to load admins")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.error("All fields are required")
      return
    }

    if (newAdmin.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setCreating(true)
    try {
      const response = await fetch("/api/admin/manage-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdmin),
      })

      if (response.ok) {
        toast.success("Manager admin created successfully!")
        setDialogOpen(false)
        setNewAdmin({ name: "", email: "", password: "" })
        loadAdmins()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to create admin")
      }
    } catch (error) {
      toast.error("Failed to create admin")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
    if (adminEmail === SUPER_ADMIN_EMAIL) {
      toast.error("Cannot delete super admin")
      return
    }

    if (!confirm("Are you sure you want to remove this manager admin?")) {
      return
    }

    setDeleting(adminId)
    try {
      const response = await fetch(`/api/admin/manage-admins/${adminId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Manager admin removed successfully")
        loadAdmins()
      } else {
        toast.error("Failed to remove admin")
      }
    } catch (error) {
      toast.error("Failed to remove admin")
    } finally {
      setDeleting(null)
    }
  }

  if (!session || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg">Access Denied</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Only the super admin can access this page
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Manage Admins</h1>
          <p className="text-sm md:text-base text-muted-foreground">Add and manage admin users for your platform</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Manager Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Manager Admin</DialogTitle>
              <DialogDescription>
                Add a new manager admin who can manage courses, users, and enrollments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                />
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  <strong>Manager Admin Permissions:</strong> Can manage courses, lessons, users, enrollments, and view analytics. Cannot add or remove other admins.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAdmin} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Admin"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Super Admin Info */}
      <Card className="mb-6 border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Super Admin
          </CardTitle>
          <CardDescription>Primary administrator with full access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">{session.user?.name || "Super Admin"}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{SUPER_ADMIN_EMAIL}</span>
              </div>
            </div>
            <Badge className="bg-primary">Super Admin</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Manager Admins */}
      <Card>
        <CardHeader>
          <CardTitle>Manager Admins ({admins.length})</CardTitle>
          <CardDescription>Users with administrative privileges</CardDescription>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No manager admins yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add manager admins to help you manage the platform
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{admin.name || "No name"}</p>
                      <Badge variant="secondary">
                        {admin.email === SUPER_ADMIN_EMAIL ? "Super Admin" : "Manager"}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{admin.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Added {new Date(admin.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {admin.email !== SUPER_ADMIN_EMAIL && (
                    <div className="flex sm:block justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                        disabled={deleting === admin.id}
                        className="w-full sm:w-auto"
                      >
                        {deleting === admin.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
