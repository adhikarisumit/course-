"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { HeroInquiryForm } from "@/components/hero-inquiry-form"

interface InquiryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InquiryModal({ open, onOpenChange }: InquiryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-semibold">Send Inquiry</DialogTitle>
          <DialogDescription>
            Have questions? Fill out the form below and we&apos;ll reach out to you shortly.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <HeroInquiryForm onSuccess={() => setTimeout(() => onOpenChange(false), 3000)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
