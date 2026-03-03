"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Send, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

const JLPT_LEVELS = ["N5 (Beginner)", "N4 (Elementary)", "N3 (Intermediate)", "N2 (Pre-Advanced)", "N1 (Advanced)", "Not Sure"]
const CODING_LEVELS = ["Complete Beginner", "Beginner", "Intermediate", "Advanced", "Not Applicable"]

interface HeroInquiryFormProps {
  onSuccess?: () => void
}

export function HeroInquiryForm({ onSuccess }: HeroInquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    course: "",
    jlptLevel: "",
    codingLevel: "",
    message: "",
  })
  const [courses, setCourses] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Fetch available courses from admin-managed list
  useEffect(() => {
    fetch("/api/inquiry/courses")
      .then((res) => res.json())
      .then((data) => {
        if (data.courses && Array.isArray(data.courses)) {
          setCourses(data.courses)
        }
      })
      .catch(() => {
        // Silently fail - course dropdown will just be empty
      })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to send inquiry")
      }

      toast.success("Your inquiry has been sent successfully! We'll get back to you soon.")
      setIsSubmitted(true)
      setFormData({ name: "", email: "", phone: "", subject: "", course: "", jlptLevel: "", codingLevel: "", message: "" })
      onSuccess?.()

      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <p className="font-medium text-lg">Thank you!</p>
        <p className="text-muted-foreground text-sm">We&apos;ve received your inquiry and will get back to you shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="inquiry-name">Name <span className="text-red-500">*</span></Label>
          <Input
            id="inquiry-name"
            name="name"
            placeholder="Your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inquiry-email">Email <span className="text-red-500">*</span></Label>
          <Input
            id="inquiry-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="inquiry-phone">Phone</Label>
          <Input
            id="inquiry-phone"
            name="phone"
            type="tel"
            placeholder="Your phone number"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inquiry-subject">Subject</Label>
          <Input
            id="inquiry-subject"
            name="subject"
            placeholder="What's this about?"
            value={formData.subject}
            onChange={handleChange}
          />
        </div>
      </div>
      {/* Course Selection */}
      <div className="space-y-1.5">
        <Label>Interested Course</Label>
        <Select value={formData.course} onValueChange={(v) => handleSelectChange("course", v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a course (optional)" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course} value={course}>
                {course}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* JLPT & Coding Level */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>JLPT Level</Label>
          <Select value={formData.jlptLevel} onValueChange={(v) => handleSelectChange("jlptLevel", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Your JLPT level" />
            </SelectTrigger>
            <SelectContent>
              {JLPT_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Coding Level</Label>
          <Select value={formData.codingLevel} onValueChange={(v) => handleSelectChange("codingLevel", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Your coding level" />
            </SelectTrigger>
            <SelectContent>
              {CODING_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="inquiry-message">Message <span className="text-red-500">*</span></Label>
        <Textarea
          id="inquiry-message"
          name="message"
          placeholder="Tell us what you'd like to know..."
          value={formData.message}
          onChange={handleChange}
          required
          rows={4}
          className="resize-none"
        />
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full gap-2 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Inquiry
          </>
        )}
      </Button>
    </form>
  )
}
