"use client"

import { useState } from "react"
import { Header } from "@/components/header"

export function HomeClient({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      {children}
    </div>
  )
}
