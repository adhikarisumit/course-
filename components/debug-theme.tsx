"use client"

import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export default function DebugTheme() {
  const { theme, resolvedTheme } = useTheme()
  const [hasClass, setHasClass] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // mark mounted so we only render debug info on the client
    setMounted(true)
    setHasClass(document.documentElement.classList.contains("dark"))
    console.log("DebugTheme mount -> theme:", theme, "resolvedTheme:", resolvedTheme, "htmlHasDarkClass:", document.documentElement.classList.contains("dark"))
  }, [theme, resolvedTheme])

  if (!mounted) return null

  return (
    <div style={{ position: "fixed", right: 8, bottom: 8, zIndex: 9999 }}>
      <div className="p-2 rounded bg-white dark:bg-black text-xs border">Theme: {String(theme)} / {String(resolvedTheme)} / htmlDark: {String(hasClass)}</div>
    </div>
  )
}
