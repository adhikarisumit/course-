"use client"

function DeleteUserButton({ userId, userRole, onDeleted }: { userId: string, userRole: string, onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);
  if (userRole === "super") return null;
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
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Users, Search, Mail, Calendar, BookOpen, Key, Copy, Check, Download } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ChatModalWrapper } from "./chat-modal-wrapper"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import dynamic from "next/dynamic"
const DeleteStudentChatButton = dynamic(() => import("./delete-student-chat-button"), { ssr: false });

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
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

  useEffect(() => {
    loadUsers()
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

  const studentCount = users.filter(u => u.role === "student").length
  const adminCount = users.filter(u => u.role === "admin").length

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Separate users by role
  const adminUsers = filteredUsers.filter((user) => user.role === "admin")
  const studentUsers = filteredUsers.filter((user) => user.role === "student")

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">User Management</h1>
          <p className="text-sm md:text-base text-muted-foreground">View and manage all registered users</p>
        </div>
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
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
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

      {/* Users List - Tabs for Admins and Students */}
      <Tabs defaultValue="students" className="w-full mt-4">
        <TabsList>
          <TabsTrigger value="students">Students ({studentUsers.length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({adminUsers.length})</TabsTrigger>
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
                          <p className="font-medium">{user.name || "No name"}</p>
                          <Badge variant="secondary">student</Badge>
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
                        {/* Reset Password Dialog */}
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
                        {/* Chat and Delete Chat for students */}
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          {(session?.user?.role === "super" || session?.user?.email === "sumitadhikari2341@gmail.com") ? (
                            <>
                              <ChatModalWrapper
                                user={{ id: user.id, name: user.name || user.email }}
                                trigger={
                                  <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Message
                                  </Button>
                                }
                              />
                              <DeleteStudentChatButton userId={user.id} userName={user.name || user.email} />
                              <DeleteUserButton userId={user.id} userRole={user.role} onDeleted={loadUsers} />
                            </>
                          ) : (
                            <DeleteUserButton userId={user.id} userRole={user.role} onDeleted={loadUsers} />
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
                        {/* Reset Password Dialog for admins */}
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
                        {/* Only super admin can message admins */}
                        {(session?.user?.role === "super" || session?.user?.email === "sumitadhikari2341@gmail.com") && (
                          <ChatModalWrapper
                            user={{ id: user.id, name: user.name || user.email }}
                            trigger={
                              <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                                <Mail className="h-4 w-4 mr-2" />
                                Message
                              </Button>
                            }
                          />
                        )}
                        {/* No chat or delete chat for admins */}
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
