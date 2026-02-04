import dynamicImport from "next/dynamic"
import { HomeClient } from "@/components/home-client"
import { Hero } from "@/components/hero"
import { Footer } from "@/components/footer"
import { InArticleAd } from "@/components/ads"

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Lazy load components that are below the fold
const MentorIntro = dynamicImport(() => import("@/components/mentor-intro").then(mod => ({ default: mod.MentorIntro })), {
  loading: () => <div className="min-h-[400px]" />,
})

const WhyChooseUs = dynamicImport(() => import("@/components/why-choose-us").then(mod => ({ default: mod.WhyChooseUs })), {
  loading: () => <div className="min-h-[400px]" />,
})

const Testimonials = dynamicImport(() => import("@/components/testimonials").then(mod => ({ default: mod.Testimonials })), {
  loading: () => <div className="min-h-[400px]" />,
})

const SuccessMetrics = dynamicImport(() => import("@/components/success-metrics").then(mod => ({ default: mod.SuccessMetrics })), {
  loading: () => <div className="min-h-[300px]" />,
})

const CTASection = dynamicImport(() => import("@/components/cta-section").then(mod => ({ default: mod.CTASection })), {
  loading: () => <div className="min-h-[300px]" />,
})

export default function Home() {
  return (
    <HomeClient>
      <main className="space-y-0">
        <Hero />
        <WhyChooseUs />
        <div className="container mx-auto px-4 py-2">
          <InArticleAd />
        </div>
        <MentorIntro />
        <SuccessMetrics />
        <div className="container mx-auto px-4 py-2">
          <InArticleAd />
        </div>
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </HomeClient>
  )
}

