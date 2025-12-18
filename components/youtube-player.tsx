"use client"

interface YouTubePlayerProps {
  url: string
  title?: string
  className?: string
}

export function YouTubePlayer({ url, title = "Video", className = "" }: YouTubePlayerProps) {
  // Extract YouTube video ID from various URL formats
  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    return null
  }

  const videoId = getYouTubeId(url)

  if (!videoId) {
    return (
      <div className={`bg-muted rounded-lg flex items-center justify-center p-8 ${className}`}>
        <p className="text-muted-foreground">Invalid YouTube URL</p>
      </div>
    )
  }

  // Show only the video, hide all overlays, title, and controls
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&fs=0&disablekb=1&controls=0&showinfo=0&iv_load_policy=3&autohide=1&playsinline=1`;

  return (
    <div className={`relative w-full ${className}`} style={{ paddingBottom: "56.25%" }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        style={{ border: 0 }}
        // No allowFullScreen, disables fullscreen and 'Watch on YouTube'
      />
      {/* Overlay to block any remaining overlays */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          zIndex: 10,
          pointerEvents: 'none',
          background: 'transparent',
        }}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}
