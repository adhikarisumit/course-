"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { PromoBanner } from "@/components/promo-banner"
import { HeaderAd } from "@/components/ads"

export function HomeClient({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <HeaderAd />
      <PromoBanner />
      {children}
    </div>
  )
}
