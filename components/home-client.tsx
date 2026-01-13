"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { PromoBanner } from "@/components/promo-banner"

export function HomeClient({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen">
      <PromoBanner />
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      {children}
    </div>
  )
}
