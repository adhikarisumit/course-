"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2, Plus, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { UploadButton } from "@/lib/uploadthing"
import { WysiwygEditor } from "@/components/wysiwyg-editor"

interface Lesson {
  id: string
  title: string
  order: number
  isFree: boolean
  videoUrl: string | null
  content: string | null
  duration: string | null
}

export default function ManageLessonsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [newLesson, setNewLesson] = useState({
    title: "",
    content: "",
    videoUrl: "",
    duration: "",
    isFree: false,
  })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${id}`)
      if (!response.ok) throw new Error("Failed to load course")
      const data = await response.json()
      setCourse(data)
      setLessons(data.lessons || [])
    } catch (error) {
      toast.error("Failed to load course")
    } finally {
      setLoading(false)
    }
  }

  const addLesson = async () => {
    if (!newLesson.title) {
      toast.error("Lesson title is required")
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/courses/${id}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newLesson,
          order: lessons.length + 1,
        }),
      })

      if (!response.ok) throw new Error("Failed to add lesson")

      const lesson = await response.json()
      setLessons([...lessons, lesson])
      setNewLesson({ title: "", content: "", videoUrl: "", duration: "", isFree: false })
      toast.success("Lesson added successfully!")
    } catch (error) {
      toast.error("Failed to add lesson")
    } finally {
      setSaving(false)
    }
  }

  const deleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete lesson")

      setLessons(lessons.filter((l) => l.id !== lessonId))
      toast.success("Lesson deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete lesson")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/admin/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">{course?.title}</h1>
          <p className="text-muted-foreground">Manage lessons for this course</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Add New Lesson */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Add New Lesson</CardTitle>
              <CardDescription>Create a new lesson for this course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Lesson Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Introduction to Components"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Lesson Content</Label>
                  <WysiwygEditor
                    value={newLesson.content}
                    onChange={(value) => setNewLesson({ ...newLesson, content: value })}
                    placeholder="Start typing your lesson content here..."
                    minHeight="350px"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course?.courseType !== "reading" && (
                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">Video URL (YouTube)</Label>
                      <Input
                        id="videoUrl"
                        placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                        value={newLesson.videoUrl}
                        onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Supports YouTube videos including unlisted videos. Example: https://youtu.be/VIDEO_ID
                      </p>
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2">Or upload video file:</p>
                        <UploadButton
                          endpoint="videoUploader"
                          onClientUploadComplete={(res: Array<{ url: string }>) => {
                            if (res?.[0]) {
                              setNewLesson({ ...newLesson, videoUrl: res[0].url })
                              toast.success("Video uploaded successfully!")
                            }
                          }}
                          onUploadError={(error: Error) => {
                            toast.error(`Upload failed: ${error.message}`)
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="duration">{course?.courseType === "reading" ? "Reading Time" : "Duration"}</Label>
                    <Input
                      id="duration"
                      placeholder={course?.courseType === "reading" ? "e.g., 5 min read" : "e.g., 15 minutes"}
                      value={newLesson.duration}
                      onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isFree">Free Preview</Label>
                    <p className="text-sm text-muted-foreground">Allow non-enrolled students to view</p>
                  </div>
                  <Switch
                    id="isFree"
                    checked={newLesson.isFree}
                    onCheckedChange={(checked) => setNewLesson({ ...newLesson, isFree: checked })}
                  />
                </div>

                <Button onClick={addLesson} disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Lesson
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Lessons */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Lessons ({lessons.length})</h2>
            {lessons.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No lessons yet. Add your first lesson above.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <Card key={lesson.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              Lesson {lesson.order}
                            </span>
                            {lesson.isFree && (
                              <span className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                                Free Preview
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold mb-1">{lesson.title}</h3>
                          {lesson.duration && (
                            <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                          )}
                          {lesson.videoUrl && (
                            <p className="text-xs text-muted-foreground mt-1">✓ Video attached</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteLesson(lesson.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
