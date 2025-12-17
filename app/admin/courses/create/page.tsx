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
import { Loader2, ArrowLeft, Plus, Video, Calendar } from "lucide-react"
import Link from "next/link"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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
    courseType: "recorded",
    meetingLink: "",
    meetingPlatform: "zoom",
    scheduledStartTime: "",
    scheduledEndTime: "",
    isRecurring: false,
    recurringSchedule: "",
  })
  
  const [features, setFeatures] = useState<string[]>([])
  const [learningPoints, setLearningPoints] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: any = {
        ...formData,
        price: formData.isPaid ? parseFloat(formData.price) : 0,
        accessDurationMonths: parseInt(formData.accessDurationMonths) || 6,
        features: JSON.stringify(features),
        whatYouWillLearn: JSON.stringify(learningPoints),
      }

      // Add live course specific fields
      if (formData.courseType === "live") {
        payload.scheduledStartTime = formData.scheduledStartTime ? new Date(formData.scheduledStartTime).toISOString() : null
        payload.scheduledEndTime = formData.scheduledEndTime ? new Date(formData.scheduledEndTime).toISOString() : null
      } else {
        // Clear live course fields for recorded courses
        payload.meetingLink = null
        payload.meetingPlatform = null
        payload.scheduledStartTime = null
        payload.scheduledEndTime = null
        payload.isRecurring = false
        payload.recurringSchedule = null
      }

      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
              {/* Course Type */}
              <div className="space-y-3">
                <Label>Course Type *</Label>
                <RadioGroup 
                  value={formData.courseType} 
                  onValueChange={(value) => setFormData({ ...formData, courseType: value })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4 flex-1 cursor-pointer hover:bg-accent" onClick={() => setFormData({ ...formData, courseType: "recorded" })}>
                    <RadioGroupItem value="recorded" id="recorded" />
                    <Label htmlFor="recorded" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Video className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Recorded Course</div>
                        <div className="text-xs text-muted-foreground">Pre-recorded video lessons</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 flex-1 cursor-pointer hover:bg-accent" onClick={() => setFormData({ ...formData, courseType: "live" })}>
                    <RadioGroupItem value="live" id="live" />
                    <Label htmlFor="live" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Calendar className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Live Course</div>
                        <div className="text-xs text-muted-foreground">Scheduled live sessions</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

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
                  placeholder={formData.courseType === "live" ? "e.g., 2 hours" : "e.g., 10 hours"}
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.courseType === "live" 
                    ? "Duration of each live session (e.g., '2 hours')" 
                    : "Total course duration (e.g., '10 hours', '5 weeks')"}
                </p>
              </div>

              {/* Live Course Fields */}
              {formData.courseType === "live" && (
                <>
                  <div className="border rounded-lg p-4 space-y-4 bg-accent/50">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Live Session Details
                    </h3>

                    {/* Meeting Platform */}
                    <div className="space-y-2">
                      <Label htmlFor="meetingPlatform">Meeting Platform *</Label>
                      <Select 
                        value={formData.meetingPlatform} 
                        onValueChange={(value) => setFormData({ ...formData, meetingPlatform: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zoom">Zoom</SelectItem>
                          <SelectItem value="google-meet">Google Meet</SelectItem>
                          <SelectItem value="teams">Microsoft Teams</SelectItem>
                          <SelectItem value="custom">Custom Platform</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Meeting Link */}
                    <div className="space-y-2">
                      <Label htmlFor="meetingLink">Meeting Link *</Label>
                      <Input
                        id="meetingLink"
                        required={formData.courseType === "live"}
                        placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                        value={formData.meetingLink}
                        onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the meeting link for your live sessions
                      </p>
                    </div>

                    {/* Schedule */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scheduledStartTime">Start Date & Time *</Label>
                        <Input
                          id="scheduledStartTime"
                          type="datetime-local"
                          required={formData.courseType === "live"}
                          value={formData.scheduledStartTime}
                          onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scheduledEndTime">End Date & Time *</Label>
                        <Input
                          id="scheduledEndTime"
                          type="datetime-local"
                          required={formData.courseType === "live"}
                          value={formData.scheduledEndTime}
                          onChange={(e) => setFormData({ ...formData, scheduledEndTime: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Recurring */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="isRecurring">Recurring Session</Label>
                          <p className="text-sm text-muted-foreground">Enable for weekly/monthly sessions</p>
                        </div>
                        <Switch
                          id="isRecurring"
                          checked={formData.isRecurring}
                          onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                        />
                      </div>

                      {formData.isRecurring && (
                        <div className="space-y-2">
                          <Label htmlFor="recurringSchedule">Recurring Schedule</Label>
                          <Input
                            id="recurringSchedule"
                            placeholder="e.g., Every Monday at 7 PM, Weekly on Tuesdays"
                            value={formData.recurringSchedule}
                            onChange={(e) => setFormData({ ...formData, recurringSchedule: e.target.value })}
                          />
                          <p className="text-xs text-muted-foreground">
                            Describe the recurring schedule (e.g., "Every Monday at 7 PM")
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

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

              {/* What You'll Learn */}
              <div className="space-y-3">
                <Label>What You&apos;ll Learn (Course Overview)</Label>
                <p className="text-sm text-muted-foreground">Add learning points shown in course overview</p>
                <div className="space-y-2">
                  {learningPoints.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={point}
                        onChange={(e) => {
                          const newPoints = [...learningPoints]
                          newPoints[index] = e.target.value
                          setLearningPoints(newPoints)
                        }}
                        placeholder="e.g., Master the fundamental concepts"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setLearningPoints(learningPoints.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLearningPoints([...learningPoints, ""])}
                  >
                    Add Learning Point
                  </Button>
                </div>
              </div>

              {/* Course Features */}
              <div className="space-y-3">
                <Label>What&apos;s Included (Course Features)</Label>
                <p className="text-sm text-muted-foreground">Add features/benefits shown on enrollment page</p>
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...features]
                          newFeatures[index] = e.target.value
                          setFeatures(newFeatures)
                        }}
                        placeholder="e.g., Lifetime access, Certificate of completion"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFeatures(features.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFeatures([...features, ""])}
                  >
                    Add Feature
                  </Button>
                </div>
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
