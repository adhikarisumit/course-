"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Users, Search, Mail, Calendar, BookOpen, Key, Copy, Check, Download, CheckCircle, Shield, UserPlus, Eye, EyeOff, Ban } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ChatModalWrapper } from "./chat-modal-wrapper"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import dynamic from "next/dynamic"

function DeleteUserButton({ userId, userRole, currentUserRole, onDeleted }: { userId: string, userRole: string, currentUserRole: string, onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);
  // Allow super admin to delete anyone, admin to delete students only, can't delete super admins
  if (currentUserRole !== "super" && (currentUserRole !== "admin" || userRole === "admin") || userRole === "super") return null;
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("User deleted successfully");
        onDeleted();
      } else {
        const data = await res.json();
        toast.error(data?.error || "Failed to delete user");
      }
    } catch (e) {
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? "Deleting..." : "Delete User"}
    </Button>
  );
}

function EditUserButton({ user, currentUserRole, onUpdated }: { 
  user: User, 
  currentUserRole: string, 
  onUpdated: () => void 
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email,
  });

  // Only allow admins to edit students, and super admins to edit anyone except other super admins
  const canEdit = (currentUserRole === "super" && user.role !== "super") || 
                  (currentUserRole === "admin" && user.role === "student");
  
  if (!canEdit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }

      const data = await response.json();

      if (data.userSignedOut) {
        toast.success(`User details updated successfully! ${user.name || user.email} has been signed out and must sign in again.`);
      } else {
        toast.success("User details updated successfully!");
      }

      setOpen(false);
      onUpdated();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VerifyProfileButton({ userId, userRole, currentUserRole, isVerified, onVerified }: { 
  userId: string, 
  userRole: string, 
  currentUserRole: string, 
  isVerified: boolean,
  onVerified: () => void 
}) {
  const [loading, setLoading] = useState(false);
  
  // Only super admin can verify profiles, and only for students
  if (currentUserRole !== "super" || userRole !== "student") return null;
  
  const handleToggle = async () => {
    setLoading(true);
    try {
      const action = isVerified ? "unverify" : "verify";
      const res = await fetch(`/api/admin/users/${userId}`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      
      if (res.ok) {
        toast.success(`Profile ${isVerified ? "unverified" : "verified"} successfully`);
        onVerified();
      } else {
        const data = await res.json();
        toast.error(data?.error || "Failed to update verification status");
      }
    } catch (e) {
      toast.error("Failed to update verification status");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button 
      variant={isVerified ? "secondary" : "default"} 
      size="sm" 
      onClick={handleToggle} 
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isVerified ? (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Verified
        </>
      ) : (
        <>
          <Shield className="h-4 w-4 mr-2" />
          Verify
        </>
      )}
    </Button>
  );
}

function BanUserButton({ userId, userRole, currentUserRole, isBanned, userName, onBanned }: { 
  userId: string, 
  userRole: string, 
  currentUserRole: string, 
  isBanned: boolean,
  userName: string,
  onBanned: () => void 
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  
  // Only super admin or admin can ban/unban students
  if ((currentUserRole !== "super" && currentUserRole !== "admin") || userRole !== "student") return null;
  
  const handleToggle = async () => {
    setLoading(true);
    try {
      const action = isBanned ? "unban" : "ban";
      const res = await fetch(`/api/admin/users/${userId}`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: banReason })
      });
      
      if (res.ok) {
        toast.success(`User ${isBanned ? "unbanned" : "banned"} successfully`);
        setOpen(false);
        setBanReason("");
        onBanned();
      } else {
        const data = await res.json();
        toast.error(data?.error || "Failed to update ban status");
      }
    } catch (e) {
      toast.error("Failed to update ban status");
    } finally {
      setLoading(false);
    }
  };

  if (isBanned) {
    // Show unban button directly
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleToggle} 
        disabled={loading}
        className="text-green-600 hover:text-green-700 hover:bg-green-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Ban className="h-4 w-4 mr-2" />
            Unban
          </>
        )}
      </Button>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Ban className="h-4 w-4 mr-2" />
          Ban
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Are you sure you want to ban {userName}? They will be immediately logged out and unable to sign in.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ban-reason">Reason for ban (optional)</Label>
            <Input
              id="ban-reason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter reason for banning this user"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleToggle} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Banning...
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Ban User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateUserButton({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    sendCredentials: true,
  });
  const [createdUser, setCreatedUser] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState<"email" | "password" | "both" | null>(null);

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const password = generateRandomPassword();
    setFormData({ ...formData, password });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      toast.success("User account created successfully!");
      
      // Store created credentials for display
      setCreatedUser({
        email: formData.email,
        password: formData.password,
      });
      
      onCreated();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (type: "email" | "password" | "both") => {
    if (!createdUser) return;
    
    let text = "";
    if (type === "email") {
      text = createdUser.email;
    } else if (type === "password") {
      text = createdUser.password;
    } else {
      text = `Email: ${createdUser.email}\nPassword: ${createdUser.password}`;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      sendCredentials: true,
    });
    setCreatedUser(null);
    setCopied(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{createdUser ? "User Created Successfully" : "Create New User"}</DialogTitle>
          <DialogDescription>
            {createdUser 
              ? "The user account has been created. Share these credentials with the user."
              : "Create a new student account. The user will be able to login immediately."
            }
          </DialogDescription>
        </DialogHeader>
        
        {createdUser ? (
          <div className="space-y-4 py-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800 dark:text-green-200">Account Created</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-mono text-sm">{createdUser.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("email")}
                  >
                    {copied === "email" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Password</p>
                    <p className="font-mono text-sm">{createdUser.password}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("password")}
                  >
                    {copied === "password" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => copyToClipboard("both")}
            >
              {copied === "both" ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              Copy All Credentials
            </Button>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
              <Button onClick={resetForm}>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Another
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="create-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-password" className="text-right">
                  Password
                </Label>
                <div className="col-span-3 flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="create-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePassword}
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-1" />
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox
                    id="send-credentials"
                    checked={formData.sendCredentials}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, sendCredentials: checked as boolean })
                    }
                  />
                  <Label htmlFor="send-credentials" className="text-sm font-normal cursor-pointer">
                    Send login credentials via email
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create User
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface User {
  id: string
  name: string | null
  email: string
  role: string
  profileVerified: boolean
  isBanned: boolean
  bannedAt: string | null
  banReason: string | null
  createdAt: string
  image: string | null
  _count: {
    enrollments: number
  }
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [resetting, setResetting] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [copied, setCopied] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    loadUsers()
    loadUnreadCounts()

    // Refresh unread counts every 30 seconds
    const interval = setInterval(loadUnreadCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast.error("Failed to load users")
      }
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCounts = async () => {
    try {
      const response = await fetch("/api/admin/messages/unread-counts")
      if (response.ok) {
        const data = await response.json()
        setUnreadCounts(data.unreadCounts || {})
      }
    } catch (error) {
      console.error("Failed to load unread counts:", error)
    }
  }

  const generateRandomPassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return password
  }

  const handleResetPassword = async (userId: string, userEmail: string) => {
    const password = newPassword || generateRandomPassword()
    setGeneratedPassword(password)
    setResetting(userId)

    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        throw new Error("Failed to reset password")
      }

      toast.success(`Password reset for ${userEmail}`)
      setNewPassword("")
    } catch (error) {
      toast.error("Failed to reset password")
      setGeneratedPassword("")
    } finally {
      setResetting(null)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword)
      setCopied(true)
      toast.success("Password copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy password")
    }
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const studentCount = users.filter(u => u.role === "student" && !u.isBanned).length
  const adminCount = users.filter(u => u.role === "admin").length
  const bannedCount = users.filter(u => u.isBanned).length

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Separate users by role and ban status
  const adminUsers = filteredUsers.filter((user) => user.role === "admin")
  const studentUsers = filteredUsers.filter((user) => user.role === "student" && !user.isBanned)
  const bannedUsers = filteredUsers.filter((user) => user.isBanned)

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">User Management</h1>
          <p className="text-sm md:text-base text-muted-foreground">View and manage all registered users</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <CreateUserButton onCreated={loadUsers} />
          {session?.user?.role === "super" && (
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const response = await fetch("/api/admin/export?type=all-users")
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
                toast.success("Users exported successfully!")
              } catch (error) {
                toast.error("Failed to export users")
              }
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{bannedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List - Tabs for Admins, Students and Banned */}
      <Tabs defaultValue="students" className="w-full mt-4">
        <TabsList>
          <TabsTrigger value="students">Students ({studentUsers.length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({adminUsers.length})</TabsTrigger>
          <TabsTrigger value="banned" className="text-red-500 data-[state=active]:text-red-600">Banned ({bannedUsers.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Students ({studentUsers.length})</CardTitle>
              <CardDescription>List of all student users</CardDescription>
            </CardHeader>
            <CardContent>
              {studentUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No students found</p>
              ) : (
                <div className="space-y-4">
                  {studentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 space-y-1 w-full min-w-0">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                            <AvatarFallback>
                              {user.name
                                ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-medium">{user.name || "No name"}</p>
                          <Badge variant="secondary">student</Badge>
                          {user.isBanned && (
                            <Badge variant="destructive">
                              <Ban className="h-3 w-3 mr-1" />
                              Banned
                            </Badge>
                          )}
                          {user.profileVerified && (
                            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {user._count.enrollments > 0 && (
                            <Badge variant="outline">
                              {user._count.enrollments} course{user._count.enrollments > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground min-w-0">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-stretch sm:items-end w-full sm:w-auto mt-4 sm:mt-0">
                        {/* Reset Password Dialog - only for students or super admin */}
                        {(session?.user?.role === "super" || user.role === "student") && (
                        <Dialog
                          open={dialogOpen && selectedUser?.id === user.id}
                          onOpenChange={(open) => {
                            setDialogOpen(open)
                            if (!open) {
                              setGeneratedPassword("")
                              setNewPassword("")
                              setSelectedUser(null)
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setDialogOpen(true)
                              }}
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Reset Password
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reset Password</DialogTitle>
                              <DialogDescription>
                                Reset password for {user.name || user.email}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              {generatedPassword ? (
                                <div className="space-y-4">
                                  <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                    <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                                      New Password Generated
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <code className="flex-1 p-2 bg-white dark:bg-gray-900 border rounded text-sm font-mono">
                                        {generatedPassword}
                                      </code>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyToClipboard}
                                      >
                                        {copied ? (
                                          <Check className="h-4 w-4" />
                                        ) : (
                                          <Copy className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                                      Make sure to copy this password and share it with the student securely. It won't be shown again.
                                    </p>
                                  </div>
                                  <Button
                                    className="w-full"
                                    onClick={() => {
                                      setDialogOpen(false)
                                      setGeneratedPassword("")
                                      setNewPassword("")
                                      setSelectedUser(null)
                                    }}
                                  >
                                    Close
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="password">New Password (optional)</Label>
                                    <Input
                                      id="password"
                                      type="text"
                                      placeholder="Leave empty to generate random password"
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      If empty, a secure random password will be generated
                                    </p>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setDialogOpen(false)
                                        setNewPassword("")
                                        setSelectedUser(null)
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => handleResetPassword(user.id, user.email)}
                                      disabled={resetting === user.id}
                                    >
                                      {resetting === user.id ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Resetting...
                                        </>
                                      ) : (
                                        "Reset Password"
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        )}
                        {/* Chat and Delete Chat for students */}
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <VerifyProfileButton 
                            userId={user.id} 
                            userRole={user.role} 
                            currentUserRole={session?.user?.role || ""} 
                            isVerified={user.profileVerified}
                            onVerified={loadUsers} 
                          />
                          <BanUserButton 
                            userId={user.id} 
                            userRole={user.role} 
                            currentUserRole={session?.user?.role || ""} 
                            isBanned={user.isBanned}
                            userName={user.name || user.email}
                            onBanned={loadUsers} 
                          />
                          {(session?.user?.role === "super" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) ? (
                            <>
                              <ChatModalWrapper
                                user={{ id: user.id, name: user.name || user.email }}
                                onMessageRead={loadUnreadCounts}
                                trigger={
                                  <Button variant="secondary" size="sm" className="w-full sm:w-auto relative">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Message
                                    {unreadCounts[user.id] > 0 && (
                                      <Badge
                                        variant="destructive"
                                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                      >
                                        {unreadCounts[user.id] > 99 ? "99+" : unreadCounts[user.id]}
                                      </Badge>
                                    )}
                                  </Button>
                                }
                              />
                              <EditUserButton user={user} currentUserRole={session?.user?.role || ""} onUpdated={loadUsers} />
                              <DeleteUserButton userId={user.id} userRole={user.role} currentUserRole={session?.user?.role || ""} onDeleted={loadUsers} />
                            </>
                          ) : (
                            <>
                              <EditUserButton user={user} currentUserRole={session?.user?.role || ""} onUpdated={loadUsers} />
                              <DeleteUserButton userId={user.id} userRole={user.role} currentUserRole={session?.user?.role || ""} onDeleted={loadUsers} />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Admins ({adminUsers.length})</CardTitle>
              <CardDescription>List of all admin users</CardDescription>
            </CardHeader>
            <CardContent>
              {adminUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No admins found</p>
              ) : (
                <div className="space-y-4">
                  {adminUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 space-y-1 w-full min-w-0">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                            <AvatarFallback>
                              {user.name
                                ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-medium">{user.name || "No name"}</p>
                          <Badge variant="default">admin</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground min-w-0">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-stretch sm:items-end w-full sm:w-auto mt-4 sm:mt-0">
                        {/* Reset Password Dialog for admins - only super admin can reset admin passwords */}
                        {session?.user?.role === "super" && (
                        <Dialog
                          open={dialogOpen && selectedUser?.id === user.id}
                          onOpenChange={(open) => {
                            setDialogOpen(open)
                            if (!open) {
                              setGeneratedPassword("")
                              setNewPassword("")
                              setSelectedUser(null)
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setDialogOpen(true)
                              }}
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Reset Password
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reset Password</DialogTitle>
                              <DialogDescription>
                                Reset password for {user.name || user.email}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              {generatedPassword ? (
                                <div className="space-y-4">
                                  <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                    <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                                      New Password Generated
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <code className="flex-1 p-2 bg-white dark:bg-gray-900 border rounded text-sm font-mono">
                                        {generatedPassword}
                                      </code>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyToClipboard}
                                      >
                                        {copied ? (
                                          <Check className="h-4 w-4" />
                                        ) : (
                                          <Copy className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                                      Make sure to copy this password and share it with the admin securely. It won't be shown again.
                                    </p>
                                  </div>
                                  <Button
                                    className="w-full"
                                    onClick={() => {
                                      setDialogOpen(false)
                                      setGeneratedPassword("")
                                      setNewPassword("")
                                      setSelectedUser(null)
                                    }}
                                  >
                                    Close
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="password">New Password (optional)</Label>
                                    <Input
                                      id="password"
                                      type="text"
                                      placeholder="Leave empty to generate random password"
                                      value={newPassword}
                                      onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      If empty, a secure random password will be generated
                                    </p>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setDialogOpen(false)
                                        setNewPassword("")
                                        setSelectedUser(null)
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => handleResetPassword(user.id, user.email)}
                                      disabled={resetting === user.id}
                                    >
                                      {resetting === user.id ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Resetting...
                                        </>
                                      ) : (
                                        "Reset Password"
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        )}
                        <EditUserButton user={user} currentUserRole={session?.user?.role || ""} onUpdated={loadUsers} />
                        <DeleteUserButton userId={user.id} userRole={user.role} currentUserRole={session?.user?.role || ""} onDeleted={loadUsers} />
                        {/* No chat or delete chat for admins */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="banned">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600">Banned Users ({bannedUsers.length})</CardTitle>
              <CardDescription>Users who have been banned from the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {bannedUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No banned users</p>
              ) : (
                <div className="space-y-4">
                  {bannedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50/50 dark:bg-red-950/20"
                    >
                      <div className="flex-1 space-y-1 w-full min-w-0">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                            <AvatarFallback>
                              {user.name
                                ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-medium">{user.name || "No name"}</p>
                          <Badge variant="secondary">{user.role}</Badge>
                          <Badge variant="destructive">
                            <Ban className="h-3 w-3 mr-1" />
                            Banned
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground min-w-0">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                          {user.bannedAt && (
                            <div className="flex items-center gap-1 text-red-600">
                              <Ban className="h-3 w-3" />
                              <span>Banned {new Date(user.bannedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        {user.banReason && (
                          <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                            <span className="font-medium">Reason:</span> {user.banReason}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-stretch sm:items-end w-full sm:w-auto mt-4 sm:mt-0">
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <BanUserButton 
                            userId={user.id} 
                            userRole={user.role} 
                            currentUserRole={session?.user?.role || ""} 
                            isBanned={user.isBanned}
                            userName={user.name || user.email}
                            onBanned={loadUsers} 
                          />
                          <DeleteUserButton userId={user.id} userRole={user.role} currentUserRole={session?.user?.role || ""} onDeleted={loadUsers} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
