"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

export default function CreateCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    category: "",
    level: "beginner",
    duration: "",
    price: "",
    isPaid: false,
    isPublished: true,
    accessDurationMonths: "6",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: formData.isPaid ? parseFloat(formData.price) : 0,
          accessDurationMonths: parseInt(formData.accessDurationMonths) || 6,
        }),
      })

      if (!response.ok) throw new Error("Failed to create course")

      const data = await response.json()
      toast.success("Course created successfully!")
      router.push(`/admin/courses/${data.id}/lessons`)
    } catch (error) {
      toast.error("Failed to create course")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/admin/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
          <p className="text-muted-foreground">Add a new course to your platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>Fill in the details for your new course</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g., Introduction to React"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  required
                  placeholder="Describe what students will learn in this course..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Video URL */}
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Intro Video URL (YouTube)</Label>
                <Input
                  id="videoUrl"
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Optional - Add a YouTube video URL (supports unlisted videos). Students will see this as a course preview.
                </p>
              </div>

              {/* Category and Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Web Development"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 10 hours"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Optional - e.g., "10 hours", "5 weeks"</p>
              </div>

              {/* Access Duration */}
              <div className="space-y-2">
                <Label htmlFor="accessDurationMonths">Access Duration (Months) *</Label>
                <Input
                  id="accessDurationMonths"
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="6"
                  value={formData.accessDurationMonths}
                  onChange={(e) => setFormData({ ...formData, accessDurationMonths: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">How many months students can access this course after enrollment</p>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isPaid">Paid Course</Label>
                    <p className="text-sm text-muted-foreground">Enable to charge for this course</p>
                  </div>
                  <Switch
                    id="isPaid"
                    checked={formData.isPaid}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPaid: checked })}
                  />
                </div>

                {formData.isPaid && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (JPY) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="1"
                      min="0"
                      required={formData.isPaid}
                      placeholder="5000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Enter price in Japanese Yen (¥)</p>
                  </div>
                )}
              </div>

              {/* Published */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isPublished">Publish Course</Label>
                  <p className="text-sm text-muted-foreground">Make this course visible to students</p>
                </div>
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Course
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
