# Video Support - YouTube Integration Guide

## Overview
The course platform supports YouTube videos (including unlisted videos) for both course intro/promo videos and lesson content.

## Supported URL Formats

The platform automatically recognizes and embeds the following YouTube URL formats:

### Standard YouTube URLs
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtube.com/watch?v=VIDEO_ID`

### Short YouTube URLs  
- `https://youtu.be/VIDEO_ID`

### Embed URLs
- `https://www.youtube.com/embed/VIDEO_ID`

## Where to Add Videos

### 1. Course Intro/Promo Video
- **Location**: Admin Panel → Courses → Create/Edit Course
- **Field**: "Intro Video URL (YouTube)"
- **Purpose**: Shows on the course detail page as a preview for potential students
- **Visibility**: Public - visible to everyone viewing the course

### 2. Lesson Videos
- **Location**: Admin Panel → Courses → [Course] → Manage Lessons
- **Field**: "Video URL (YouTube)"
- **Purpose**: Main content for each lesson
- **Visibility**: Based on lesson settings (enrolled students or free preview)

## Using Unlisted YouTube Videos

### What are Unlisted Videos?
Unlisted videos are:
- ✅ **Accessible** to anyone with the direct link
- ✅ **Not searchable** on YouTube
- ✅ **Not shown** in your channel's public video list
- ✅ **Perfect** for course content you want to control access to

### How to Create an Unlisted Video

1. **Upload your video** to YouTube (youtube.com/upload)
2. Before publishing, set visibility to **"Unlisted"**:
   - Click on "Save or publish" dropdown
   - Select "Visibility"
   - Choose "Unlisted"
3. **Copy the video link** after upload
4. **Paste it** into your course or lesson video URL field

### Getting the Video URL

**Method 1: From Video Page**
1. Go to your video on YouTube
2. Click the "Share" button
3. Copy the URL (e.g., `https://youtu.be/ABC123xyz`)

**Method 2: From Studio**
1. Go to YouTube Studio
2. Find your video in the Content tab
3. Click the video title to open it
4. Copy the URL from your browser's address bar

## Video Examples

### Course Intro Video
```
Field: Intro Video URL (YouTube)
Example: https://youtu.be/dQw4w9WgXcQ
Result: Displays on course detail page above course description
```

### Lesson Video
```
Field: Video URL (YouTube)
Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Result: Displays in lesson player when students access the lesson
```

## Features

### Automatic Processing
- ✅ Extracts video ID from any supported URL format
- ✅ Creates responsive embedded player
- ✅ Maintains 16:9 aspect ratio
- ✅ Enables fullscreen mode
- ✅ Removes YouTube branding where possible

### Player Settings
The embedded player automatically includes:
- Fullscreen support
- Autoplay disabled (better UX)
- Related videos disabled (`rel=0`)
- Modest branding (`modestbranding=1`)

## Best Practices

### For Course Creators

1. **Use Unlisted for Course Content**
   - Keep lesson videos unlisted for better control
   - Public videos can be discovered outside your platform

2. **Optimize Video Titles**
   - Use clear, descriptive titles
   - Include lesson/module numbers if applicable

3. **Add Video Descriptions**
   - Include timestamps for key topics
   - Add links to resources mentioned
   - Include course website link

4. **Video Quality**
   - Upload in at least 1080p (Full HD)
   - Use clear audio
   - Add subtitles/captions for accessibility

5. **Video Length**
   - Keep lessons focused (5-15 minutes ideal)
   - Break longer content into multiple lessons
   - Add duration in lesson metadata

### For Students

- Videos support all standard YouTube features:
  - Playback speed control
  - Subtitles/captions
  - Quality selection
  - Picture-in-picture mode

## Troubleshooting

### Video Not Displaying?

**Check the URL format:**
- ✅ Correct: `https://youtu.be/VIDEO_ID`
- ✅ Correct: `https://www.youtube.com/watch?v=VIDEO_ID`
- ❌ Wrong: `https://www.youtube.com/watch`
- ❌ Wrong: `youtube.com` (missing https://)

### "Invalid YouTube URL" Error?

**Verify your URL includes:**
1. The `https://` or `http://` protocol
2. A valid 11-character video ID
3. One of the supported domain formats

### Video ID not Recognized?

**The video ID should be 11 characters** containing:
- Letters (a-z, A-Z)
- Numbers (0-9)
- Underscores (_)
- Hyphens (-)

Example: `dQw4w9WgXcQ` ✅

## Alternative: File Upload

If you prefer to host videos yourself:
- Use the "Upload video file" option in lesson creation
- Supports large video files via UploadThing
- Videos hosted securely
- No YouTube account required

## Privacy Considerations

### Unlisted Videos ARE:
- Accessible to anyone with the link
- Embeddable on your course platform
- Trackable via YouTube Analytics

### Unlisted Videos ARE NOT:
- Completely private (anyone with link can share it)
- Password protected
- Hidden from YouTube's systems

### For Maximum Privacy:
Consider hosting videos yourself using the file upload option, or use a private video hosting service.

## Questions?

For technical support or questions about video integration, contact the platform administrator.
