# Video Upload Setup Guide

## 🎥 **3 Ways to Add Videos:**

### **Option 1: YouTube/Vimeo Embed (Easiest - No Setup)**
Simply paste video URLs in Prisma Studio's `videoUrl` field:
- YouTube: `https://www.youtube.com/embed/VIDEO_ID`
- Vimeo: `https://player.vimeo.com/video/VIDEO_ID`

---

### **Option 2: UploadThing (Built-in - 2GB Free)**

**Setup (2 minutes):**

1. **Create Account:**
   - Go to https://uploadthing.com
   - Sign in with GitHub

2. **Create App:**
   - Click "Create a new app"
   - Name it: `course-platform`
   - Copy your API keys

3. **Add Keys to `.env`:**
```env
UPLOADTHING_SECRET="sk_live_xxxxxxxxxxxxx"
UPLOADTHING_APP_ID="xxxxxxxxxxxxx"
```

4. **Usage in Prisma Studio:**
   - After uploading via the app, copy the URL
   - Paste in lesson's `videoUrl` field

**Free Tier:**
- Storage: 2 GB
- Uploads: Unlimited
- Max file: 512 MB per video

**How to Upload:**
- Go to http://localhost:3000/admin/upload
- Click upload button
- Select video file
- Copy the URL generated

---

### **Option 3: Cloudinary (Alternative - 25GB Free)**

**Setup:**

1. Go to https://cloudinary.com
2. Sign up for free account
3. Get your credentials from dashboard

4. Add to `.env`:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Free Tier:**
- Storage: 25 GB
- Bandwidth: 25 GB/month
- Max file: 100 MB

---

## 📝 **Quick Guide: Add Video to Lesson**

### **Using YouTube (Recommended for Beginners):**

1. Upload your video to YouTube
2. Go to video → Click "Share" → "Embed"
3. Copy embed URL: `https://www.youtube.com/embed/dQw4w9WgXcQ`
4. Open Prisma Studio: http://localhost:5556
5. Go to "Lesson" table → Select your lesson
6. Paste URL in `videoUrl` field
7. Save!

### **Using UploadThing:**

1. Make sure `.env` has your UploadThing keys
2. Create admin page or use the VideoUploader component
3. Upload video
4. Copy generated URL
5. Paste in Prisma Studio's `videoUrl` field

---

## 🔧 **Video Uploader Component Available**

Already created at: `components/video-uploader.tsx`

Use in any admin page:
```tsx
import { VideoUploader } from "@/components/video-uploader"

<VideoUploader 
  onUploadComplete={(url) => {
    console.log("Video uploaded:", url)
    // Save URL to database
  }} 
/>
```

---

## 💡 **Recommendation:**

For quick start: **Use YouTube** - It's free, unlimited, handles streaming, and works immediately.

For more control: **Use UploadThing** - Free tier is generous, and uploads are integrated into your app.

