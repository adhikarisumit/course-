import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@/auth"

const f = createUploadthing()

export const ourFileRouter = {
  videoUploader: f({ video: { maxFileSize: "512MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error("Unauthorized")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId)
      console.log("File URL:", file.url)
      return { videoUrl: file.url }
    }),

  resourceUploader: f({
    pdf: { maxFileSize: "64MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 }
  })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error("Unauthorized")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Resource upload complete for userId:", metadata.userId)
      console.log("File URL:", file.url)
      return { fileUrl: file.url, fileName: file.name }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
