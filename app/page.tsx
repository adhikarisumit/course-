"use client"

import { useState } from "react"
import dynamic from 'next/dynamic'
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"

const MentorIntro = dynamic(() => import('@/components/mentor-intro').then(mod => ({ default: mod.MentorIntro })), { ssr: false })
const WhyChooseUs = dynamic(() => import('@/components/why-choose-us').then(mod => ({ default: mod.WhyChooseUs })), { ssr: false })
const Testimonials = dynamic(() => import('@/components/testimonials').then(mod => ({ default: mod.Testimonials })), { ssr: false })
const SuccessMetrics = dynamic(() => import('@/components/success-metrics').then(mod => ({ default: mod.SuccessMetrics })), { ssr: false })
const CTASection = dynamic(() => import('@/components/cta-section').then(mod => ({ default: mod.CTASection })), { ssr: false })
const Footer = dynamic(() => import('@/components/footer').then(mod => ({ default: mod.Footer })), { ssr: false })

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

