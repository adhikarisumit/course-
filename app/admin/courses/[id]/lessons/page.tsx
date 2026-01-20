"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2, Plus, ArrowLeft, Trash2, Pencil, Save } from "lucide-react"
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
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<string | null>(null)
  const [editLessonData, setEditLessonData] = useState<{
    title: string
    content: string
    videoUrl: string
    duration: string
    isFree: boolean
  }>({
    title: "",
    content: "",
    videoUrl: "",
    duration: "",
    isFree: false,
  })
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

  const startEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson.id)
    setEditLessonData({
      title: lesson.title,
      content: lesson.content || "",
      videoUrl: lesson.videoUrl || "",
      duration: lesson.duration || "",
      isFree: lesson.isFree,
    })
    setEditDialogOpen(true)
  }

  const cancelEditLesson = () => {
    setEditDialogOpen(false)
    setEditingLesson(null)
    setEditLessonData({
      title: "",
      content: "",
      videoUrl: "",
      duration: "",
      isFree: false,
    })
  }

  const saveEditLesson = async () => {
    if (!editingLesson) return
    if (!editLessonData.title) {
      toast.error("Lesson title is required")
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/lessons/${editingLesson}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editLessonData),
      })

      if (!response.ok) throw new Error("Failed to update lesson")

      const updatedLesson = await response.json()
      setLessons(lessons.map((l) => (l.id === editingLesson ? { ...l, ...updatedLesson } : l)))
      setEditDialogOpen(false)
      setEditingLesson(null)
      setEditLessonData({
        title: "",
        content: "",
        videoUrl: "",
        duration: "",
        isFree: false,
      })
      toast.success("Lesson updated successfully!")
    } catch (error) {
      toast.error("Failed to update lesson")
    } finally {
      setSaving(false)
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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-5xl">
        <div className="mb-6 sm:mb-8">
          <Button asChild variant="ghost" className="mb-2 sm:mb-4 -ml-2 sm:ml-0">
            <Link href="/admin/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 line-clamp-2">{course?.title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage lessons for this course</p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Add New Lesson */}
          <Card className="lg:col-span-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Add New Lesson</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Create a new lesson for this course</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm">Lesson Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Introduction to Components"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm">Lesson Content</Label>
                  <WysiwygEditor
                    value={newLesson.content}
                    onChange={(value) => setNewLesson({ ...newLesson, content: value })}
                    placeholder="Start typing your lesson content here..."
                    minHeight="280px"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {course?.courseType !== "reading" && (
                    <div className="space-y-2">
                      <Label htmlFor="videoUrl" className="text-sm">Video URL (YouTube)</Label>
                      <Input
                        id="videoUrl"
                        placeholder="https://youtu.be/... or YouTube URL"
                        value={newLesson.videoUrl}
                        onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Supports YouTube videos including unlisted videos
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
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <Label htmlFor="isFree" className="text-sm">Free Preview</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">Allow non-enrolled students to view</p>
                  </div>
                  <Switch
                    id="isFree"
                    checked={newLesson.isFree}
                    onCheckedChange={(checked) => setNewLesson({ ...newLesson, isFree: checked })}
                    className="shrink-0"
                  />
                </div>

                <Button onClick={addLesson} disabled={saving} className="w-full text-sm sm:text-base">
                  {saving ? (
                    <>
                      <Loader2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Add Lesson
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Lessons */}
          <div className="lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Lessons ({lessons.length})</h2>
            {lessons.length === 0 ? (
              <Card>
                <CardContent className="py-6 sm:py-8 text-center text-muted-foreground text-sm sm:text-base">
                  No lessons yet. Add your first lesson above.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {lessons.map((lesson) => (
                  <Card key={lesson.id}>
                    <CardContent className="p-3 sm:pt-6 sm:px-6">
                      {/* View Mode */}
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                              Lesson {lesson.order}
                            </span>
                            {lesson.isFree && (
                              <span className="text-[10px] sm:text-xs bg-green-500/10 text-green-700 dark:text-green-400 px-1.5 sm:px-2 py-0.5 rounded">
                                Free Preview
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-semibold mb-1 line-clamp-2">{lesson.title}</h3>
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                            {lesson.duration && (
                              <p className="text-xs sm:text-sm text-muted-foreground">{lesson.duration}</p>
                            )}
                            {lesson.videoUrl && (
                              <p className="text-[10px] sm:text-xs text-muted-foreground">✓ Video</p>
                            )}
                            {lesson.content && (
                              <p className="text-[10px] sm:text-xs text-muted-foreground">✓ Content</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9"
                            onClick={() => startEditLesson(lesson)}
                            title="Edit lesson"
                          >
                            <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 text-destructive hover:text-destructive"
                            onClick={() => deleteLesson(lesson.id)}
                            title="Delete lesson"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Lesson Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={(open) => !open && cancelEditLesson()}>
          <DialogContent className="w-[95vw] sm:max-w-[90vw] lg:max-w-6xl max-h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="px-3 sm:px-6 py-3 sm:py-4 border-b shrink-0">
              <DialogTitle className="text-base sm:text-lg">Edit Lesson</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Update the lesson details below
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Lesson Title *</Label>
                  <Input
                    placeholder="e.g., Introduction to Components"
                    value={editLessonData.title}
                    onChange={(e) => setEditLessonData({ ...editLessonData, title: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Lesson Content</Label>
                  <WysiwygEditor
                    value={editLessonData.content}
                    onChange={(value) => setEditLessonData({ ...editLessonData, content: value })}
                    placeholder="Start typing your lesson content here..."
                    minHeight="250px"
                    isModal={true}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {course?.courseType !== "reading" && (
                    <div className="space-y-2">
                      <Label className="text-sm">Video URL (YouTube)</Label>
                      <Input
                        placeholder="https://youtu.be/... or YouTube URL"
                        value={editLessonData.videoUrl}
                        onChange={(e) => setEditLessonData({ ...editLessonData, videoUrl: e.target.value })}
                        className="text-sm"
                      />
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2">Or upload video file:</p>
                        <UploadButton
                          endpoint="videoUploader"
                          onClientUploadComplete={(res: Array<{ url: string }>) => {
                            if (res?.[0]) {
                              setEditLessonData({ ...editLessonData, videoUrl: res[0].url })
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
                    <Label className="text-sm">{course?.courseType === "reading" ? "Reading Time" : "Duration"}</Label>
                    <Input
                      placeholder={course?.courseType === "reading" ? "e.g., 5 min read" : "e.g., 15 minutes"}
                      value={editLessonData.duration}
                      onChange={(e) => setEditLessonData({ ...editLessonData, duration: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <Label className="text-sm">Free Preview</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">Allow non-enrolled students to view</p>
                  </div>
                  <Switch
                    checked={editLessonData.isFree}
                    onCheckedChange={(checked) => setEditLessonData({ ...editLessonData, isFree: checked })}
                    className="shrink-0"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t shrink-0 flex gap-2">
              <Button variant="outline" onClick={cancelEditLesson} className="flex-1 text-sm">
                Cancel
              </Button>
              <Button onClick={saveEditLesson} disabled={saving} className="flex-1 text-sm">
                {saving ? (
                  <>
                    <Loader2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">Save</span>
                  </>
                ) : (
                  <>
                    <Save className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Save Changes</span>
                    <span className="sm:hidden">Save</span>
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
