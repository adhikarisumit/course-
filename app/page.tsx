"use client"

import { useState } from "react"
import dynamic from 'next/dynamic'
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { MentorIntro } from "@/components/mentor-intro"
import { WhyChooseUs } from "@/components/why-choose-us"
import { Testimonials } from "@/components/testimonials"
import { SuccessMetrics } from "@/components/success-metrics"
import { CTASection } from "@/components/cta-section"

const Footer = dynamic(() => import('@/components/footer').then(mod => ({ default: mod.Footer })), { ssr: true })

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main>
        <Hero />
        <MentorIntro />
        <WhyChooseUs />
        <Testimonials />
        <SuccessMetrics />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

