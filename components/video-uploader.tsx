"use client"

import { UploadButton } from "@/lib/uploadthing"
import { toast } from "sonner"

export function VideoUploader({ onUploadComplete }: { onUploadComplete?: (url: string) => void }) {
  return (
    <UploadButton
      endpoint="videoUploader"
      onClientUploadComplete={(res) => {
        if (res?.[0]?.url) {
          toast.success("Video uploaded successfully!")
          onUploadComplete?.(res[0].url)
        }
      }}
      onUploadError={(error: Error) => {
        toast.error(`Upload failed: ${error.message}`)
      }}
    />
  )
}
