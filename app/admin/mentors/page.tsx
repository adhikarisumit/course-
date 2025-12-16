"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Plus, Edit, Trash2, Users, Award, Star } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface Mentor {
  id: string
  name: string
  role: string
  company: string | null
  bio: string
  image: string | null
  expertise: string
  experience: string | null
  achievements: string | null
  socialLinks: string | null
  isActive: boolean
  displayOrder: number
  totalStudents: number
  totalCourses: number
  rating: number
  createdAt: string
  updatedAt: string
}

interface MentorFormData {
  name: string
  role: string
  company: string
  bio: string
  image: string
  expertise: string
  experience: string
  achievements: string
  socialLinks: string
  isActive: boolean
  displayOrder: number
  totalStudents: number
  totalCourses: number
  rating: number
}

const initialFormData: MentorFormData = {
  name: "",
  role: "",
  company: "",
  bio: "",
  image: "",
  expertise: "",
  experience: "",
  achievements: "",
  socialLinks: "",
  isActive: true,
  displayOrder: 0,
  totalStudents: 0,
  totalCourses: 0,
  rating: 5.0,
}

export default function AdminMentorsPage() {
  const [loading, setLoading] = useState(true)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null)
  const [formData, setFormData] = useState<MentorFormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadMentors()
  }, [])

  const loadMentors = async () => {
    try {
      const response = await fetch("/api/admin/mentors")
      if (response.ok) {
        const data = await response.json()
        setMentors(data)
      } else {
        toast.error("Failed to load mentors")
      }
    } catch (error) {
      toast.error("Failed to load mentors")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingMentor
        ? `/api/admin/mentors/${editingMentor.id}`
        : "/api/admin/mentors"

      const response = await fetch(url, {
        method: editingMentor ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save mentor")

      toast.success(editingMentor ? "Mentor updated successfully" : "Mentor created successfully")
      setDialogOpen(false)
      setEditingMentor(null)
      setFormData(initialFormData)
      loadMentors()
    } catch (error) {
      toast.error("Failed to save mentor")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (mentor: Mentor) => {
    setEditingMentor(mentor)
    setFormData({
      name: mentor.name,
      role: mentor.role,
      company: mentor.company || "",
      bio: mentor.bio,
      image: mentor.image || "",
      expertise: mentor.expertise,
      experience: mentor.experience || "",
      achievements: mentor.achievements || "",
      socialLinks: mentor.socialLinks || "",
      isActive: mentor.isActive,
      displayOrder: mentor.displayOrder,
      totalStudents: mentor.totalStudents,
      totalCourses: mentor.totalCourses,
      rating: mentor.rating,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mentor?")) return

    try {
      const response = await fetch(`/api/admin/mentors/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete mentor")

      toast.success("Mentor deleted successfully")
      loadMentors()
    } catch (error) {
      toast.error("Failed to delete mentor")
    }
  }

  const handleNewMentor = () => {
    setEditingMentor(null)
    setFormData(initialFormData)
    setDialogOpen(true)
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Manage Mentors</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Add and manage educational mentors displayed on the homepage
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewMentor} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Mentor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMentor ? "Edit Mentor" : "Add New Mentor"}</DialogTitle>
              <DialogDescription>
                {editingMentor ? "Update mentor information" : "Create a new mentor profile"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    placeholder="e.g., Senior Educator"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company/Organization</Label>
                <Input
                  id="company"
                  placeholder="e.g., Independent Educator"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Profile Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio/Introduction *</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  placeholder="Brief introduction about the mentor..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expertise">Areas of Expertise *</Label>
                <Input
                  id="expertise"
                  placeholder="e.g., Web Development, Data Science, UI/UX Design"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  placeholder="e.g., 10+ years in education technology"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="achievements">Key Achievements (comma-separated)</Label>
                <Textarea
                  id="achievements"
                  rows={2}
                  placeholder="Achievement 1, Achievement 2, Achievement 3"
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialLinks">Social Links (JSON format)</Label>
                <Textarea
                  id="socialLinks"
                  rows={2}
                  placeholder='{"linkedin": "url", "twitter": "url"}'
                  value={formData.socialLinks}
                  onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalStudents">Total Students</Label>
                  <Input
                    id="totalStudents"
                    type="number"
                    min="0"
                    value={formData.totalStudents}
                    onChange={(e) => setFormData({ ...formData, totalStudents: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalCourses">Total Courses</Label>
                  <Input
                    id="totalCourses"
                    type="number"
                    min="0"
                    value={formData.totalCourses}
                    onChange={(e) => setFormData({ ...formData, totalCourses: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5.0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingMentor ? "Update" : "Create"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mentors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mentors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mentors.filter(m => m.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(mentors.reduce((acc, m) => acc + m.rating, 0) / (mentors.length || 1)).toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mentors List */}
      <Card>
        <CardHeader>
          <CardTitle>All Mentors</CardTitle>
          <CardDescription>Manage mentor profiles and information</CardDescription>
        </CardHeader>
        <CardContent>
          {mentors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No mentors found. Add your first mentor to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {mentors.map((mentor) => (
                <Card key={mentor.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {mentor.image ? (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={mentor.image}
                            alt={mentor.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold truncate">{mentor.name}</h3>
                            <p className="text-sm text-muted-foreground">{mentor.role}</p>
                            {mentor.company && (
                              <p className="text-xs text-muted-foreground">{mentor.company}</p>
                            )}
                          </div>
                          <Badge variant={mentor.isActive ? "default" : "secondary"}>
                            {mentor.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{mentor.bio}</p>

                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="bg-muted/50 p-2 rounded">
                        <div className="text-lg font-semibold">{mentor.totalStudents}</div>
                        <div className="text-xs text-muted-foreground">Students</div>
                      </div>
                      <div className="bg-muted/50 p-2 rounded">
                        <div className="text-lg font-semibold">{mentor.totalCourses}</div>
                        <div className="text-xs text-muted-foreground">Courses</div>
                      </div>
                      <div className="bg-muted/50 p-2 rounded">
                        <div className="text-lg font-semibold">{mentor.rating}</div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(mentor)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(mentor.id)}
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
    </div>
  )
}
